import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const LIMIT = 12; 
    const skip = (page - 1) * LIMIT;

    // ✅ 修复：确保环境变量名称与其它 API 路由统一
    const HYGRAPH_ENDPOINT = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT;

    if (!HYGRAPH_ENDPOINT) {
      return NextResponse.json({ error: 'API Endpoint not configured' }, { status: 500 });
    }

    const graphqlQuery = {
      query: `
        query GetSearchResults($searchTerm: String!, $limit: Int!, $skip: Int!) {
          productsConnection(
            where: { 
              OR: [
                { name_contains: $searchTerm },
                { slug_contains: $searchTerm }
                # 💡 如果想支持搜索颜色，可以在这里增加：
                # { variants_some: { productColorEnum_contains: $searchTerm } }
              ]
            }, 
            first: $limit, 
            skip: $skip,
            orderBy: createdAt_DESC
          ) {
            edges {
              node {
                id
                name
                price
                slug
                # 🌟 核心修正：从变体中获取预览图
                variants(first: 1) {
                  ... on ProductVariant {
                    images(first: 1) {
                      url
                    }
                  }
                }
                subCategories {
                  name
                }
              }
            }
            aggregate {
              count
            }
          }
        }
      `,
      variables: { searchTerm: q, limit: LIMIT, skip: skip },
    };

    const response = await fetch(HYGRAPH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphqlQuery),
    });

    const json = await response.json();

    if (!json.data || !json.data.productsConnection) {
      return NextResponse.json({ results: [], total: 0 });
    }

    // ✅ 数据加工：拍平变体图片
    const results = json.data.productsConnection.edges.map((edge: any) => {
      const node = edge.node;
      // 获取第一个变体的第一张图作为搜索缩略图
      const previewImage = node.variants?.[0]?.images?.[0]?.url || '/placeholder.jpg';

      return {
        id: node.id,
        name: node.name,
        price: node.price,
        slug: node.slug,
        image: previewImage, // 👈 统一字段名，确保前端能拿到图
        category: node.subCategories?.[0]?.name || 'Collection'
      };
    });

    return NextResponse.json({
      results,
      total: json.data.productsConnection.aggregate.count,
      totalPages: Math.ceil(json.data.productsConnection.aggregate.count / LIMIT),
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}