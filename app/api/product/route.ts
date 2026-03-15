import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('id');

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug/id' }, { status: 400 });
  }

  // 1. 修复：统一使用你在 Vercel 后台设置的变量名
  const HYGRAPH_ENDPOINT = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT;
  const HYGRAPH_TOKEN = process.env.HYGRAPH_TOKEN;

  if (!HYGRAPH_ENDPOINT) {
    console.error("Missing HYGRAPH_ENDPOINT environment variable");
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const query = `
    query GetProductDetails($slug: String!) {
      product(where: { slug: $slug }) {
        id
        name
        price
        description
        slug
        images { url }
        gender { slug }
        category { slug }
        subCategories { 
          slug 
          name 
        }
      }
      recommended: products(first: 5, where: { slug_not: $slug }) {
        id
        name
        price
        slug
        images(first: 1) { url }
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

    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hygraph fetch failed:', errorText);
      return NextResponse.json({ error: 'Failed to fetch from Hygraph' }, { status: response.status });
    }

    const { data, errors } = await response.json();

    if (errors || !data?.product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const p = data.product;

    // 2. 增强防护：使用可选链 ?. 访问属性
    const product = {
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description,
      mainImage: p.images?.[0]?.url || '',
      images: p.images || [],
      slug: p.slug,
      gender: p.gender?.slug || 'women',
      category: p.category?.slug || '',
      subCategory: p.subCategories?.[0]?.slug || '',
      colors: [],
      dimensions: {},
      features: [],
    };

    // 3. 增强防护：确保 recommended 存在且是数组
    const recommended = (data.recommended || []).map((rec: any) => ({
      id: rec.id,
      name: rec.name,
      price: rec.price,
      slug: rec.slug,
      mainImage: rec.images?.[0]?.url || '',
    }));

    return NextResponse.json({ product, recommended });
  } catch (error) {
    console.error('Hygraph API error:', error);
    // 确保任何错误都返回 JSON 格式
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}