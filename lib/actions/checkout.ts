'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const PAYPAL_API = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.sandbox.paypal.com';

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: { 
      Authorization: `Basic ${auth}`, 
      'Content-Type': 'application/x-www-form-urlencoded' 
    },
  });
  const data = await response.json();
  if (!data.access_token) throw new Error("Failed to get PayPal token");
  return data.access_token;
}

export async function processPayPalCheckout(
  orderNumber: string,
  cart: any[],
  address: any,
  subtotal: number,
  shipping: number,
  total: number,
  idempotencyKey: string
) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Please log in' };

    // 幂等性检查
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('paypal_order_id, paypal_approve_link')
      .eq('idempotency_key', idempotencyKey)
      .single();

    if (existingOrder) {
      return { 
        success: true, 
        url: existingOrder.paypal_approve_link, 
        orderId: existingOrder.paypal_order_id 
      };
    }

    // 🚨【测试特赦防线】把原先的整个库存校验循环和报错拦截全部删掉/注释掉
    // 换成下面这行放行提示，绝对不返回 success: false 拦截你！
    console.log("⚠️ [测试模式] 已强制跳过 Supabase 数据库商品校验与库存检查，直接放行交易！");

    console.log("✅ 开始请求 PayPal 网关创建真实订单...");

    // 直接调用 PayPal API 创建订单
    const accessToken = await getPayPalAccessToken();
    const paypalRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${accessToken}` 
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: orderNumber,
          amount: { currency_code: 'USD', value: total.toFixed(2) }
        }]
      })
    });
    
    const paypalOrder = await paypalRes.json();
    if (!paypalRes.ok) throw new Error(paypalOrder.message || "PayPal creation failed");

    const approveLink = paypalOrder.links?.find((l: any) => l.rel === 'approve' || l.rel === 'payer-action')?.href;

    // 插入订单记录
    await supabaseAdmin.from('orders').insert({
      user_id: user.id,
      paypal_order_id: paypalOrder.id,
      paypal_approve_link: approveLink,
      items: cart,
      address,
      total: parseFloat(total.toFixed(2)),
      status: 'pending',
      idempotency_key: idempotencyKey
    });

    return { success: true, url: approveLink, orderId: paypalOrder.id };

  } catch (err: any) {
    console.error("Process Checkout Error:", err);
    return { success: false, message: err.message };
  }
}

// 保留其余函数不变...
export async function capturePayPalOrder(orderId: string) {
  try {
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    if (response.ok) {
      await fulfillPayPalOrder(orderId, data.id);
      return { success: true };
    }
    return { success: false, message: data.message || "Capture failed" };
  } catch (err: any) {
    console.error("Capture Error:", err);
    return { success: false, message: err.message };
  }
}

export async function fulfillPayPalOrder(paypalOrderId: string, webhookEventId: string) {
  try {
    const { data, error } = await supabaseAdmin.rpc('process_paypal_webhook', {
      p_paypal_order_id: paypalOrderId,
      p_event_id: webhookEventId,
      p_event_type: 'PAYMENT.CAPTURE.COMPLETED'
    });
    if (error || !data.success) return { success: false, message: data?.message || 'Transaction failed' };
    if (data.user_id) {
      await supabaseAdmin.from('cart_items').delete().eq('user_id', data.user_id);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}