// lib/paypal.ts  —— 推荐最终优化版（直接替换）
export async function getPayPalAccessToken() {
  const baseUrl = process.env.PAYPAL_API_BASE_URL || process.env.PAYPAL_API_URL;
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;

  if (!baseUrl) {
    throw new Error("❌ 缺少 PAYPAL_API_BASE_URL，请在 .env.local 中设置 https://api-m.paypal.com");
  }
  if (!clientId) {
    throw new Error("❌ 缺少 PAYPAL_CLIENT_ID 或 NEXT_PUBLIC_PAYPAL_CLIENT_ID");
  }
  if (!clientSecret) {
    throw new Error("❌ 缺少 PAYPAL_SECRET，请检查 .env.local");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("PayPal Token Error Response:", errorText);   // 更详细日志
    throw new Error(`PayPal Token 请求失败: ${response.status} - ${errorText.slice(0, 300)}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("PayPal 返回的 Token 为空");
  }

  return data.access_token;
}