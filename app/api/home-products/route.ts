import { hygraph } from '@/lib/hygraph';
import { NextResponse } from 'next/server';

const GET_PRODUCTS = `
  query GetHomeProducts {
    products(first: 12, orderBy: createdAt_DESC) { // 首页12个最新或推荐
      id
      name
      slug
      price
      description { html }
      images { url }
      stock
      featured
      isNew
      isLimited
      category { name }
      colors { name hexColor }
    }
  }
`;

export async function GET() {
  try {
    const { products } = await hygraph.request(GET_PRODUCTS);
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Hygraph API error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}