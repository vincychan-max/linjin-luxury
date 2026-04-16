// app/api/webhooks/paypal/route.ts
import { NextResponse } from 'next/server';
import { fulfillPayPalOrder } from '@/lib/actions/checkout';

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!;

const baseUrl = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// 简单 Token 缓存（生产建议换成 Redis）
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getPayPalAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString('base64');

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    throw new Error(`Failed to get PayPal token: ${res.status}`);
  }

  const { access_token, expires_in } = await res.json();
  cachedToken = access_token;
  tokenExpiry = Date.now() + (expires_in - 120) * 1000; // 提前2分钟过期

  return access_token;
}

async function verifyWebhookSignature(req: Request, rawBody: string): Promise<boolean> {
  try {
    const headers = Object.fromEntries(req.headers);
    const accessToken = await getPayPalAccessToken();

    const verifyRes = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
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

    const result = await verifyRes.json();
    return result.verification_status === 'SUCCESS';
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return false;
  }
}

export async function POST(req: Request) {
  if (!PAYPAL_WEBHOOK_ID) {
    console.error('PAYPAL_WEBHOOK_ID not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  // === 关键修复 1：只读取一次 body ===
  let rawBody: string;
  let event: any;

  try {
    rawBody = await req.text();
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error('Invalid webhook payload:', err);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // === 验证签名 ===
  const isValid = await verifyWebhookSignature(req, rawBody);
  if (!isValid) {
    console.error('❌ Webhook signature verification failed!');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  console.log(`📨 PayPal Webhook: ${event.event_type} | ID: ${event.id}`);

  // === 关键修复 2：添加幂等性处理 ===
  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED' || 
      event.event_type === 'CHECKOUT.ORDER.COMPLETED') {

    const paypalOrderId = event.resource?.order_id || 
                         event.resource?.id || 
                         event.resource?.parent_payment || '';

    if (!paypalOrderId) {
      return NextResponse.json({ received: true });
    }

    // 使用 event.id 做幂等检查（推荐在 fulfillPayPalOrder 内部实现）
    const result = await fulfillPayPalOrder(paypalOrderId, event.id);

    if (result.success) {
      console.log(`✅ Order fulfilled: ${paypalOrderId}`);
    } else {
      console.error(`⚠️ Fulfill failed for ${paypalOrderId}: ${result.message}`);
      // 注意：即使 fulfill 失败，也要返回 200，否则 PayPal 会无限重试
    }
  }

  // 必须返回 2xx，告诉 PayPal 已成功接收
  return NextResponse.json({ received: true });
}