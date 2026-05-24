import { hygraph } from '@/lib/hygraph';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const gender = searchParams.get('gender');   // 'men' | 'women' | null
  const limit = parseInt(searchParams.get('limit') || '12');

  try {
    // 构建 GraphQL 查询字符串
    // 注意：这里移除了查询签名的 $gender: String，因为在 where 子句中使用了 JS 字符串拼接
    const query = `
      query GetInitialProducts($limit: Int!) {
        products(
          where: {
            ${gender ? `gender: { slug: "${gender}" }` : ''}
          }
          first: $limit
          orderBy: createdAt_DESC
          stage: PUBLISHED
        ) {
          id
          name
          slug
          price
          isNew
          material
          variants(first: 1) {
            ... on ProductVariant {
              images(first: 1) {
                url
              }
            }
          }
        }
      }
    `;

    // 执行请求，只传递必需的 limit 变量，因为 gender 已经硬编码在查询字符串里了
    const data: any = await hygraph.request(query, { limit });
    
    // 安全地提取产品数据，防止因为 data 为 undefined 导致 .map 报错
    const products = data?.products || [];

    // 数据清洗：把图片拍平
    const formattedProducts = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      isNew: p.isNew,
      material: p.material,
      images: p.variants?.[0]?.images?.map((img: any) => img.url) || [],
    }));

    return NextResponse.json(formattedProducts);

  } catch (error) {
    console.error('API initial-products error:', error);
    return NextResponse.json([], { status: 500 });
  }
}