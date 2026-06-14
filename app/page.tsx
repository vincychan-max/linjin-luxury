import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { unstable_cache } from 'next/cache';
import { fetchFromHygraph } from '@/lib/hygraph'; // 🐛 修复 1: 导入正确的请求函数
import { createPublicClient } from '@/lib/supabase-server';
import InstagramCarousel from './components/InstagramCarousel';

/**
 * 🌟 生产级缓存策略：Data Cache + Tag Revalidation
 * 已移除页面级 revalidate = 600，全部使用 unstable_cache 细粒度控制
 */

// --- 全局常量定义 ---
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.linjinluxury.com';
const SITE_TITLE = 'LINJIN LUXURY | Artisan Handbags & Private Atelier Leather Goods';
const SITE_DESC = 'Direct-to-client luxury atelier located in Southern China specializing in archival leather handbags. Hand-numbered editions crafted from premium Togo and Box Calf leathers by master artisans with 20+ years of bench-work experience.';

// --- GraphQL 查询 ---
const HOME_QUERY = `
  query GetHomeData {
    newArrivals: products(where: { isNew: true }, orderBy: publishedAt_DESC, first: 4) {
      id
      name
      slug
      price
      isLimited
      altText
      variants {
        ... on ProductVariant {
          images(first: 1) {
            url
          }
        }
      }
    }
    limitedProducts: products(where: { isLimited: true }, orderBy: createdAt_ASC, first: 3) {
      id
      name
      slug
      price
      isLimited
      altText
      variants {
        ... on ProductVariant {
          images(first: 1) {
            url
          }
        }
      }
    }
  }
`;

// --- 类型定义 ---
interface ProductImage {
  url: string;
}

interface ProductVariant {
  images: ProductImage[];
}

interface RawProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  isLimited: boolean;
  altText?: string | null;
  variants?: ProductVariant[];
}

interface HygraphResponse {
  newArrivals: RawProduct[];
  limitedProducts: RawProduct[];
}

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  isLimited: boolean;
  altText: string;
  previewImage: string;
};

interface SupabaseFAQ {
  id: string;
  question: string;
  answer: string;
}

// --- Metadata ---
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: SITE_TITLE,
    description: SITE_DESC,
    keywords: 'luxury handbags, artisan leather goods, LINJIN LUXURY, Togo leather bag, bespoke handbags',
    alternates: { canonical: SITE_URL },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: SITE_TITLE,
      description: SITE_DESC,
      url: SITE_URL,
      siteName: 'LINJIN LUXURY',
      images: [
        {
          url: `${SITE_URL}/images/og-main.jpg`,
          width: 1200,
          height: 630,
          alt: 'LINJIN LUXURY Private Atelier Collection',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_TITLE,
      description: SITE_DESC,
      images: [`${SITE_URL}/images/og-main.jpg`],
    },
  };
}

// --- 辅助工具函数 ---
const formatCurrency = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price);
};

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().replace(/(?:^|\s|-)\S/g, (l) => l.toUpperCase());
};

const escapeJsonString = (str: string) => {
  if (!str) return '';
  return str
    .replace(/[\r\n\t]/g, ' ')
    .replace(/"/g, '\\"')
    .trim();
};

function processProducts(products: RawProduct[]): Product[] {
  if (!products || !Array.isArray(products)) return [];
  return products.map(p => ({
    id: p.id,
    name: p.name || 'Archival Leather Piece',
    slug: p.slug || '',
    price: p.price || 0,
    isLimited: p.isLimited ?? false,
    altText: p.altText || `${p.name || 'Handcrafted'} handcrafted leather bag`,
    // 这里保留真实图片，若为空则返回空字符串，让前端组件靠 CSS 完美占位而不崩溃
    previewImage: p.variants?.[0]?.images?.[0]?.url || ''
  }));
}

// --- 缓存层（生产推荐）---
const getCachedProducts = unstable_cache(
  async () => {
    try {
      // 🐛 修复 2: 使用带有重试和限流的 fetchFromHygraph 函数
      const data = await fetchFromHygraph<HygraphResponse>(HOME_QUERY);
      return { data, error: null };
    } catch (error: any) {
      console.error("Hygraph Cache Error:", error);
      return { data: null, error: error.message };
    }
  },
  ['home-products-cache'],
  { revalidate: 600, tags: ['products', 'home-page'] }
);

const getCachedFaqs = unstable_cache(
  async () => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from('faq_sections')
        .select('title, items')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error("Supabase Cache Error:", error);
      return { data: null, error: error.message };
    }
  },
  ['home-faqs-cache'],
  { revalidate: 86400, tags: ['faqs', 'home-page'] } // 24小时缓存
);

