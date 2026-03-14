'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ==================== 从独立类型文件导入 ====================
import type { CartItem, Address } from '@/types/checkout';

// PayPal 基础配置
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

/**
 * 获取 PayPal Access Token
 */
async function getPayPalAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    throw new Error('PayPal credentials are missing');
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal Auth Failed: ${errorText}`);
  }
  
  const data = await response.json();
  return data.access_token;
}

/**
 * 主支付流程 Server Action
 */
export async function processPayPalCheckout(
  orderNumber: string,
  cart: CartItem[],
  address: Address,
  subtotal: number,
  shipping: number,
  tax: number,
  discount: number,
  total: number
) {
  const supabase = await createClient();

  try {
    // 1. 获取用户信息与权限校验
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Please log in to complete checkout.' };

    // 2. 数据库库存扣减 (循环执行 RPC)
    for (const item of cart) {
      const { data: rpcResult, error: rpcError } = await supabase.rpc('deduct_stock', {
        p_id: item.product_id || item.id,
        p_quantity: item.quantity,
      });

      if (rpcError) {
        console.error('Stock Deduction Error:', rpcError);
        return { success: false, message: `Stock Error: ${rpcError.message}` };
      }
    }

    // 3. 金额严格校准 (防止 PayPal 400 错误)
    // 强制转换为 2 位小数，并重新计算总价以匹配 PayPal 的 breakdown 校验
    const fSubtotal = parseFloat(subtotal.toFixed(2));
    const fShipping = parseFloat(shipping.toFixed(2));
    const fTax = parseFloat(tax.toFixed(2));
    const fDiscount = parseFloat(discount.toFixed(2));
    const fTotal = parseFloat((fSubtotal + fShipping + fTax - fDiscount).toFixed(2));

    // 4. 调用 PayPal API 创建订单
    const accessToken = await getPayPalAccessToken();
    const paypalResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: orderNumber,
          amount: {
            currency_code: 'USD',
            value: fTotal.toString(), 
            breakdown: {
              item_total: { currency_code: 'USD', value: fSubtotal.toString() },
              shipping: { currency_code: 'USD', value: fShipping.toString() },
              tax_total: { currency_code: 'USD', value: fTax.toString() },
              discount: { currency_code: 'USD', value: fDiscount.toString() },
            }
          },
          shipping: {
            name: { full_name: address.name },
            address: {
              address_line_1: address.street,
              admin_area_2: address.city,
              admin_area_1: address.state,
              postal_code: address.zip,
              country_code: 'US' // 测试环境建议固定 US
            }
          }
        }],
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
          shipping_preference: 'SET_PROVIDED_ADDRESS',
          user_action: 'PAY_NOW',
        }
      }),
    });

    const paypalOrder = await paypalResponse.json();
    
    if (!paypalOrder.id) {
      console.error('PayPal Order Creation Failed:', JSON.stringify(paypalOrder, null, 2));
      return { 
        success: false, 
        message: `PayPal Error: ${paypalOrder.details?.[0]?.description || paypalOrder.message || 'Validation failed'}` 
      };
    }

    // 5. 保存本地订单记录 (关键点：RLS 开启状态下 user_id 必须匹配)
    const { error: insertError } = await supabase.from('orders').insert({
      user_id: user.id,
      paypal_order_id: paypalOrder.id,
      items: cart, // Supabase 表字段需为 jsonb
      address: address, // Supabase 表字段需为 jsonb
      subtotal: fSubtotal,
      shipping: fShipping,
      tax: fTax,
      discount: fDiscount,
      total: fTotal,
      status: 'pending',
    });

    if (insertError) {
      console.error('Database Order Save Error:', insertError);
      return { 
        success: false, 
        message: `Database Error: ${insertError.message}. Ensure RLS policies are set.` 
      };
    }

    // 6. 获取跳转链接
    const approveUrl = paypalOrder.links?.find((link: any) => link.rel === 'approve')?.href;

    if (approveUrl) {
      return { success: true, url: approveUrl };
    } else {
      return { success: false, message: 'Could not retrieve PayPal approval URL.' };
    }

  } catch (err: any) {
    console.error('Final Checkout Action Error:', err);
    return { success: false, message: err.message || 'System error during checkout.' };
  }
}

/**
 * 订单履行 (Webhook 或 支付成功回调调用)
 */
export async function fulfillPayPalOrder(paypalOrderId: string) {
  const supabase = await createClient();

  try {
    const { data: existing, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, user_id')
      .eq('paypal_order_id', paypalOrderId)
      .single();

    if (fetchError || !existing) return { success: false, message: 'Order record not found.' };
    if (existing.status === 'paid') return { success: true, message: 'Order already fulfilled.' };

    // 更新订单状态为已支付
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'paid', 
        updated_at: new Date().toISOString() 
      })
      .eq('paypal_order_id', paypalOrderId);

    if (updateError) throw updateError;

    // 清空用户购物车记录
    await supabase.from('cart_items').delete().eq('user_id', existing.user_id);

    revalidatePath('/my-orders');
    return { success: true, message: 'Order completed successfully.' };

  } catch (err: any) {
    console.error('Fulfill Order Error:', err);
    return { success: false, message: err.message };
  }
}