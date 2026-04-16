import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { hygraph } from '@/lib/hygraph';
import { gql } from 'graphql-request';

// 🌟 核心修复：强制动态，禁止 Next.js 缓存 GET 结果
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const GET_VARIANTS_BY_IDS = gql`
  query GetVariantsByIds($ids: [ID!]) {
    productVariants(where: { id_in: $ids }) {
      id
      productColorEnum
      images(first: 1) {
        url
      }
      products(first: 1) {
        name
        price
        slug
        gender { slug }
        category { slug }
        subCategories(first: 1) { slug }
      }
    }
  }
`;

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
      },
    }
  );
}

// [GET] 获取心愿单
export async function GET(req: Request) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json([], { status: 200 });

  const { searchParams } = new URL(req.url);
  const isFullDetail = searchParams.get('full') === 'true';

  try {
    const { data: wishlistItems, error: dbError } = await supabase
      .from('wishlist')
      .select('variant_id') 
      .eq('user_id', user.id);

    if (dbError) throw dbError;

    // 🌟 去重处理：即使数据库有重复，前端也只展示一个
    const rawIds = (wishlistItems || []).map((item: any) => item.variant_id);
    const variantIds = Array.from(new Set(rawIds)); 

    if (!isFullDetail) return NextResponse.json(variantIds);
    if (variantIds.length === 0) return NextResponse.json([]);

    const data: any = await hygraph.request(GET_VARIANTS_BY_IDS, { ids: variantIds });

    const formattedProducts = data.productVariants.map((v: any) => {
      const parentProduct = v.products?.[0];
      return {
        id: v.id,
        name: parentProduct?.name || 'LINJIN Luxury Piece',
        price: parentProduct?.price || 0,
        color: v.productColorEnum,
        image: v.images?.[0]?.url || '/placeholder.jpg',
        href: `/${parentProduct?.gender?.slug || 'women'}/${parentProduct?.category?.slug || 'bags'}/${parentProduct?.subCategories?.[0]?.slug || 'all'}/${parentProduct?.slug || ''}?color=${v.productColorEnum}`
      };
    });

    return NextResponse.json(formattedProducts);
  } catch (error: any) {
    console.error('Wishlist GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// [POST] 切换收藏状态
export async function POST(req: Request) {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });

  try {
    const { variantId } = await req.json();
    if (!variantId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    // 1. 查找是否存在
    const { data: existingItem } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('variant_id', variantId)
      .maybeSingle();

    if (existingItem) {
      // 2. 取消收藏：使用 match 确保删掉该用户下这个变体的所有记录
      const { error: deleteError } = await supabase
        .from('wishlist')
        .delete()
        .match({ user_id: user.id, variant_id: variantId });

      if (deleteError) throw deleteError;
      return NextResponse.json({ status: 'unliked' });
    } else {
      // 3. 添加收藏
      const { error: insertError } = await supabase
        .from('wishlist')
        .insert([{ user_id: user.id, variant_id: variantId }]);

      if (insertError) {
        // 如果触发了唯一约束，说明已存在，直接返回 liked
        if (insertError.code === '23505') return NextResponse.json({ status: 'liked' });
        throw insertError;
      }
      return NextResponse.json({ status: 'liked' });
    }
  } catch (error: any) {
    console.error('Wishlist POST Error:', error.message);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}