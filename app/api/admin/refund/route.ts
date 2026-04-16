import { NextRequest } from 'next/server';

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const apiBaseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.paypal.com';

  if (!clientId || !clientSecret) {
    throw new Error('Missing PayPal credentials');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${apiBaseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    // 增加缓存控制，防止 token 请求被某些 CDN 缓存
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`PayPal Auth Failed: ${errorData.error_description || res.statusText}`);
  }

  const { access_token } = await res.json();
  return access_token;
}

export async function POST(req: NextRequest) {
  try {
    const apiBaseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.paypal.com';
    const { captureId, amount, orderId } = await req.json();

    // 1. 基础校验
    if (!captureId || typeof amount !== 'number') {
      return Response.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();

    // 2. 发起退款请求
    const refundRes = await fetch(
      `${apiBaseUrl}/v2/payments/captures/${captureId}/refund`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          // ✅ 关键：幂等性请求头，防止重复退款
          // 使用 captureId 或 orderId 作为唯一标识
          'PayPal-Request-Id': `refund_${captureId}`, 
        },
        body: JSON.stringify({
          amount: { 
            value: amount.toFixed(2), 
            currency_code: 'USD' 
          },
          // 建议增加备注，方便在 PayPal 后台对账
          note_to_payer: "Refund from LINJIN LUXURY Atelier",
        }),
      }
    );

    const data = await refundRes.json();

    if (!refundRes.ok) {
      console.error('PayPal Refund Error:', data);
      return Response.json({ 
        error: data.message || 'Refund processing failed',
        details: data.details 
      }, { status: refundRes.status });
    }

    return Response.json({ 
      success: true, 
      refundId: data.id, 
      status: data.status 
    });

  } catch (error: any) {
    console.error('API Route Error:', error.message);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}