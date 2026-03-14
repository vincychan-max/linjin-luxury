import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// 1. 初始化 Resend (请确保在 Vercel 环境变量中添加了 RESEND_API_KEY)
const resend = new Resend(process.env.RESEND_API_KEY);

// 2. 初始化 Supabase Admin
// 使用 SERVICE_ROLE_KEY 是为了确保即使开启了 RLS 也能正常写入订阅者数据
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // 基础校验：确保邮箱格式基本正确
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    // 3. 将邮箱插入到 Supabase 的 subscribers 表中
    const { error } = await supabaseAdmin
      .from('subscribers')
      .insert([{ email }]);

    if (error) {
      // 如果错误代码是 '23505'，表示该邮箱在数据库中已存在 (Unique Constraint)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'You are already subscribed!' }, { status: 400 });
      }
      throw error;
    }

    // 4. 发送欢迎邮件 (自动化营销)
    // 使用独立 try-catch 确保即使邮件发送失败，用户在前端也能看到订阅成功
    try {
      await resend.emails.send({
        from: 'Linjin Luxury <newsletter@yourdomain.com>', // 上线前需在 Resend 验证你的域名
        to: email,
        subject: 'Welcome to the Inner Circle | Linjin Luxury',
        html: `
          <div style="font-family: serif; max-width: 600px; margin: auto; padding: 50px; text-align: center; border: 1px dashed #000;">
            <h1 style="letter-spacing: 0.3em; text-transform: uppercase;">Linjin Luxury</h1>
            <p style="font-style: italic; margin: 30px 0;">Thank you for joining us.</p>
            <p style="color: #333; line-height: 1.6;">You are now among the first to receive exclusive access to our latest collections, private events, and limited-edition releases.</p>
            <div style="margin-top: 40px;">
              <a href="https://yourdomain.com" style="background: #000; color: #fff; padding: 15px 30px; text-decoration: none; font-size: 12px; letter-spacing: 0.2em; display: inline-block;">DISCOVER THE COLLECTION</a>
            </div>
            <p style="margin-top: 50px; font-size: 10px; color: #999; text-transform: uppercase;">
              Los Angeles &bull; Singapore &bull; Thailand
            </p>
          </div>
        `
      });
    } catch (mailError) {
      console.error('Mail Delivery Error:', mailError);
      // 仅记录日志，不向用户抛出错误
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Subscription API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}