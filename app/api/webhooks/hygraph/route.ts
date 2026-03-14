import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 使用 Service Role Key 绕过 RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Hygraph 的数据结构在 body.data 中
    const hygraphId = body.data.id;

    if (!hygraphId) return NextResponse.json({ error: 'No ID' }, { status: 400 });

    // 同步到 Supabase products 表
    const { error } = await supabaseAdmin
      .from('products')
      .upsert({ id: hygraphId, stock: 999 }, { onConflict: 'id' });

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}