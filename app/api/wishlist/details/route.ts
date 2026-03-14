import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );
}

export async function GET() {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  try {
    // 1. 获取 ID
    const { data: wishlistData, error: dbError } = await supabase
      .from('wishlist')
      .select('product_id')
      .eq('user_id', user.id);

    if (dbError) throw dbError;
    if (!wishlistData || wishlistData.length === 0) return NextResponse.json([]);

    const productIds = wishlistData.map((item: any) => item.product_id);
    const hygraphEndpoint = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT || process.env.HYGRAPH_ENDPOINT;

    // 2. 请求 Hygraph 详情
    const res = await fetch(hygraphEndpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HYGRAPH_TOKEN}`,
      },
      body: JSON.stringify({
        query: `
          query GetWishlist($ids: [ID!]!) {
            products(where: { id_in: $ids }) {
              id name price slug
              images(first: 1) { url }
              gender { slug }
              subCategories(first: 1) { slug }
            }
          }
        `,
        variables: { ids: productIds }
      }),
    });

    const hygraphData = await res.json();
    if (hygraphData.errors) throw new Error("Hygraph 查询失败");

    // 3. 格式化返回数据
    const products = hygraphData.data.products.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      slug: p.slug,
      image: p.images?.[0]?.url || '/placeholder.jpg',
      href: `/${p.gender?.slug || 'women'}/${p.subCategories?.[0]?.slug || 'all'}/all/${p.slug}`
    }));

    return NextResponse.json(products);

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}