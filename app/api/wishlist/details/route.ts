import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * 辅助函数：初始化 Supabase 客户端
 */
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

export async function GET() {
  const supabase = await getSupabase();
  
  // 1. 验证用户登录状态
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. 从 Supabase 获取用户收藏的所有变体 ID
    const { data: wishlistData, error: dbError } = await supabase
      .from('wishlist')
      .select('variant_id') 
      .eq('user_id', user.id);

    if (dbError) throw dbError;
    
    // 如果心愿单为空，直接返回空数组
    if (!wishlistData || wishlistData.length === 0) {
      return NextResponse.json([]);
    }

    const variantIds = wishlistData.map((item: any) => item.variant_id);
    const hygraphEndpoint = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT || process.env.HYGRAPH_ENDPOINT;

    // 3. 向 Hygraph 请求变体详细信息
    // 注意：根据你的后台截图，字段名已改为 products (复数)
    const res = await fetch(hygraphEndpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HYGRAPH_TOKEN}`,
      },
      next: { revalidate: 0 }, 
      body: JSON.stringify({
        query: `
          query GetWishlistDetails($ids: [ID!]!) {
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
                gender { 
                  slug 
                }
                category {
                  slug
                }
                subCategories(first: 1) { 
                  slug 
                }
              }
            }
          }
        `,
        variables: { ids: variantIds }
      }),
    });

    const hygraphData = await res.json();
    
    if (hygraphData.errors) {
      console.error("Hygraph Errors:", hygraphData.errors);
      return NextResponse.json({ error: "Hygraph fetch failed" }, { status: 500 });
    }

    // 4. 格式化并扁平化数据
    // 重点：处理 products 数组并提取第一个产品的信息
    const products = hygraphData.data.productVariants.map((v: any) => {
      const parentProduct = v.products?.[0]; // 提取数组中的第一个产品
      
      const genderSlug = parentProduct?.gender?.slug || 'women';
      const categorySlug = parentProduct?.category?.slug || 'bags';
      const subCategorySlug = parentProduct?.subCategories?.[0]?.slug || 'all';
      const productSlug = parentProduct?.slug || '';
      const color = v.productColorEnum || '';

      return {
        id: v.id, 
        name: parentProduct?.name || 'Untitled Piece',
        price: parentProduct?.price || 0,
        slug: productSlug,
        color: color,
        image: v.images?.[0]?.url || '/placeholder.jpg',
        // 构建精准跳转链接
        href: `/${genderSlug}/${categorySlug}/${subCategorySlug}/${productSlug}?color=${color}`
      };
    });

    return NextResponse.json(products);

  } catch (err: any) {
    console.error("Wishlist Details API Error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}