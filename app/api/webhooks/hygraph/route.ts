import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productData = body.data;

    // 1. 获取变体列表
    let variants = productData.variants || [productData];
    
    // 2. 获取公共信息 (价格/图片)
    const commonPrice = productData.price || 0; 

    if (!variants || variants.length === 0) {
      return NextResponse.json({ message: 'No data to sync' });
    }

    // 3. 构造与你 Supabase 表字段完全对应的数组
    const upsertData = variants.map((v: any) => ({
      id: v.id,                                     // 对应 id (text)
      product_id: productData.id || v.product?.id,  // 对应 product_id (text)
      sku: `${productData.slug || 'ITEM'}-${v.productColorEnum || 'UNI'}`.toUpperCase(), // 对应 sku (text)
      color: v.productColorEnum,                    // 对应 color (text)
      stock: 0,                                     // 对应 stock (int4)
      image_url: v.images?.[0]?.url || productData.images?.[0]?.url || '', // 对应 image_url (text)
      updated_at: new Date().toISOString()          // 对应 updated_at (timestamptz)
    }));

    // 4. 执行同步
    const { error } = await supabaseAdmin
      .from('product_variants')
      .upsert(upsertData, { onConflict: 'id' });

    if (error) throw error;

    return NextResponse.json({ success: true, count: upsertData.length });

  } catch (err: any) {
    console.error('Sync Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}