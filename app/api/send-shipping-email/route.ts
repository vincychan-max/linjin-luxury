import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

    console.log("👉 准备向 Resend 发送请求:", body.email);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [body.email],
        subject: `SHIPPED: Your LINJIN LUXURY Order #${body.orderNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                .email-container {
                  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                  max-width: 600px;
                  margin: 0 auto;
                  color: #1a1a1a;
                  line-height: 1.6;
                }
                .header {
                  padding: 40px 0;
                  text-align: center;
                  background-color: #000;
                }
                .logo {
                  color: #ffffff;
                  font-size: 28px;
                  font-weight: 200;
                  letter-spacing: 8px;
                  text-transform: uppercase;
                  margin: 0;
                }
                .content {
                  padding: 40px 20px;
                  border: 1px solid #e5e5e5;
                  border-top: none;
                }
                .status-badge {
                  display: inline-block;
                  padding: 5px 15px;
                  background-color: #f0f0f0;
                  font-size: 11px;
                  letter-spacing: 2px;
                  text-transform: uppercase;
                  margin-bottom: 20px;
                }
                h1 {
                  font-size: 22px;
                  font-weight: 300;
                  letter-spacing: 1px;
                  margin-bottom: 30px;
                  text-transform: uppercase;
                }
                .tracking-box {
                  margin: 30px 0;
                  padding: 30px;
                  border: 1px solid #000;
                  background-color: #fafafa;
                }
                .label {
                  font-size: 10px;
                  text-transform: uppercase;
                  letter-spacing: 2px;
                  color: #888;
                  margin-bottom: 8px;
                }
                .tracking-number {
                  font-size: 20px;
                  font-family: 'Courier New', Courier, monospace;
                  font-weight: bold;
                  color: #000;
                }
                .footer {
                  text-align: center;
                  padding: 30px;
                  font-size: 11px;
                  color: #999;
                  letter-spacing: 1px;
                }
              </style>
            </head>
            <body>
              <div class="email-container">
                <div class="header">
                  <h1 class="logo">LINJIN</h1>
                </div>
                <div class="content">
                  <div class="status-badge">Shipping Confirmation</div>
                  <h1>Your journey begins.</h1>
                  <p>Dear Valued Client,</p>
                  <p>We are pleased to inform you that your curated selection from <strong>LINJIN LUXURY</strong> has been meticulously inspected, packed, and is now en route to your destination.</p>
                  
                  <div class="tracking-box">
                    <div class="label">Tracking Number</div>
                    <div class="tracking-number">${body.trackingNumber}</div>
                    <div style="margin-top: 15px;">
                      <span class="label">Carrier:</span> 
                      <span style="font-size: 13px; font-weight: 500;">${body.carrier || 'Premium Logistics'}</span>
                    </div>
                  </div>

                  <p style="font-size: 14px; color: #555;">Please note that tracking information may take up to 24 hours to update on the carrier's platform.</p>
                </div>
                <div class="footer">
                  &copy; 2026 LINJIN LUXURY. ALL RIGHTS RESERVED.<br>
                  PARIS | MILAN | NEW YORK | LONDON
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const result = await res.json();
    
    if (!res.ok) {
      console.error("❌ Resend 报错:", result);
      return NextResponse.json({ error: result }, { status: res.status });
    }

    console.log("✅ 邮件发送成功:", result);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("❌ API 崩溃:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}