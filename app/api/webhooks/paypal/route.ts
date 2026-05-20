import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化管理员权限客户端 (必须使用 service_role key 以绕过 RLS 保证后台任务执行)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!;
const baseUrl = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// 简单 Token 缓存（生产环境建议在后续优化中引入 Redis）
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

  if (!res.ok) throw new Error(`Failed to get PayPal token: ${res.status}`);

  const { access_token, expires_in } = await res.json();
  cachedToken = access_token;
  // 提前 5 分钟刷新以防临界值误差
  tokenExpiry = Date.now() + (expires_in - 300) * 1000;

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
  // 1. 安全配置检查
  if (!PAYPAL_WEBHOOK_ID) {
    console.error('PAYPAL_WEBHOOK_ID is not configured');
    return NextResponse.json({ error: 'Config error' }, { status: 500 });
  }

  // 2. 读取并解析 Body (确保获取 rawBody 用于签名校验)
  let rawBody: string;
  let event: any;
  try {
    rawBody = await req.text();
    event = JSON.parse(rawBody);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 3. 签名验证 (阻断恶意请求)
  const isValid = await verifyWebhookSignature(req, rawBody);
  if (!isValid) {
    console.error('❌ Webhook signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // 4. 事件路由与处理
  // 只处理我们关心的支付成功事件
  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED' || event.event_type === 'CHECKOUT.ORDER.COMPLETED') {
    
    // 鲁棒的 Order ID 提取逻辑 (兼容 PayPal 不同格式)
    const resource = event.resource;
    const paypalOrderId = resource?.supplementary_data?.related_ids?.order_id || 
                          resource?.order_id || 
                          resource?.id || 
                          '';

    if (paypalOrderId) {
      console.log(`📨 Processing Webhook: ${event.event_type} | Order: ${paypalOrderId}`);

      // 调用原子 SQL RPC 处理业务逻辑
      // 内部包含：行锁、状态机检查、幂等性记录
      const { data, error } = await supabaseAdmin.rpc('process_paypal_webhook', {
        p_paypal_order_id: paypalOrderId,
        p_event_id: event.id,
        p_event_type: event.event_type
      });

      if (error) {
        console.error('Database RPC Error:', error);
        // 如果数据库层报错，返回 500 让 PayPal 稍后重试
        return NextResponse.json({ error: 'Database processing failed' }, { status: 500 });
      }

      console.log(`✅ Webhook Result: ${data.message}`);
    }
  }

  // 5. 始终返回 200 OK
  // 必须返回 200，即使是“已处理”或“忽略”的事件，否则 PayPal 会因为收不到响应而持续重试
  return NextResponse.json({ received: true }, { status: 200 });
}