import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * 💡 核心逻辑：
 * 1. 废弃 RPC 函数，改用直接 Insert 以避开 UUID 类型冲突。
 * 2. 自动处理重复商品：如果 product_id/color/size 相同，则更新数量。
 */

export const dynamic = 'force-dynamic';

// 1. 获取购物车数据 (GET)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json([], { status: 200 }); // 未登录返回空数组
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET_CART_ERROR:", err.message);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// 2. 添加/同步购物车 (POST)
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, item, quantity, id, cart } = body;

    // --- Action: Add (添加单件商品) ---
    if (action === 'add' && item) {
      // 检查是否已有相同配置的商品
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', item.product_id)
        .eq('color', item.color)
        .eq('size', item.size)
        .maybeSingle();

      if (existing) {
        // 更新数量
        const { error: upError } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + (item.quantity || 1) })
          .eq('id', existing.id);
        if (upError) throw upError;
      } else {
        // 直接插入新纪录 (id 使用随机字符串，适配你的 text 类型 id)
        const { error: inError } = await supabase
          .from('cart_items')
          .insert([{
            id: Math.random().toString(36).substring(2, 15), 
            user_id: user.id,
            product_id: item.product_id, // 数据库现在是 text，匹配成功
            name: item.name,
            price: item.price,
            image: item.image,
            color: item.color,
            size: item.size,
            quantity: item.quantity || 1
          }]);
        if (inError) throw inError;
      }
    }

    // --- Action: Update (修改数量) ---
    else if (action === 'update' && id) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    }

    // --- Action: Sync (登录后批量同步本地购物车) ---
    else if (action === 'sync' && Array.isArray(cart)) {
      for (const i of cart) {
        // 批量同步也采用 Upsert 逻辑
        await supabase
          .from('cart_items')
          .upsert({
            user_id: user.id,
            product_id: i.product_id,
            name: i.name,
            price: i.price,
            image: i.image,
            color: i.color,
            size: i.size,
            quantity: i.quantity
          }, { onConflict: 'user_id,product_id,color,size' });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST_CART_ERROR:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 3. 删除商品 (DELETE)
export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE_CART_ERROR:", err.message);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}