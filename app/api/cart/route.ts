import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * 助手函数：在 Route Handler 中初始化 Supabase 客户端
 * 修复了 Next.js 15 中 cookies() 必须 await 的问题
 */
async function getSupabaseClient() {
  // 核心修复：在最新的 Next.js 中，cookies() 是一个异步函数
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // 某些情况下在服务端设置 cookie 会有局限性，此处捕获以防崩溃
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // 忽略错误
          }
        },
      },
    }
  );
}

// 1. 获取购物车 (GET)
export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseClient();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 2. 增、改、同步 (POST)
export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseClient();
    const body = await req.json();
    const { action, item, userId, quantity, id, cart } = body;

    // 安全校验
    const { data: { session } } = await supabase.auth.getSession();
    if (userId && session?.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // --- 逻辑分支 ---
    if (action === 'add' && item) {
      const { error } = await supabase.from('cart_items').upsert({
        id: item.id,
        user_id: userId,
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        image: item.image,
        color: item.color,
        size: item.size,
        quantity: item.quantity || 1,
      });
      if (error) throw error;
    }

    else if (action === 'update' && id) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    }

    else if (action === 'sync' && cart) {
      const itemsToSync = cart.map((i: any) => ({
        id: i.id,
        user_id: userId,
        product_id: i.product_id,
        name: i.name,
        price: i.price,
        image: i.image,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
      }));
      // 批量同步本地购物车到数据库
      const { error } = await supabase.from('cart_items').upsert(itemsToSync);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. 删除 (DELETE)
export async function DELETE(req: Request) {
  try {
    const supabase = await getSupabaseClient();
    const { id, userId } = await req.json();

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}