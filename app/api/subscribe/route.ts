import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: Request) {
  try {
    const { email, source = 'website_footer' } = await request.json(); // 🌟 记录订阅来源

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // 1. 存入 Supabase
    const { error } = await supabaseAdmin
      .from('subscribers')
      .insert([{ 
        email, 
        source, // 🌟 区分来源
        subscribed_at: new Date().toISOString() 
      }]);

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'You are already in our inner circle.' }, { status: 400 });
      }
      throw error;
    }

    // 2. 发送欢迎邮件
    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'LINJIN LUXURY <newsletter@linjinluxury.com>', 
          to: email,
          subject: 'Welcome to the Inner Circle | LINJIN LUXURY',
          html: `
            <div style="background-color: #ffffff; color: #000; padding: 60px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center; border: 1px solid #eee;">
              <h1 style="letter-spacing: 0.5em; text-transform: uppercase; font-weight: 200; margin-bottom: 30px; font-size: 24px;">LINJIN LUXURY</h1>
              
              <div style="max-width: 450px; margin: 0 auto; line-height: 2; font-size: 13px; color: #333; letter-spacing: 0.05em;">
                <p style="text-transform: uppercase; font-size: 11px; color: #999; margin-bottom: 20px;">Welcome to the Inner Circle</p>
                <p>
                  Thank you for joining us. You are now part of a curated community with first access to our <strong>Atelier Series</strong> and <strong>M2C supply chain breakthroughs</strong>.
                </p>
                <p style="margin-top: 20px;">
                  We believe in transparency, craftsmanship, and the direct connection between the factory and the client.
                </p>
              </div>

              <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid #f5f5f5;">
                <p style="font-size: 10px; color: #bbb; text-transform: uppercase; letter-spacing: 0.3em;">
                  SINGAPORE &bull; VIETNAM &bull; THAILAND &bull; CHINA
                </p>
              </div>
            </div>
          `
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