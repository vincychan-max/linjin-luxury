import { NextResponse } from 'next/server';
import { getPayPalAccessToken } from '../../../../lib/paypal';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const { paypalOrderId } = await req.json();

    if (!paypalOrderId) {
      return NextResponse.json({ success: false, error: "Missing PayPal Order ID" }, { status: 400 });
    }

    // 1. 获取数据库中的订单信息，校验其是否存在且未支付
    const { data: dbOrder, error: lookupError } = await supabaseAdmin
      .from('orders')
      .select('id, status, total')
      .eq('paypal_order_id', paypalOrderId)
      .single();

    if (lookupError || !dbOrder) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // 如果订单已经是 paid 状态，直接返回（幂等处理）
    if (dbOrder.status === 'paid' || dbOrder.status === 'completed') {
      return NextResponse.json({ success: true, message: "Order already paid" });
    }

    // 2. 发起捕获请求
    const accessToken = await getPayPalAccessToken();
    const baseUrl = (process.env.PAYPAL_API_BASE_URL || 'https://api-m.paypal.com').replace(/\/$/, "");

    const response = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `cap_${paypalOrderId}` // 保持幂等，防止多次扣款
      },
    });

    const captureData = await response.json();

    // 3. 处理已捕获或捕获失败的情况
    const isAlreadyCaptured = captureData.details?.[0]?.issue === 'ORDER_ALREADY_CAPTURED';
    
    if (!response.ok && !isAlreadyCaptured) {
      console.error("PayPal Capture Rejected:", captureData);
      return NextResponse.json({ success: false, error: "Payment failed at gateway" }, { status: 400 });
    }

    // 4. 严苛的金额校验（安全防线）
    // 从 PayPal 返回的详情中获取实际支付金额
    const captureAmount = parseFloat(
      (captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value) || 
      (captureData.purchase_units?.[0]?.amount?.value) || "0"
    );

    // 校验实际支付金额是否与数据库记录的 total 一致（允许微小浮点误差，或严格相等）
    if (Math.abs(captureAmount - parseFloat(dbOrder.total.toString())) > 0.01) {
      console.error(`金额篡改预警: 数据库 ${dbOrder.total} vs PayPal ${captureAmount}`);
      return NextResponse.json({ success: false, error: "Security validation failed: Amount mismatch" }, { status: 403 });
    }

    // 5. 更新订单状态 (使用 .eq('status', 'pending') 确保原子性)
    const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || 'manual_sync';
    
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ 
        status: 'paid', // 建议直接更新为 'paid'，避免手动处理过渡状态
        paypal_capture_id: captureId,
        updated_at: new Date().toISOString()
      })
      .eq('id', dbOrder.id)
      .eq('status', 'pending'); // 只有处于 pending 的订单才能更新为 paid

    if (updateError) {
      console.error("Database update failed:", updateError);
      return NextResponse.json({ success: false, error: "Database synchronization failed" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      dbOrderId: dbOrder.id,
      message: "Order successfully paid" 
    });

  } catch (err: any) {
    console.error("Critical Capture Error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}