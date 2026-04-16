import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('id'); // 注意：前端传参必须对应 slug

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug/id' }, { status: 400 });
  }

  const HYGRAPH_ENDPOINT = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT;
  const HYGRAPH_TOKEN = process.env.HYGRAPH_TOKEN;

  if (!HYGRAPH_ENDPOINT) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // ✅ 1. 适配 Variants 架构的 GraphQL 查询
  const query = `
    query GetProductDetails($slug: String!) {
      product(where: { slug: $slug }) {
        id
        name
        price
        description
        slug
        # 🌟 关键：从规格里抓取图片和颜色
        variants {
          ... on ProductVariant {
            id
            productColorEnum
            images { url }
          }
        }
        gender { slug }
        category { slug }
        subCategories { 
          slug 
          name 
        }
      }
      # 🌟 推荐产品也需要适配变体图片
      recommended: products(first: 5, where: { slug_not: $slug }) {
        id
        name
        price
        slug
        variants(first: 1) {
          ... on ProductVariant {
            images(first: 1) { url }
          }
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

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: response.status });
    }

    const { data, errors } = await response.json();

    if (errors || !data?.product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const p = data.product;

    // ✅ 2. 数据清洗：将规格数据扁平化，方便前端渲染
    // 提取所有规格的图片集合
    const allImages = p.variants?.flatMap((v: any) => v.images?.map((img: any) => img.url)) || [];
    // 提取所有规格的颜色枚举
    const availableColors = p.variants?.map((v: any) => v.productColorEnum).filter(Boolean) || [];

    const product = {
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description,
      // 默认显示第一个规格的第一张图
      mainImage: p.variants?.[0]?.images?.[0]?.url || '',
      images: allImages, 
      slug: p.slug,
      gender: p.gender?.slug || 'women',
      category: p.category?.slug || '',
      subCategory: p.subCategories?.[0]?.slug || '',
      colors: availableColors, // ✅ 现在有了真实的颜色数据
      variants: p.variants,     // ✅ 传给前端用于颜色切换逻辑
      dimensions: {},
      features: [],
    };

    // ✅ 3. 推荐位数据清洗
    const recommended = (data.recommended || []).map((rec: any) => ({
      id: rec.id,
      name: rec.name,
      price: rec.price,
      slug: rec.slug,
      mainImage: rec.variants?.[0]?.images?.[0]?.url || '',
    }));

    return NextResponse.json({ product, recommended });
  } catch (error) {
    console.error('Hygraph API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}