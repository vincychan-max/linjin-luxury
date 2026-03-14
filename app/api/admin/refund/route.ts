import { NextRequest } from 'next/server';

async function getPayPalAccessToken() {
  const apiBaseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.paypal.com'; // 默认生产端点，用于上线

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch(`${apiBaseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const { access_token } = await res.json();
  return access_token;
}

export async function POST(req: NextRequest) {
  const apiBaseUrl = process.env.PAYPAL_API_BASE_URL || 'https://api-m.paypal.com'; // 默认生产端点，用于上线

  const { captureId, amount } = await req.json();

  const accessToken = await getPayPalAccessToken();

  const refundRes = await fetch(
    `${apiBaseUrl}/v2/payments/captures/${captureId}/refund`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: { value: amount.toFixed(2), currency_code: 'USD' },
      }),
    }
  );

  if (!refundRes.ok) {
    const err = await refundRes.json();
    return Response.json({ error: err.message || 'Refund failed' }, { status: 400 });
  }

  return Response.json({ success: true });
}