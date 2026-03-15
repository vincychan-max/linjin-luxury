import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// 初始化 Resend，增加构建时的回退保护
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

// 初始化 Supabase Admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // 基础邮箱格式校验
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    // 检查数据库连接状态
    if (!supabaseAdmin) {
      console.error("Supabase Admin not initialized. Check your environment variables.");
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // 1. 将订阅者信息存入 Supabase 数据库
    const { error } = await supabaseAdmin
      .from('subscribers')
      .insert([{ email }]);

    if (error) {
      // 处理重复订阅的情况 (PostgreSQL 错误码 23505 表示唯一性冲突)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'You are already subscribed!' }, { status: 400 });
      }
      throw error;
    }

    // 2. 发送欢迎邮件 (基于已验证的 linjinluxury.com 域名)
    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          // 使用您在 Resend 后台已验证的域名进行发送
          from: 'Linjin Luxury <newsletter@linjinluxury.com>', 
          to: email,
          subject: 'Welcome to the Inner Circle | Linjin Luxury',
          html: `
            <div style="background-color: #000; color: #fff; padding: 50px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center;">
              <h1 style="letter-spacing: 0.4em; text-transform: uppercase; font-weight: 200; margin-bottom: 20px;">LINJIN LUXURY</h1>
              <p style="color: #888; font-style: italic; font-size: 16px; margin-bottom: 40px;">"The inner circle of premium supply chain insights and luxury design."</p>
              
              <div style="border-top: 1px solid #333; border-bottom: 1px solid #333; padding: 30px 0; margin: 30px auto; max-width: 400px;">
                <p style="font-size: 14px; letter-spacing: 0.1em; line-height: 1.8;">
                  Thank you for joining us. You will now be the first to receive updates on our latest collections and exclusive supply chain breakthroughs.
                </p>
              </div>
              
              <p style="font-size: 11px; color: #444; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 40px;">
                Los Angeles &bull; Singapore &bull; Thailand &bull; China
              </p>
            </div>
          `
        });
      }
    } catch (mailError) {
      // 邮件发送失败不应导致整个订阅流程中断，仅记录错误
      console.error('Mail Delivery Error:', mailError);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Subscription API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}