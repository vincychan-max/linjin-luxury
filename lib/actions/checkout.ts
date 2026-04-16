'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const PAYPAL_API = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

export async function processPayPalCheckout(
  orderNumber: string,
  cart: any[],
  address: any,
  subtotal: number,
  shipping: number,
  total: number
) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Please log in' };

    // 1. 仅检查库存，不扣除（扣除交给 Webhook）
    const productIds = cart.map(item => item.product_id || item.id);
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, stock, name')
      .in('id', productIds);

    for (const item of cart) {
      const p = products?.find(dbP => dbP.id === (item.product_id || item.id));
      if (!p || p.stock < item.quantity) {
        return { success: false, message: `Stock insufficient for ${item.name}` };
      }
    }

    // 2. 创建 PayPal 订单（略过 Token 获取部分，复用你之前的逻辑）
    const auth = Buffer.from(`${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
    const tokenRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      body: 'grant_type=client_credentials',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const { access_token } = await tokenRes.json();

    const paypalRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: orderNumber,
          amount: { currency_code: 'USD', value: total.toFixed(2) }
        }]
      })
    });
    const paypalOrder = await paypalRes.json();

    // 3. 插入 Pending 订单到数据库
    await supabaseAdmin.from('orders').insert({
      user_id: user.id,
      paypal_order_id: paypalOrder.id,
      items: cart,
      address,
      total: parseFloat(total.toFixed(2)),
      status: 'pending'
    });

    return { 
      success: true, 
      url: paypalOrder.links.find((l: any) => l.rel === 'approve' || l.rel === 'payer-action')?.href,
      orderId: paypalOrder.id 
    };

  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

/**
 * Webhook 调用：单点真理执行者
 */
export async function fulfillPayPalOrder(paypalOrderId: string, webhookEventId: string) {
  try {
    // 调用第一步写的 RPC
    const { data, error } = await supabaseAdmin.rpc('fulfill_order_safely', {
      p_paypal_order_id: paypalOrderId,
      p_webhook_event_id: webhookEventId
    });

    if (error || !data.success) {
      console.error("Fulfillment RPC Failed:", error || data.message);
      return { success: false, message: data?.message || 'Transaction failed' };
    }

    // 支付成功后清空购物车
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('user_id')
      .eq('paypal_order_id', paypalOrderId)
      .single();

    if (order?.user_id) {
      await supabaseAdmin.from('cart_items').delete().eq('user_id', order.user_id);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}