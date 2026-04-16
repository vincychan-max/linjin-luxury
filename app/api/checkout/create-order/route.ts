import { NextResponse } from 'next/server';
import { getPayPalAccessToken } from '../../../../lib/paypal';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const { items, address, userId } = await req.json();

    // 基础校验
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your selection is empty" }, { status: 400 });
    }

    // 1. 获取最新价格与库存 (生产级安全校验)
    // 兼容不同的 ID 格式逻辑
    const productIds = items.map((item: any) => 
      item.product_id || (typeof item.id === 'string' ? item.id.split('|')[0] : item.id)
    ).filter(Boolean);

    const { data: dbProducts, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, price, stock, name')
      .in('id', productIds);

    if (fetchError || !dbProducts) {
      console.error("Supabase Inventory Fetch Error:", fetchError);
      return NextResponse.json({ error: "Unable to verify current pricing/stock" }, { status: 500 });
    }

    // 2. 严密的金额计算与库存检查
    let subtotal = 0;
    const paypalItems: any[] = [];

    for (const item of items) {
      const productId = item.product_id || (typeof item.id === 'string' ? item.id.split('|')[0] : item.id);
      const dbProduct = dbProducts.find((p: any) => p.id === productId);

      if (!dbProduct) {
        return NextResponse.json({ error: `Product ${item.name} is no longer available` }, { status: 400 });
      }

      // 生产级：校验库存
      if (dbProduct.stock < (item.quantity || 1)) {
        return NextResponse.json({ error: `Insufficient stock for ${dbProduct.name}` }, { status: 400 });
      }

      const price = parseFloat(dbProduct.price.toString());
      const quantity = Math.max(1, parseInt(item.quantity || "1"));
      
      subtotal += price * quantity;

      paypalItems.push({
        name: dbProduct.name || item.name,
        quantity: quantity.toString(),
        unit_amount: { 
          currency_code: "USD", 
          value: price.toFixed(2) 
        },
        sku: item.id.toString(),
      });
    }

    // 运费建议从后端配置或地址逻辑计算，避免前端篡改
    const shipping = 50.00; 
    const tax = 0.00;
    const total = subtotal + shipping + tax;

    if (total < 0.01) {
      return NextResponse.json({ error: "Order total invalid" }, { status: 400 });
    }

    // 3. 在 Supabase 创建预订单 (Pending 状态)
    const { data: dbOrder, error: dbErr } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId || null,
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping: shipping,
        tax: tax,
        total: parseFloat(total.toFixed(2)),
        status: 'pending',
        address: address,
        items: items, // 存储原始快照
        paypal_order_id: null,
      })
      .select()
      .single();

    if (dbErr) {
      console.error("Database Order Entry Failed:", dbErr);
      return NextResponse.json({ error: "Internal order system error" }, { status: 500 });
    }

    // 4. 调用 PayPal API 创建正式订单
    const accessToken = await getPayPalAccessToken();
    
    // 修复 fetch failed 的关键：确保环境变量解析正确
    const baseUrl = (process.env.PAYPAL_API_BASE_URL || 'https://api-m.paypal.com').replace(/\/$/, "");

    const paypalBody = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: dbOrder.id.toString(),
        amount: {
          currency_code: 'USD',
          value: total.toFixed(2),
          breakdown: {
            item_total: { currency_code: 'USD', value: subtotal.toFixed(2) },
            shipping: { currency_code: 'USD', value: shipping.toFixed(2) },
            tax_total: { currency_code: 'USD', value: tax.toFixed(2) }
          }
        },
        items: paypalItems,
      }],
      application_context: {
        brand_name: "L'ÉTOILE LUXURY",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      }
    };

    // 增加超时保护的 Fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时

    const paypalResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(paypalBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const paypalOrder = await paypalResponse.json();

    if (!paypalResponse.ok) {
      console.error("PayPal API Rejection:", paypalOrder);
      // 如果 PayPal 失败，清理掉刚刚生成的无效订单记录
      await supabaseAdmin.from('orders').delete().eq('id', dbOrder.id);
      
      return NextResponse.json({ 
        error: "Gateway rejection", 
        details: paypalOrder.message || "PayPal could not process this request" 
      }, { status: paypalResponse.status });
    }

    // 5. 将 PayPal ID 关联到数据库订单
    await supabaseAdmin
      .from('orders')
      .update({ paypal_order_id: paypalOrder.id })
      .eq('id', dbOrder.id);

    // 寻找支付跳转链接 (兼容不同环境返回)
    const approveLink = paypalOrder.links?.find((link: any) => 
      link.rel === 'approve' || link.rel === 'payer-action'
    )?.href;

    return NextResponse.json({ 
      id: paypalOrder.id,
      approveLink: approveLink,
      dbOrderId: dbOrder.id 
    });

  } catch (err: any) {
    console.error("Critical Checkout Error:", err);
    return NextResponse.json({ 
      error: err.name === 'AbortError' ? "Payment gateway timeout" : "Internal server error" 
    }, { status: 500 });
  }
}