import { hygraph } from '@/lib/hygraph';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const gender = searchParams.get('gender');   // 'men' | 'women' | null
  const limit = parseInt(searchParams.get('limit') || '12');

  try {
    const { products } = await hygraph.request(`
      query GetInitialProducts($gender: String, $limit: Int!) {
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
    `, { gender, limit });

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