export default async function HomePage() {
  let newArrivals: Product[] = [];
  let limitedProducts: Product[] = [];
  let faqs: SupabaseFAQ[] = [];

  // 并行 + 容错获取缓存数据
  const [hygraphResult, supabaseResult] = await Promise.allSettled([
    getCachedProducts(),
    getCachedFaqs()
  ]);

  // 处理 Hygraph 数据
  if (hygraphResult.status === 'fulfilled' && hygraphResult.value?.data) {
    newArrivals = processProducts(hygraphResult.value.data.newArrivals || []);
    limitedProducts = processProducts(hygraphResult.value.data.limitedProducts || []);
  } else if (hygraphResult.status === 'rejected') {
    console.error("Hygraph Data Fetching Error:", hygraphResult.reason);
  }

  // 处理 Supabase FAQ 数据
  if (supabaseResult.status === 'fulfilled' && supabaseResult.value?.data) {
    faqs = supabaseResult.value.data.flatMap((section: any) => {
      const itemsArray = Array.isArray(section.items) ? section.items : [];
      return itemsArray.map((item: any, index: number) => {
        const rawQuestion = item.question || '';
        const rawAnswer = item.answer || '';
        const cleanKey = rawQuestion.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
        return {
          id: `${section.title || 'faq'}-${index}-${cleanKey}`,
          question: rawQuestion,
          answer: rawAnswer
        };
      });
    });
  } else if (supabaseResult.status === 'rejected') {
    console.error("Supabase Connection Error:", supabaseResult.reason);
  }

  // 📝 服务器诊断日志：让你在终端黑窗口里能一眼看清数据状态
  console.log("=== 🛠️ LINJIN ATELIER SYSTEM DIAGNOSTICS ===");
  console.log(`[Hygraph] New Arrivals 数量: ${newArrivals.length}`);
  console.log(`[Hygraph] Limited Products 数量: ${limitedProducts.length}`);
  console.log(`[Supabase] FAQ 条数: ${faqs.length}`);
  if (newArrivals.length > 0) {
    console.log(`[Sample Data Preview]:`, JSON.stringify(newArrivals[0]));
  }
  console.log("============================================");

  // --- JSON-LD ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        "name": "LINJIN LUXURY",
        "url": SITE_URL,
        "logo": `${SITE_URL}/logo.png`,
        "description": "An independent luxury atelier operating out of Southern China, specializing in handcrafted archival leather handbags. Pieces are built by master artisans with over 20 years of bench-work experience.",
        "knowsAbout": ["Artisan Leather Craftsmanship", "Luxury Design", "M2C Luxury", "Togo Leather", "Box Calf Leather"],
        "location": {
          "@type": "Place",
          "name": "Southern China Atelier"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "service@linjinluxury.com"
        }
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "url": SITE_URL,
        "name": "LINJIN LUXURY",
        "publisher": { "@id": `${SITE_URL}/#organization` }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
          { "@type": "ListItem", "position": 2, "name": "Women's Collection", "item": `${SITE_URL}/women` },
          { "@type": "ListItem", "position": 3, "name": "Men's Collection", "item": `${SITE_URL}/men` },
          { "@type": "ListItem", "position": 4, "name": "Private Reserve", "item": `${SITE_URL}/limited` }
        ]
      },
      {
        "@type": "AggregateRating",
        "itemReviewed": { "@id": `${SITE_URL}/#organization` },
        "ratingValue": "4.9",
        "reviewCount": "47",
        "bestRating": "5",
        "worstRating": "1"
      },
      ...newArrivals.slice(0, 2).map((product) => ({
        "@type": "Product",
        "@id": `${SITE_URL}/product/${product.slug}#product`,
        "name": escapeJsonString(product.name),
        "image": product.previewImage || `${SITE_URL}/logo.png`,
        "description": escapeJsonString(product.altText),
        "brand": { "@id": `${SITE_URL}/#organization` },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "USD",
          "price": product.price,
          "availability": "https://schema.org/InStock",
          "itemCondition": "https://schema.org/NewCondition",
          "url": `${SITE_URL}/${product.isLimited ? 'limited' : 'product'}/${product.slug}`
        }
      })),
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        "mainEntity": faqs.slice(0, 4).map(item => ({
          "@type": "Question",
          "name": escapeJsonString(item.question),
          "acceptedAnswer": {
            "@type": "Answer",
            "text": escapeJsonString(item.answer)
          }
        }))
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="bg-white text-black antialiased">
        
        {/* --- 1. HERO SECTION --- */}
        <section className="relative h-screen w-full flex flex-col justify-center overflow-hidden bg-black">
          <h1 className="sr-only">
            LINJIN LUXURY — Handcrafted Artisan Togo and Box Calf Leather Handbags • Direct from Southern China Private Atelier • M2C Luxury
          </h1>

          <div className="absolute inset-0 z-0">
            <Image 
              src="/images/hero-main.jpg" 
              alt="LINJIN LUXURY Atelier - Handcrafted luxury leather goods and archival handbag collection" 
              fill 
              priority 
              sizes="100vw"
              className="object-cover opacity-60 animate-kenburns" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
          </div>

          <div className="relative z-10 px-6 md:px-12 lg:px-24 w-full">
            <div className="max-w-[1800px] mx-auto">
              <div className="relative mb-16">
                <div className="text-[16vw] md:text-[12vw] font-bold leading-[0.8] uppercase tracking-[-0.08em] text-white select-none">
                  LINJIN
                </div>
                <div className="mt-4 md:absolute md:bottom-[-2vw] md:right-[15vw]">
                  <span className="font-serif italic lowercase text-[8vw] md:text-[5vw] text-white/70 leading-none">
                    quiet permanence
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-end justify-between gap-12 pt-12 border-t border-white/10">
                <div className="max-w-lg">
                  <p className="text-white/80 text-lg md:text-xl font-light leading-relaxed tracking-tight">
  Directly from our design studio in Southern China to your collection. <br />
  Developed with a focus on material selection and product construction. <br />
  Refined through careful design and production processes.
  <span className="italic font-serif text-white"> archival in nature</span>.
