import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('id'); // 这里保持变量名为 id 兼容前端，但实际查询的是 Hygraph 的 slug

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug/id' }, { status: 400 });
  }

  const HYGRAPH_ENDPOINT = process.env.HYGRAPH_ENDPOINT!;
  const HYGRAPH_TOKEN = process.env.HYGRAPH_TOKEN;

  // 查询 Hygraph 获取产品详情及同类推荐
  const query = `
    query GetProductDetails($slug: String!) {
      product(where: { slug: $slug }) {
        id
        name
        price
        description
        slug
        images {
          url
        }
        gender { slug }
        category { slug }
        subCategories { 
          slug 
          name 
        }
      }
      # 推荐产品：查询同类的其他产品
      recommended: products(first: 5, where: { slug_not: $slug }) {
        id
        name
        price
        slug
        images(first: 1) {
          url
        }
      }
    }
  `;

  try {
    const response = await fetch(HYGRAPH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(HYGRAPH_TOKEN && { Authorization: `Bearer ${HYGRAPH_TOKEN}` }),
      },
      body: JSON.stringify({
        query,
        variables: { slug },
      }),
    });

    const { data, errors } = await response.json();

    if (errors || !data.product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const p = data.product;

    // 格式化数据，兼容你之前的 UI 字段名
    const product = {
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description,
      mainImage: p.images[0]?.url || '',
      images: p.images,
      slug: p.slug,
      gender: p.gender?.slug || 'women',
      category: p.category?.slug || '',
      subCategory: p.subCategories[0]?.slug || '',
      // 以下为保留字段，如果 Hygraph 没设这些字段会返回默认值，防止前端崩溃
      colors: [],
      dimensions: {},
      features: [],
    };

    // 格式化推荐列表
    const recommended = data.recommended.map((rec: any) => ({
      id: rec.id,
      name: rec.name,
      price: rec.price,
      slug: rec.slug,
      mainImage: rec.images[0]?.url || '',
    }));

    return NextResponse.json({ product, recommended });
  } catch (error) {
    console.error('Hygraph API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}