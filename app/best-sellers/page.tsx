import { Metadata } from 'next';
import ProductGrid from '../components/ProductGrid';
import { fetchFromHygraph } from '@/lib/hygraph';

/** ====================== 渲染设置 ====================== */
// 建议使用 revalidate 而不是 force-dynamic，
// 这样可以利用 Vercel 缓存，每小时刷新一次热销榜即可，提升访问速度。
export const revalidate = 3600; 

/** ====================== SEO Metadata ====================== */
export const metadata: Metadata = {
  title: 'Best Sellers | Premium Leather Handbags | LINJIN LUXURY',
  description:
    'Discover the most coveted designs from LINJIN LUXURY. Shop our best-selling leather tote, hobo, and boston bags crafted in our private atelier.',
  alternates: {
    canonical: 'https://www.linjinluxury.com/best-sellers',
  },
  openGraph: {
    title: 'Best Sellers | LINJIN LUXURY Atelier',
    description: 'Explore the most popular silhouettes from our workshop.',
    url: 'https://www.linjinluxury.com/best-sellers',
    siteName: 'LINJIN LUXURY',
    images: [{ url: 'https://www.linjinluxury.com/images/bestsellers-og.jpg' }],
    type: 'website',
  },
};

/** ====================== 类型标准化 ====================== */
type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
};

/** ====================== 数据层 ====================== */
async function fetchBestSellers(): Promise<{
  products: Product[];
  endCursor: string | null;
}> {
  try {
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
          variants(first: 1) {
            ... on ProductVariant {
              images(first: 2) { 
                url 
              }
            }
          }
        }
      }
    `;

    // 🌟 核心改进：调用你封装的 fetchFromHygraph
    const data = await fetchFromHygraph<{ products: any[] }>(query, { limit: 12 });

    const products: Product[] =
      data?.products?.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        // 拍平图片数据，支持 ProductGrid 可能需要的悬停切换
        images: p.variants?.[0]?.images?.map((img: any) => img.url) || ['/images/placeholder.jpg'],
      })) || [];

    return {
      products,
      // 如果你后续需要“无限滚动”，这里通常使用 pageInfo.endCursor
      // 暂时用最后一位 ID 兜底
      endCursor: products.length > 0 ? products[products.length - 1].id : null,
    };
  } catch (error) {
    console.error('Best Sellers fetch error:', error);
    return { products: [], endCursor: null };
  }
}

/** ====================== Page Component ====================== */
export default async function BestSellersPage() {
  const data = await fetchBestSellers();

  // 🌟 强化 JSON-LD，增加 Offer 信息，提升在 Google Shopping 的权重
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Best Selling Leather Goods',
    description: 'Most popular designs from the LINJIN LUXURY workshop.',
    url: 'https://www.linjinluxury.com/best-sellers',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: data.products.length,
      itemListElement: data.products.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: p.name,
          url: `https://www.linjinluxury.com/product/${p.slug}`,
          image: p.images[0],
          brand: { '@type': 'Brand', 'name': 'LINJIN LUXURY' },
          offers: {
            '@type': 'Offer',
            price: p.price,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
          }
        }
      })),
    },
  };

  return (
    <main className="pt-40 pb-20 px-6 lg:px-12 bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* Header：维持你的极简主义美学 */}
      <header className="mb-24 text-center max-w-2xl mx-auto">
        <span className="text-[10px] tracking-[0.5em] text-zinc-400 uppercase mb-4 block">
          Selection // 001
        </span>
        <h1 className="text-[16px] font-light tracking-[0.8em] uppercase mb-8 text-zinc-900">
          Best Sellers
        </h1>

        <div className="w-8 h-[1px] bg-[#d4af37] mx-auto mb-10" />

        <p className="text-[11px] tracking-[0.2em] text-zinc-400 uppercase leading-relaxed italic font-serif">
          The most coveted silhouettes <br />
          shipped directly from our private workshop.
        </p>
      </header>

      {/* Grid：传入清洗后的数据 */}
      <div className="max-w-[1600px] mx-auto">
        <ProductGrid
          initialProducts={data.products}
          initialEndCursor={data.endCursor}
          // 因为是 Best Sellers，所以不固定性别和分类
          category={null}
          gender={null}
        />
      </div>

      {/* Empty State */}
      {data.products.length === 0 && (
        <div className="text-center py-40 border-t border-zinc-50 mt-20">
          <p className="text-[9px] tracking-[0.6em] text-zinc-300 uppercase">
            Curating the archive...
          </p>
        </div>
      )}
    </main>
  );
}