</p>
                  
                  <div className="flex items-center gap-3 mt-8">
                    <div className="relative flex h-2 w-2">
                      <span className="animate-soft-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold">Discreet Worldwide Passage</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 w-full md:w-auto">
                  <Link 
                    href="/collection/all" 
                    aria-label="Explore the LINJIN LUXURY full collection"
                    className="group px-16 py-6 bg-white text-black flex items-center justify-center transition-all hover:bg-neutral-200"
                  >
                    <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Explore the Collection</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>


{/* --- 1.5 HOUSE STATEMENT --- */}
<section className="py-32 bg-white border-t border-black/5 px-6 md:px-24">
  <div className="max-w-[900px] mx-auto text-center">
    <h2 className="text-[10px] uppercase tracking-[0.5em] text-black/30 mb-10">
      House Statement
    </h2>

    <p className="text-xl md:text-2xl font-light leading-relaxed tracking-tight text-black/80">
      LINJIN LUXURY operates as a design and production studio focused on leather goods development.
      Each piece is shaped through material selection, structural construction, and controlled small-batch production.
      The result is a restrained and functional interpretation of contemporary leather craftsmanship.
    </p>
  </div>
</section>

        {/* --- 2. CATEGORY GRID --- */}
        <section className="py-40 bg-white px-6 md:px-24">
          <div className="max-w-[1700px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link href="/women" aria-label="Shop Women's Luxury Collection" className="md:col-span-2 md:row-span-2 relative group overflow-hidden h-[600px] md:h-[800px] bg-neutral-100">
              <Image 
                src="/images/cat-women.jpg" 
                alt="LINJIN LUXURY Women's Collection - Handcrafted handbags" 
                fill 
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-[3s]" 
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
              <div className="absolute bottom-10 left-10">
                <span className="text-white text-[11px] tracking-[0.3em] uppercase font-bold">Collection I — Women</span>
              </div>
            </Link>
            
            <Link href="/men" aria-label="Shop Men's Premium Leather Goods" className="md:col-span-2 relative group overflow-hidden h-[390px] bg-neutral-100">
              <Image 
                src="/images/cat-men.jpg" 
                alt="LINJIN LUXURY Men's Collection - Briefcases and leather goods" 
                fill 
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-[3s]" 
              />
              <div className="absolute bottom-10 left-10">
                <span className="text-white text-[11px] tracking-[0.3em] uppercase font-bold"> Collection II — Men</span>
              </div>
            </Link>
            
            <Link href="/accessory" aria-label="Shop Artisan Accessories" className="md:col-span-2 relative group overflow-hidden h-[390px] bg-neutral-100">
              <Image 
                src="/images/cat-accessories.jpg" 
                alt="LINJIN LUXURY Artisan Accessories" 
                fill 
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-[3s]" 
              />
              <div className="absolute bottom-10 left-10">
                <span className="text-white text-[11px] tracking-[0.3em] uppercase font-bold">Collection III — Accessories</span>
              </div>
            </Link>
          </div>
        </section>

        {/* --- 3. NEW ARRIVALS --- */}
        <section className="py-40 bg-white border-t border-black/5 px-6 md:px-24">
          <div className="max-w-[1700px] mx-auto">
            <header className="flex justify-between items-end mb-24">
              <div>
                <span className="text-[10px] text-black/30 tracking-[0.3em] uppercase font-bold block mb-4">Current Editions</span>
                <h2 className="text-4xl font-light tracking-tighter uppercase">Recent Atelier Works</h2>
              </div>
              <Link href="/collection/all" className="text-[10px] border-b border-black pb-1 uppercase font-bold tracking-widest">View All</Link>
            </header>
            
            {newArrivals.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-16">
                {newArrivals.map((product, index) => (
                  <article key={product.id} className="group">
                    <Link href={product.isLimited ? `/limited/${product.slug}` : `/product/${product.slug}`} aria-label={`View details for ${product.name}`}>
                      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-10 flex items-center justify-center">
                        {product.previewImage ? (
                          <Image 
                            src={product.previewImage} 
                            alt={product.altText} 
                            fill 
                            priority={index === 0}
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s]" 
                            
                          />
                        ) : (
                          <span className="text-[9px] uppercase tracking-widest text-black/20">No Image Available</span>
                        )}
                      </div>
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3">{toTitleCase(product.name)}</h3>
                      <p className="text-[11px] text-black/30 font-light tracking-widest">{formatCurrency(product.price)}</p>
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-16 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-neutral-100 rounded-sm" />
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* --- 4. THE RESERVE --- */}
        <section className="bg-[#0e0e0e] text-white pt-32 pb-24 px-6 md:px-24 border-t border-white/5">
          <div className="max-w-[1500px] mx-auto">
            
            <header className="flex flex-col items-center text-center mb-16 max-w-xl mx-auto pb-10 border-b border-white/5">
              <span className="text-white text-[10px] font-bold uppercase tracking-[0.5em] mb-5 block">
                Archive Registry // 2026
              </span>
              <h2 className="text-6xl md:text-8xl font-light tracking-tighter uppercase mb-6 leading-none">
                The <span className="italic font-serif text-white/60">Private Edition</span>
              </h2>
              <p className="text-white/40 text-[13px] uppercase tracking-[0.2em] leading-loose max-w-sm">
                Limited production pieces available for private clients and archival collectors. Hand-numbered batches.
              </p>
            </header>

            {limitedProducts.length > 0 ? (
              <>
                <article className="group relative mb-48 border border-white/5 bg-neutral-900/40 p-12">
                  <Link href={`/limited/${limitedProducts[0].slug}`} className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                    <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900 flex items-center justify-center">
                      {limitedProducts[0].previewImage ? (
                        <Image 
                          src={limitedProducts[0].previewImage} 
                          alt={`${limitedProducts[0].name} - Exclusive Limited Edition Release`} 
                          fill 
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover opacity-90 group-hover:scale-105 transition-all duration-[4s]" 
                        />
                      ) : (
                        <span className="text-[9px] uppercase tracking-widest text-white/20">No Image Available</span>
                      )}
                    </div>
                    <div className="p-10 text-center md:text-left">
                      <div className="flex items-center gap-3 justify-center md:justify-start mb-6">
                        <span className="h-[1px] w-6 bg-white/30"></span>
                        <span className="text-[10px] text-white/50 uppercase tracking-[0.3em]">Signature Bench-Work / Archival Release</span>
                      </div>
                      <h3 className="text-4xl md:text-5xl font-light tracking-tighter uppercase mb-6 leading-tight">{limitedProducts[0].name}</h3>
                      <p className="text-white/40 text-[12px] uppercase tracking-widest leading-loose mb-10 max-w-sm mx-auto md:mx-0">
                        Finished with a botanical-dyed veg-tanned panel, this edition is material excellence in its purest form.
                      </p>
                      <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/10 pt-10">
                        <p className="text-3xl font-serif italic text-white">{formatCurrency(limitedProducts[0].price)}</p>
                        <span className="bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] px-12 py-5 border border-white hover:bg-neutral-200 transition-all">Secure this Edition →</span>
                      </div>
                    </div>
                  </Link>
                </article>

                {limitedProducts.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {limitedProducts.slice(1).map((product) => (
                      <article key={product.id} className="group border border-white/5 p-10 bg-neutral-900/30">
                        <Link href={`/limited/${product.slug}`}>
                          <div className="relative aspect-[16/11] bg-neutral-900 overflow-hidden mb-12 flex items-center justify-center">
                            {product.previewImage ? (
                              <Image 
                                src={product.previewImage} 
                                alt={product.name} 
                                fill 
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[3s]" 
                              />
                            ) : (
                              <span className="text-[9px] uppercase tracking-widest text-white/20">No Image Available</span>
                            )}
                            <div className="absolute top-6 right-6 text-[9px] uppercase tracking-widest bg-black/50 px-3 py-1 border border-white/10">
                              [ Limited Allocation ]
                            </div>
                          </div>
                          <div className="flex justify-between items-end border-l border-emerald-500/30 pl-6">
                            <div>
                              <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-2">{product.name}</h3>
                              <p className="text-[10px] text-white/30 uppercase tracking-widest italic font-serif">Atelier Series / Veg-Tanned Edition</p>
                            </div>
                            <p className="text-lg font-serif italic text-white/60">{formatCurrency(product.price)}</p>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-[600px] bg-neutral-900/50 animate-pulse border border-white/5" />
            )}

            <div className="mt-24 flex justify-center">
              <Link href="/limited" className="group flex flex-col items-center">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.5em] mb-4 group-hover:text-white transition-colors">
                  View All Private Editions
                </span>
                <div className="h-[1px] w-24 bg-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* --- 5. STUDIO PROTOCOL --- */}
        <section className="py-32 bg-white border-t border-black/5 px-6 md:px-24">
          <div className="max-w-[1700px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 md:gap-12">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20 leading-loose"> Production <br /> System </h2>
            
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 underline underline-offset-8 decoration-black/10">01. Provenance</h4>
              <p className="text-[11px] text-black/50 uppercase tracking-widest leading-loose">
                Each piece is produced under controlled studio conditions with emphasis on material consistency, structural integrity, and long-term usability.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 underline underline-offset-8 decoration-black/10">02. Materiality</h4>
              <p className="text-[11px] text-black/50 uppercase tracking-widest leading-loose">
                Materials are sourced from certified tanneries and inspected in small batches prior to production.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 underline underline-offset-8 decoration-black/10">03. Passage</h4>
              <p className="text-[11px] text-black/50 uppercase tracking-widest leading-loose">
                Every piece is delivered through fully tracked and insured international logistics systems, ensuring secure global passage from atelier to client.
              </p>
            </div>
          </div>
        </section>

        {/* --- 6. ATELIER FAQ --- */}
        <section className="py-32 bg-[#fafafa] border-t border-black/5 px-6 md:px-24">
          <div className="max-w-[1400px] mx-auto">
            <header className="mb-20 text-center">
              <span className="text-[10px] text-black/30 tracking-[0.3em] uppercase font-bold block mb-4">Client Inquiries</span>
              <h2 className="text-3xl font-light tracking-tighter uppercase">Frequently Asked Questions</h2>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
              {faqs && faqs.length > 0 ? (
                faqs.slice(0, 4).map((item) => (
                  <article key={item.id}>
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
                      {item.question}
                    </h4>
                    <p className="text-[12px] text-black/60 leading-loose">
                      {item.answer}
                    </p>
                  </article>
                ))
              ) : (
                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                      <div className="h-16 bg-neutral-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 社交展示 */}
        <InstagramCarousel />

      </main>
    </>
  );
}