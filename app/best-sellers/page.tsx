import ProductGrid from '../components/ProductGrid';
import { fetchFromHygraph } from '@/lib/hygraph';

/**
 * 核心配置：
 * 1. 使用 'force-dynamic' 解决 Next.js 15 的 DYNAMIC_SERVER_USAGE 错误。
 */
export const dynamic = 'force-dynamic';

async function fetchBestSellers() {
  try {
    /**
     * 🌟 核心修正：
     * 删除了已经不存在的 images 字段。
     * 改为从 variants 中获取第一张图片，确保页面不会报错。
     */
    const query = `
      query GetBestSellers($limit: Int!) {
        products(
          where: { isBestSeller: true }
          first: $limit
          orderBy: updatedAt_DESC
          stage: PUBLISHED
        ) {
          id
          slug
          name
          price
          # 从变体中抓取预览图
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

    // 执行数据抓取
    const data = await fetchFromHygraph<{ products: any[] }>(query, { limit: 12 });
    
    /**
     * 🌟 数据清洗：
     * 为了兼容 ProductGrid 组件，我们需要把嵌套在 variants 里的图片提取出来
     */
    const products = data?.products?.map(product => ({
      ...product,
      // 将第一个变体的第一张图赋值给 images 属性，适配 ProductGrid
      images: product.variants?.[0]?.images || []
    })) || [];

    return {
      products,
      endCursor: products.length > 0 ? products[products.length - 1].id : null
    };
  } catch (error) {
    console.error('Failed to fetch best sellers from Hygraph:', error);
    return { products: [], endCursor: null };
  }
}

export default async function BestSellersPage() {
  const data = await fetchBestSellers();

  return (
    <main className="pt-40 pb-20 px-6 lg:px-12 bg-white min-h-screen">
      {/* 奢华品牌风格 Header */}
      <header className="mb-24 text-center max-w-2xl mx-auto">
        <h1 className="text-[14px] font-bold tracking-[0.7em] uppercase mb-6 text-black">
          Best Sellers
        </h1>
        <div className="w-10 h-[1px] bg-[#d4af37] mx-auto mb-8" />
        <p className="text-[11px] tracking-[0.25em] text-black/40 uppercase leading-loose italic">
          The most coveted silhouettes <br />
          from our private atelier.
        </p>
      </header>

      {/* 产品展示区域 */}
      <div className="max-w-[1600px] mx-auto">
        <ProductGrid 
          initialProducts={data.products}
          initialEndCursor={data.endCursor}
          category={null} 
          gender={null}   
        />
      </div>

      {/* 空状态处理 */}
      {data.products.length === 0 && (
        <div className="text-center py-20">
          <p className="text-[10px] tracking-[0.4em] text-black/20 uppercase font-light">
            Curating the collection...
          </p>
        </div>
      )}
    </main>
  );
}