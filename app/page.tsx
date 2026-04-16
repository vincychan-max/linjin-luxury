import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { hygraph } from '@/lib/hygraph';
import InstagramCarousel from './components/InstagramCarousel';
import { createClient } from '@/utils/supabase/server';

// 🌟 调整为 10 分钟 (600 秒)，兼顾更新频率与 API 安全
export const revalidate = 600;

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  altText?: string;
  previewImage: string; // 预处理后的图片地址
};

// --- SEO Metadata 优化 ---
export async function generateMetadata(): Promise<Metadata> {
  const siteTitle = 'Luxury Handbags & Leather Goods | LINJIN LUXURY Atelier';
  const siteDesc = 'Direct-to-client luxury handbags crafted with premium materials. LINJIN LUXURY offers archival designs and artisan craftsmanship directly from our workshop.';
  
  return {
    title: siteTitle,
    description: siteDesc,
    keywords: 'luxury handbags, M2C leather goods, artisan handbags, premium leather bags, workshop direct luxury, LINJIN LUXURY, Garden Bucket 30',
    alternates: {
      canonical: 'https://www.linjinluxury.com',
    },
    openGraph: {
      title: siteTitle,
      description: siteDesc,
      url: 'https://www.linjinluxury.com',
      siteName: 'LINJIN LUXURY',
      images: [
        {
          url: 'https://www.linjinluxury.com/images/og-main.jpg',
          width: 1200,
          height: 630,
          alt: 'LINJIN LUXURY Atelier Collection',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
  };
}

export default async function HomePage() {
  const supabase = await createClient();

  // --- 结构化数据 (JSON-LD) ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "LINJIN LUXURY",
    "url": "https://www.linjinluxury.com",
    "logo": "https://www.linjinluxury.com/logo.png",
    "description": "An independent luxury atelier specializing in handcrafted leather handbags directly from the source.",
    "brand": {
      "@type": "Brand",
      "name": "LINJIN LUXURY"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "service@linjinluxury.com"
    }
  };

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 0,
    }).format(price);
  };

  const toTitleCase = (str: string) => str.replace(/\b\w/g, (l) => l.toUpperCase());

  let newArrivals: Product[] = [];
  let limitedProducts: Product[] = [];

  try {
    // GraphQL 查询适配 Variants 架构
    const data: any = await hygraph.request(`
      query GetHomeData {
        newArrivals: products(where: { isNew: true }, orderBy: publishedAt_DESC, first: 4) {
          id 
          name 
          slug 
          price 
          altText 
          variants {
            ... on ProductVariant {
              images(first: 1) { url }
            }
          }
        }
        limitedProducts: products(where: { isLimited: true }, orderBy: createdAt_ASC, first: 3) {
          id 
          name 
          slug 
          price 
          altText 
          variants {
            ... on ProductVariant {
              images(first: 1) { url }
            }
          }
        }
      }
    `);

    // 将深层嵌套的图片地址提取到一层
    const processProducts = (products: any[]): Product[] => {
      return products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        altText: p.altText,
        previewImage: p.variants?.[0]?.images?.[0]?.url || '/images/placeholder.jpg'
      }));
    };

    newArrivals = processProducts(data.newArrivals || []);
    limitedProducts = processProducts(data.limitedProducts || []);

  } catch (e) { 
    console.error("Hygraph Data Fetching Error:", e); 
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="bg-white text-black antialiased">
        
        {/* --- HERO SECTION --- */}
        <section className="relative h-screen w-full flex flex-col justify-center overflow-hidden bg-black">
          <div className="absolute inset-0 z-0">
            <Image 
              src="/images/hero-main.jpg" 
              alt="LINJIN LUXURY - High-end M2C leather handbags direct from our private atelier" 
              fill 
              priority 
              className="object-cover opacity-60 animate-kenburns" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
          </div>

          <div className="relative z-10 px-6 md:px-12 lg:px-24 w-full">
            <div className="max-w-[1800px] mx-auto">
              <div className="relative mb-16">
                <h1 className="text-[16vw] md:text-[12vw] font-bold leading-[0.8] uppercase tracking-[-0.08em] text-white">
                  LINJIN
                </h1>
                <div className="mt-4 md:absolute md:bottom-[-2vw] md:right-[15vw]">
                  <span className="font-serif italic lowercase text-[8vw] md:text-[5vw] text-white/70 leading-none">
                    quiet permanence
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-end justify-between gap-12 pt-12 border-t border-white/10">
                <div className="max-w-lg">
                  <p className="text-white/80 text-lg md:text-xl font-light leading-relaxed tracking-tight">
                    Directly from our workshop to your collection. <br />
                    Eliminating the excess. Focusing on the stitch. <span className="italic font-serif text-white">archival in nature</span>.
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
                  <Link href="/collection/all" className="group px-16 py-6 bg-white text-black flex items-center justify-center transition-all hover:bg-neutral-200">
                    <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Explore the Collection</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- CATEGORY GRID --- */}
        <section className="py-40 bg-white px-6 md:px-24">
          <div className="max-w-[1700px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link href="/women/all/all" className="md:col-span-2 md:row-span-2 relative group overflow-hidden h-[600px] md:h-[800px] bg-neutral-100">
              <Image 
                src="/images/cat-women.jpg" 
                alt="LINJIN LUXURY Women's Collection - Handcrafted luxury handbags and leather goods" 
                fill 
                className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-[3s]" 
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
              <div className="absolute bottom-10 left-10"><h3 className="text-white text-[11px] tracking-archive uppercase font-bold">Women</h3></div>
            </Link>
            <Link href="/men/all/all" className="md:col-span-2 relative group overflow-hidden h-[390px] bg-neutral-100">
              <Image 
                src="/images/cat-men.jpg" 
                alt="LINJIN LUXURY Men's Collection - Premium leather briefcases and travel bags" 
                fill 
                className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-[3s]" 
              />
              <div className="absolute bottom-10 left-10"><h3 className="text-white text-[11px] tracking-archive uppercase font-bold">Men</h3></div>
            </Link>
            <Link href="/accessory/all/all" className="md:col-span-2 relative group overflow-hidden h-[390px] bg-neutral-100">
              <Image 
                src="/images/cat-accessories.jpg" 
                alt="LINJIN LUXURY Accessories - Artisanal small leather goods" 
                fill 
                className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-[3s]" 
              />
              <div className="absolute bottom-10 left-10"><h3 className="text-white text-[11px] tracking-archive uppercase font-bold">Accessory</h3></div>
            </Link>
          </div>
        </section>

        {/* --- NEW ARRIVALS (指向 /product/) --- */}
        <section className="py-40 bg-white border-t border-black/5 px-6 md:px-24">
          <div className="max-w-[1700px] mx-auto">
            <header className="flex justify-between items-end mb-24">
              <div>
                <span className="text-[10px] text-black/30 tracking-archive uppercase font-bold block mb-4">Current Editions</span>
                <h2 className="text-4xl font-light tracking-tighter uppercase">Recent Atelier Works</h2>
              </div>
              <Link href="/collection/all" className="text-[10px] border-b border-black pb-1 uppercase font-bold tracking-widest">View All</Link>
            </header>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-16">
              {newArrivals.map((product) => (
                <article key={product.id} className="group">
                  <Link href={`/product/${product.slug}`}>
                    <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50 mb-10">
                      <Image 
                        src={product.previewImage} 
                        alt={product.altText || product.name} 
                        fill 
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s]" 
                      />
                    </div>
                    <h4 className="text-[11px] font-bold uppercase tracking-protocol mb-3">{toTitleCase(product.name)}</h4>
                    <p className="text-[11px] text-black/30 font-light tracking-widest">{formatCurrency(product.price)}</p>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
        
        {/* --- THE RESERVE (修正指向 /limited/) --- */}
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
                  Limited production pieces available for private clients, brands, and selected partners. Custom orders supported.
              </p>
            </header>

            {/* 1. 主打限量款 (修正路径为 /limited/) */}
            {limitedProducts[0] && (
              <article className="group relative mb-48 border border-white/5 bg-neutral-900/40 p-12">
                <Link href={`/limited/${limitedProducts[0].slug}`} className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image 
                      src={limitedProducts[0].previewImage} 
                      alt={limitedProducts[0].name} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover opacity-90 group-hover:scale-105 transition-all duration-[4s]" 
                    />
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
            )}

            {/* 2. 次级限量款列表 (修正路径为 /limited/) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {limitedProducts.slice(1).map((product) => (
                <article key={product.id} className="group border border-white/5 p-10 bg-neutral-900/30">
                  <Link href={`/limited/${product.slug}`}>
                    <div className="relative aspect-[16/11] bg-neutral-900 overflow-hidden mb-12">
                      <Image 
                        src={product.previewImage} 
                        alt={product.name} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[3s]" 
                      />
                      <div className="absolute top-6 right-6 text-[9px] uppercase tracking-widest bg-black/50 px-3 py-1 border border-white/10">
                        [ Limited Allocation ]
                      </div>
                    </div>
                    <div className="flex justify-between items-end border-l border-emerald-500/30 pl-6">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-2">{product.name}</h4>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest italic font-serif">Atelier Series / Veg-Tanned Edition</p>
                      </div>
                      <p className="text-lg font-serif italic text-white/60">{formatCurrency(product.price)}</p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            <div className="mt-24 flex justify-center">
              <Link href="/collection/all" className="group flex flex-col items-center">
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

        {/* --- STUDIO PROTOCOL --- */}
        <section className="py-32 bg-white border-t border-black/5 px-6 md:px-24">
          <div className="max-w-[1700px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 md:gap-12">
            <h3 className="text-[10px] font-bold uppercase tracking-archive text-black/20 leading-loose">Studio <br /> Protocol</h3>
            
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-protocol text-black/40 underline underline-offset-8 decoration-black/10">01. Provenance</h4>
              <p className="text-[11px] text-black/50 uppercase tracking-widest leading-loose">
                Atelier origin collection. Facilitated discreetly from source to door.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-protocol text-black/40 underline underline-offset-8 decoration-black/10">02. Materiality</h4>
              <p className="text-[11px] text-black/50 uppercase tracking-widest leading-loose">
                Single-batch materialization. Inspected at the artisan&apos;s bench prior to release.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-protocol text-black/40 underline underline-offset-8 decoration-black/10">03. Passage</h4>
              <p className="text-[11px] text-black/50 uppercase tracking-widest leading-loose">
                Discreet Worldwide Passage.
              </p>
            </div>
          </div>
        </section>

        <InstagramCarousel />
      </main>
    </>
  );
}
