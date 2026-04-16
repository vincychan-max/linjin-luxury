import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';

    if (!q) {
      return NextResponse.json({ suggestions: [] });
    }

    // 🌟 统一环境变量名
    const HYGRAPH_ENDPOINT = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT;

    if (!HYGRAPH_ENDPOINT) {
      return NextResponse.json({ error: 'Config Error' }, { status: 500 });
    }

    const graphqlQuery = {
      query: `
        query GetSearchSuggestions($searchTerm: String!) {
          # 🌟 优化 1：不仅搜名字，还可以关联搜变体颜色（可选）
          products(
            where: { 
              OR: [
                { name_contains: $searchTerm },
                { slug_contains: $searchTerm }
              ]
            }, 
            first: 8
          ) {
            name
            slug
            # 🌟 优化 2：带上一张缩略图，提升搜索框的视觉质感
            variants(first: 1) {
              ... on ProductVariant {
                images(first: 1) {
                  url
                }
              }
            }
          }
        }
      `,
      variables: { searchTerm: q },
    };

    const response = await fetch(HYGRAPH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphqlQuery),
      // 🌟 搜索建议通常请求频繁，设置短时间缓存
      next: { revalidate: 300 } 
    });

    const json = await response.json();
    const products = json.data?.products || [];

    // 🌟 优化 3：返回更丰富的数据结构
    const suggestions = products.map((p: any) => ({
      name: p.name,
      slug: p.slug,
      image: p.variants?.[0]?.images?.[0]?.url || null
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Suggestions API Error:', error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}