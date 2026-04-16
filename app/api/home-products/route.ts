import { hygraph } from '@/lib/hygraph';
import { NextResponse } from 'next/server';

// ✅ 1. 适配 Variants 架构的查询语句
const GET_PRODUCTS = `
  query GetHomeProducts {
    products(first: 12, orderBy: createdAt_DESC) {
      id
      name
      slug
      price
      featured
      isNew
      isLimited
      category { name }
      
      # 🌟 关键：深入规格内部抓取颜色和图片
      variants {
        ... on ProductVariant {
          productColorEnum # 对应你截图中的枚举字段
          images(first: 1) {   # 首页通常只需要每个规格的第一张图
            url
          }
        }
      }
    }
  }
`;

// ✅ 2. 启用 Next.js 15 缓存 (ISR)
export const revalidate = 3600; 

export async function GET() {
  try {
    const { products } = await hygraph.request<{ products: any[] }>(GET_PRODUCTS);

    // ✅ 3. 数据清洗：将图片提取到顶层，方便前端 Card 组件直接渲染
    const processedProducts = products.map(product => {
      // 提取第一个变体的第一张图片作为封面
      const mainImage = product.variants?.[0]?.images?.[0]?.url || '/placeholder.jpg';
      
      // 提取所有可用的颜色，用于首页显示颜色选项
      const colors = product.variants?.map((v: any) => v.productColorEnum).filter(Boolean);

      return {
        ...product,
        mainImage,
        availableColors: colors
      };
    });

    return NextResponse.json(
      { products: processedProducts },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
        },
      }
    );
  } catch (error) {
    console.error('Hygraph API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', products: [] }, 
      { status: 500 }
    );
  }
}