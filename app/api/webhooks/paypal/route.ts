// app/api/webhooks/paypal/route.ts
import { NextResponse } from 'next/server';
import { fulfillPayPalOrder } from '@/lib/actions/checkout';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!;

const baseUrl = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const { access_token } = await res.json();
  return access_token;
}

async function verifyWebhookSignature(req: Request): Promise<boolean> {
  const rawBody = await req.text();
  const headers = Object.fromEntries(req.headers);
  const accessToken = await getPayPalAccessToken();

  const verifyRes = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transmission_id: headers['paypal-transmission-id'],
      transmission_time: headers['paypal-transmission-time'],
      cert_url: headers['paypal-cert-url'],
      auth_algo: headers['paypal-auth-algo'],
      transmission_sig: headers['paypal-transmission-sig'],
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(rawBody),
    }),
  });

  const { verification_status } = await verifyRes.json();
  return verification_status === 'SUCCESS';
}

export async function POST(req: Request) {
  if (!PAYPAL_WEBHOOK_ID) {
    console.error('PAYPAL_WEBHOOK_ID not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  // 1. 验证签名（防伪造）
  const isValid = await verifyWebhookSignature(req);
  if (!isValid) {
    console.error('❌ Webhook signature verification failed!');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = await req.json();

  // 2. 只处理支付完成事件
  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const paypalOrderId = event.resource.order_id || event.resource.id;

    console.log(`📨 Webhook received payment: ${paypalOrderId}`);

    // 3. 调用 fulfill 函数（自动确认订单）
    const result = await fulfillPayPalOrder(paypalOrderId);

    if (!result.success) {
      console.error(`⚠️ Webhook fulfill failed: ${result.message}`);
    } else {
      console.log(`✅ Webhook order fulfilled: ${paypalOrderId}`);
    }
  }

  return NextResponse.json({ received: true });
}