import { NextResponse } from 'next/server';
import { getPayPalAccessToken } from '../../../../lib/paypal';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const { paypalOrderId } = await req.json();

    // 1. 获取令牌
    const accessToken = await getPayPalAccessToken();
    const baseUrl = (process.env.PAYPAL_API_BASE_URL || 'https://api-m.paypal.com').replace(/\/$/, "");

    // 2. 发起捕获请求
    const response = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        // 关键：这里使用 PayPal 要求的幂等 Key
        'PayPal-Request-Id': `cap_${paypalOrderId}` 
      },
    });

    const captureData = await response.json();

    // 3. 状态判定
    if (!response.ok) {
      // 允许“已捕获”的报错通过，说明动作已经完成了
      if (captureData.details?.[0]?.issue !== 'ORDER_ALREADY_CAPTURED') {
        return NextResponse.json({ success: false, error: "PayPal Capture Rejected" }, { status: 400 });
      }
    }

    const dbOrderId = captureData.purchase_units?.[0]?.reference_id;

    // 4. 【重要修改】这里不再改为 PAID，而是改为 COMPLETED_AT_GATEWAY
    // 真正的库存扣减和 PAID 状态由 Webhook 异步完成
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ 
        status: 'verifying_payment', // 状态：网关已过，等待 Webhook 最终确认
        paypal_capture_id: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', dbOrderId)
      .eq('status', 'pending'); // 只有 pending 状态能被修改，防止覆盖 paid 状态

    return NextResponse.json({ 
      success: true, 
      dbOrderId,
      message: "Capture sent. Awaiting final webhook confirmation." 
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}