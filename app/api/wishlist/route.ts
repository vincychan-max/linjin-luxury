import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { hygraph } from '@/lib/hygraph';
import { gql } from 'graphql-request';

// 获取所有收藏商品详情的 GraphQL 查询
const GET_PRODUCTS_BY_IDS = gql`
  query GetProductsByIds($ids: [ID!]) {
    products(where: { id_in: $ids }) {
      id
      name
      price
      slug
      images(first: 1) {
        url
      }
      category {
        slug
      }
      subCategories(first: 1) {
        slug
      }
      gender {
        slug
      }
    }
  }
`;

// 辅助函数：统一初始化 Supabase 客户端
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

// GET: 获取心愿单数据
export async function GET(req: Request) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json([], { status: 200 });
  }

  const { searchParams } = new URL(req.url);
  const isFullDetail = searchParams.get('full') === 'true';

  try {
    const { data: wishlistItems, error: dbError } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', user.id);

    if (dbError) throw dbError;

    // 修复类型报错：显式定义 item 类型
    const productIds = (wishlistItems || []).map((item: { product_id: string }) => item.product_id);

    if (!isFullDetail) {
      return NextResponse.json(productIds);
    }

    if (productIds.length === 0) return NextResponse.json([]);

    const data: any = await hygraph.request(GET_PRODUCTS_BY_IDS, {
      ids: productIds
    });

    const formattedProducts = data.products.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.images[0]?.url || '',
      href: `/${p.gender?.slug || 'women'}/${p.category?.slug || 'bags'}/${p.subCategories[0]?.slug || 'all'}/${p.slug}`
    }));

    return NextResponse.json(formattedProducts);
  } catch (error: any) {
    console.error('Wishlist GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: 添加或取消收藏 (Toggle 逻辑)
export async function POST(req: Request) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // 1. 检查是否已经存在
    const { data: existingItem } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // 2. 如果存在，则执行删除
      const { error: deleteError } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (deleteError) throw deleteError;
      return NextResponse.json({ message: 'Removed', status: 'unliked' });
    } else {
      // 3. 如果不存在，则执行插入
      const { error: insertError } = await supabase
        .from('wishlist')
        .insert([{ 
          user_id: user.id, 
          product_id: productId 
        }]);

      if (insertError) {
        if (insertError.code === '23505') {
          return NextResponse.json({ message: 'Already exists', status: 'liked' });
        }
        throw insertError;
      }
      return NextResponse.json({ message: 'Added', status: 'liked' });
    }
  } catch (error: any) {
    console.error('Wishlist POST Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}