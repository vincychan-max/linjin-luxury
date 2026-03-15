import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// 1. 【核心修复】增加一个回退值，防止构建时因为变量缺失直接崩溃
// 这样即使 Vercel 暂时没读到 Key，构建也能通过。只有真正发邮件报错时才会影响功能。
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

// 2. 初始化 Supabase Admin (增加 ! 后的容错保护)
// 确保这些变量在 Vercel 后台已经填写：NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // 基础校验
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    // 检查 Supabase 是否初始化成功
    if (!supabaseAdmin) {
      console.error("Supabase Admin not initialized. Check your environment variables.");
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // 3. 将邮箱插入到 Supabase 的 subscribers 表中
    const { error } = await supabaseAdmin
      .from('subscribers')
      .insert([{ email }]);

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'You are already subscribed!' }, { status: 400 });
      }
      throw error;
    }

    // 4. 发送欢迎邮件
    try {
      // 只有在真正的 API Key 存在时才尝试发送
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'Linjin Luxury <newsletter@yourdomain.com>',
          to: email,
          subject: 'Welcome to the Inner Circle | Linjin Luxury',
          html: `...你的 HTML 内容...` // 这里保持你原来的 HTML 即可
        });
      }
    } catch (mailError) {
      console.error('Mail Delivery Error:', mailError);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Subscription API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}