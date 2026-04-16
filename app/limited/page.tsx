import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { hygraph } from '@/lib/hygraph';

// 缓存设置：每小时更新一次页面内容
export const revalidate = 3600; 
export const dynamicParams = true; 

interface Product {
  id: string; 
  name: string; 
  slug: string; 
  price: number;
  // 🌟 修改：适配变体图片结构
  variants: { images: { url: string }[] }[];
}

// 1. 增强型 Metadata
export const metadata: Metadata = {
  title: 'The Archive | Limited Leather Editions | LINJIN LUXURY Atelier',
  description: 'Exclusive limited production leather goods from LINJIN LUXURY. Curated editions for private clients and M2C private label solutions.',
  alternates: { canonical: 'https://www.linjinluxury.com/limited' },
  openGraph: {
    title: 'The Archive | LINJIN LUXURY',
    description: 'Exclusive Atelier Series & Private Label Production.',
    url: 'https://www.linjinluxury.com/limited',
    siteName: 'LINJIN LUXURY',
    images: [
      {
        url: 'https://www.linjinluxury.com/og-archive.jpg', 
        width: 1200,
        height: 630,
        alt: 'LINJIN LUXURY Archive Collection',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default async function LimitedArchivePage() {
  const formatCurrency = (price: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      minimumFractionDigits: 0 
    }).format(price);

  /**
   * 🌟 核心修正：
   * 1. 删除了根层的 images 查询。
   * 2. 增加了从第一个变体获取第一张图片的逻辑。
   */
  const { products } = await hygraph.request<{ products: Product[] }>(`
    query GetAllLimited {
      products(where: { isLimited: true }, orderBy: createdAt_DESC) {
        id 
        name 
        slug 
        price 
        variants(first: 1) {
          ... on ProductVariant {
            images(first: 1) {
              url
            }
          }
        }
      }
    }
  `);

  // 数据清洗：将图片提取到顶层，方便组件使用
  const formattedProducts = products.map(p => ({
    ...p,
    previewImage: p.variants?.[0]?.images?.[0]?.url || '/placeholder.jpg'
  }));

  // 2. 生成 JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "The Archive - Limited Leather Editions",
    "description": "Exclusive leather goods available for private label and bespoke orders.",
    "url": "https://www.linjinluxury.com/limited",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": formattedProducts.length,
      "itemListElement": formattedProducts.map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://www.linjinluxury.com/limited/${product.slug}`,
        "name": product.name,
        "image": product.previewImage
      }))
    }
  };

  return (
    <main id="limited-archive-view" className="bg-[#0a0a0a] min-h-screen text-white pt-40 pb-24 px-6 md:px-24 antialiased selection:bg-white selection:text-black">
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        body:has(#limited-archive-view) header,
        body:has(#limited-archive-view) nav {
          background-color: transparent !important;
          border-bottom: 1px solid rgba(255,255,255,0.05) !important;
        }
        body:has(#limited-archive-view) header a,
        body:has(#limited-archive-view) header span,
        body:has(#limited-archive-view) header p,
        body:has(#limited-archive-view) header div:not([class*="badge"]):not([class*="count"]) {
          color: #ffffff !important;
        }
        body:has(#limited-archive-view) header svg,
        body:has(#limited-archive-view) header img {
          filter: brightness(0) invert(1) !important;
        }
        body:has(#limited-archive-view) header [class*="badge"],
        body:has(#limited-archive-view) header [class*="count"] {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
      ` }} />

      <div className="max-w-[1500px] mx-auto">
        <header className="mb-24 flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-10">
          <div className="max-w-xl">
            <span className="text-white/40 text-[9px] font-bold uppercase tracking-[0.5em] mb-4 block">Atelier Registry // 2026</span>
            <h1 className="text-5xl md:text-7xl font-light tracking-tighter uppercase mb-6 leading-none">
              The <span className="italic font-serif text-neutral-500">Archive</span>
            </h1>
            
            <p className="text-white/30 text-[12px] uppercase tracking-[0.2em] leading-loose max-w-sm">
              Limited production pieces available for private clients, brands, and selected partners.
            </p>
          </div>
          <div className="hidden md:block text-[9px] text-white/20 uppercase tracking-[0.4em] mb-2">Total {formattedProducts.length} Editions</div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
          {formattedProducts.map((product) => (
            <Link key={product.id} href={`/limited/${product.slug}`} className="group block">
              <div className="relative aspect-[4/5] bg-neutral-900 overflow-hidden mb-8 border border-white/5">
                <Image 
                  src={product.previewImage} 
                  alt={product.name} 
                  fill 
                  className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[2s]" 
                />
              </div>

              <div className="flex justify-between items-start border-l border-white/10 pl-5 group-hover:border-white transition-colors duration-500">
                <div className="max-w-[70%]">
                  <h2 className="text-sm font-bold uppercase tracking-[0.15em] mb-1 truncate">{product.name}</h2>
                  <p className="text-[9px] text-white/20 uppercase tracking-widest italic font-serif">Atelier Series / Archive</p>
                  <p className="text-[9px] text-white/40 mt-3 uppercase tracking-[0.2em]">
                    Customizable for Private Label
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-base font-serif italic text-white/80">{formatCurrency(product.price)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-40 pt-20 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] mb-6">Custom Atelier Request</p>
          <p className="text-white/40 text-[12px] uppercase tracking-[0.2em] mb-10 max-w-md mx-auto">
            For bespoke designs, private label production, or bulk inquiries, contact our atelier team.
          </p>

          <Link 
            href="/contact" 
            className="inline-block bg-white text-black px-12 py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-200 transition-colors duration-300"
          >
            Contact Atelier →
          </Link>
        </div>
      </div>
    </main>
  );
}