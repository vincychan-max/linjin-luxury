import { NextResponse } from 'next/server';
import { hygraph } from '@/lib/hygraph';
import { gql } from 'graphql-request';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const mainCategory = searchParams.get('mainCategory');
  const category = searchParams.get('category');
  const isBestSeller = searchParams.get('isBestSeller') === 'true'; 
  const limit = parseInt(searchParams.get('limit') || '12');
  const after = searchParams.get('after') || null;

  // 1. 动态构建查询过滤条件，防止 null 值干扰
  const whereClause: any = {};
  if (isBestSeller) {
    whereClause.isBestSeller = true;
  } else {
    if (category) {
      whereClause.subCategories_some = {
        slug: category,
        category: { gender: { slug: mainCategory } }
      };
    }
  }

  // 2. 编写 GraphQL 查询 (🌟 严格匹配你的 Hygraph 截图字段)
  const query = gql`
    query GetMoreProducts(
      $limit: Int!, 
      $after: String,
      $where: ProductWhereInput
    ) {
      productsConnection(
        first: $limit
        after: $after
        orderBy: createdAt_DESC
        stage: PUBLISHED
        where: $where
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            name
            slug
            price
            compareAtPrice
            isNew
            isBestSeller
            # 🌟 核心修正：使用你截图中的 productColorEnum
            variants {
              ... on ProductVariant {
                productColorEnum 
                images(first: 1) {
                  url
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    // 3. 执行请求
    const data: any = await hygraph.request(query, { 
      limit, 
      after,
      where: whereClause
    });

    // 4. 格式化返回结果，确保前端 ProductGrid 拿到的数据结构一致
    const formattedNodes = data.productsConnection.edges.map((edge: any) => {
      const node = edge.node;
      
      // 提取第一个变体的图片作为封面
      const firstVariantImage = node.variants?.[0]?.images?.[0]?.url || '/placeholder.jpg';
      
      // 提取所有变体的图片数组
      const allVariantImages = node.variants?.flatMap((v: any) => 
        v.images?.map((img: any) => img.url)
      ).filter(Boolean) || [];

      return {
        ...node,
        // 兼容性处理：同时提供单图和图集
        mainImage: firstVariantImage,
        images: allVariantImages.length > 0 ? allVariantImages : ['/placeholder.jpg'],
        // 提取颜色列表用于展示圆点
        colors: node.variants?.map((v: any) => v.productColorEnum).filter(Boolean) || []
      };
    });

    return NextResponse.json({
      pageInfo: data.productsConnection.pageInfo,
      nodes: formattedNodes
    });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch products', 
      details: error.message 
    }, { status: 500 });
  }
}