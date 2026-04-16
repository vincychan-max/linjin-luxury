import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || 'orders@linjinluxury.com'; // 建议使用自有域名邮箱
    
    // 🔒 安全校验：防止外部恶意调用 (需要在 .env 设一个 SECRET_TOKEN)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 验证必要参数
    if (!body.email || !body.trackingNumber || !body.orderNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `LINJIN LUXURY <${fromEmail}>`, // 增加发件人名称，提升专业感
        to: [body.email],
        subject: `SHIPPED: Your Order #${body.orderNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <div style="background-color: #000000; padding: 50px 20px; text-align: center;">
                  <h1 style="color: #ffffff; font-size: 24px; font-weight: 200; letter-spacing: 10px; text-transform: uppercase; margin: 0;">LINJIN</h1>
                </div>
                
                <div style="padding: 50px 30px; border: 1px solid #eeeeee; border-top: none;">
                  <div style="display: inline-block; padding: 4px 12px; background-color: #f5f5f5; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px; color: #666;">
                    Shipping Confirmation
                  </div>
                  
                  <h2 style="font-size: 20px; font-weight: 300; letter-spacing: 1px; margin-bottom: 25px; text-transform: uppercase; color: #000;">Your journey begins.</h2>
                  
                  <p style="font-size: 14px; color: #333; margin-bottom: 20px;">Dear Valued Client,</p>
                  <p style="font-size: 14px; color: #333; line-height: 1.8; margin-bottom: 30px;">
                    We are pleased to inform you that your curated selection from <strong>LINJIN LUXURY</strong> has been meticulously inspected, packed, and is now en route to your destination.
                  </p>
                  
                  <div style="margin: 40px 0; padding: 35px; border: 1px solid #000000; background-color: #fdfdfd;">
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 10px;">Tracking Number</div>
                    <div style="font-size: 22px; font-family: 'Courier New', Courier, monospace; font-weight: bold; color: #000; letter-spacing: 1px;">
                      ${body.trackingNumber}
                    </div>
                    <div style="margin-top: 20px; border-top: 1px solid #eeeeee; pt-15px; padding-top: 15px;">
                      <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #888;">Carrier:</span> 
                      <span style="font-size: 13px; font-weight: 600; margin-left: 10px; text-transform: uppercase;">${body.carrier || 'Global Express'}</span>
                    </div>
                  </div>

                  <p style="font-size: 12px; color: #999; line-height: 1.6;">
                    Please note that tracking information may take up to 24 hours to reflect on the carrier's platform. For bespoke inquiries, reply to this email.
                  </p>
                </div>

                <div style="text-align: center; padding: 40px 20px; font-size: 10px; color: #bbb; letter-spacing: 1px;">
                  &copy; 2026 LINJIN LUXURY. ALL RIGHTS RESERVED.<br>
                  <span style="margin-top: 10px; display: block;">SINGAPORE | NEW YORK | VIETNAM</span>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const result = await res.json();
    
    if (!res.ok) {
      console.error("❌ Resend Error:", result);
      return NextResponse.json({ error: result }, { status: res.status });
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error: any) {
    console.error("❌ API Crash:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}