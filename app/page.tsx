// app/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { hygraph } from '@/lib/hygraph';
import InstagramCarousel from './components/InstagramCarousel';
import { createClient } from '@/utils/supabase/server';

// ISR: 每1小时重新验证/更新页面
export const revalidate = 3600;

// 1. 严格的类型定义
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  gender: { name: string } | null;      
  category: { name: string } | null;    
  subCategories: { name: string }[]; 
  images: { url: string }[];
};

// 2. 动态 metadata (SEO 优化) - 增强版
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'LINJIN LUXURY | Premium Supply Chain Handbags | LA Studio',
    description: 'From studio to wardrobe. We offer master-quality designer handbags direct from premium supply chains with worldwide express shipping.',
    keywords: 'luxury handbags, designer bags, premium supply chain, LA fashion studio, high-quality replicas, eternal archive, women bags, men accessories',
    alternates: { canonical: 'https://www.linjinluxury.com' }, // 建议统一使用 www 域名
    
    openGraph: {
      title: 'LINJIN LUXURY | Premium Supply Chain Handbags | LA Studio',
      description: 'From studio to wardrobe. We offer master-quality designer handbags direct from premium supply chains with worldwide express shipping.',
      images: [{ url: '/og-home.jpg', width: 1200, height: 630, alt: 'LINJIN LUXURY Home' }],
      url: 'https://www.linjinluxury.com',
      type: 'website',
      siteName: 'LINJIN LUXURY',
      locale: 'en_US',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: 'LINJIN LUXURY | Premium Supply Chain Handbags | LA Studio',
      description: 'From studio to wardrobe. We offer master-quality designer handbags direct from premium supply chains with worldwide express shipping.',
      images: ['/og-home.jpg'],
    },
    
    // ✅ 关键修改：删除 icons 部分，让它自动继承 layout.tsx 中的 /icon.png
    // ✅ 关键修改：删除 viewport，因为 layout.tsx 里已经定义了更详细的移动端优化配置
    
    robots: {
      index: true,
      follow: true,
    },
  };
}

// 新增：生成 JSON-LD 结构化数据函数（SEO + GEO 优化）
function generateJsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "LINJIN LUXURY",
    "url": "https://www.linjinluxury.com",
    "logo": "https://www.linjinluxury.com/icon.png",
    "description": "Premium supply chain specialists for luxury handbags and fashion items.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Fashion St", // 你的店铺地址
      "addressLocality": "Los Angeles",
      "addressRegion": "CA",
      "postalCode": "90001",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 34.0522,
      "longitude": -118.2437
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-123-456-7890",
      "contactType": "Customer Service"
    }
  };

  return [organizationSchema]; // 返回数组，便于渲染多个 script
}

export default async function HomePage() {
  const supabase = await createClient();

  // 路径格式化工具
  const formatPath = (val: any) => {
    if (!val) return 'all';
    const target = Array.isArray(val) ? val[0] : val;
    const name = typeof target === 'string' ? target : (target?.name || 'all');
    return name.toLowerCase().trim().replace(/\s+/g, '-') || 'all';
  };

  // 价格格式化：美式习惯 ($1,250.00)
  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const toTitleCase = (str: string): string => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // 获取数据
  let newArrivals: Product[] = [];
  let limitedProducts: Product[] = [];
  try {
    const GET_HOME_DATA = `
      query GetHomeData {
        newArrivals: products(where: { isNew: true }, orderBy: publishedAt_DESC, first: 4) {
          id name slug price gender { name } category { name } subCategories { name } images(first: 2) { url }
        }
        limitedProducts: products(where: { isLimited: true }, orderBy: createdAt_ASC, first: 3) {
          id name slug price gender { name } category { name } subCategories { name } images(first: 1) { url }
        }
      }
    `;
    const data: any = await hygraph.request(GET_HOME_DATA);
    newArrivals = data.newArrivals || [];
    limitedProducts = data.limitedProducts || [];
  } catch (e) { console.error(e); }

  let displayFaqs: { question: string; answer: string }[] = [];
  try {
    const { data: faqData } = await supabase.from('faq_sections').select('*').order('display_order');
    if (faqData) displayFaqs = faqData.flatMap(section => section.items || []).slice(0, 4);
  } catch (e) { console.error(e); }

  const jsonLdScripts = generateJsonLd(); // 新增：生成 JSON-LD

  return (
    <>
      {jsonLdScripts.map((schema, index) => ( // 新增：渲染 JSON-LD script 标签
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <main className="bg-white text-black antialiased selection:bg-black selection:text-white">
      
        {/* --- HERO SECTION --- */}
        <section className="relative h-[80vh] flex flex-col justify-end pb-12 px-6 md:px-24 overflow-hidden">
          <Image src="/images/hero-main.jpg" alt="LINJIN LUXURY" fill priority className="object-cover" />
          <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-8 text-white">
            <h1 className="text-[50px] md:text-[120px] font-light tracking-tighter uppercase leading-[0.8]">
              LINJIN<br /><span className="italic font-serif lowercase opacity-90">Eternal Archive</span>
            </h1>
            <Link href="/collection" className="group flex items-center gap-4 pb-2 border-b border-white/30 hover:border-white transition-colors">
              <span className="text-[10px] tracking-[0.3em] uppercase font-bold">Explore Collection</span>
              <span className="text-lg group-hover:translate-x-3 transition-transform">→</span>
            </Link>
          </div>
        </section>

        {/* --- ASYMMETRIC GRID --- */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              <Link href="/women/all/all" className="md:col-span-2 md:row-span-2 relative group overflow-hidden bg-gray-50 h-[450px] md:h-[800px]">
                <Image src="/images/cat-women.jpg" alt="Women's Collection" fill className="object-cover group-hover:scale-105 transition-all duration-1000" sizes="(max-width: 768px) 100vw, 50vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8"><h3 className="text-white text-[16px] md:text-[18px] tracking-[0.5em] uppercase font-bold">Women</h3></div>
              </Link>
              <Link href="/men/all/all" className="md:col-span-2 relative group overflow-hidden bg-gray-50 h-[250px] md:h-auto">
                <Image src="/images/cat-men.jpg" alt="Men's Luxury Pieces" fill className="object-cover group-hover:scale-105 transition-all duration-1000" sizes="(max-width: 768px) 100vw, 50vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8"><h3 className="text-white text-[14px] tracking-[0.4em] uppercase font-bold">Men</h3></div>
              </Link>
              <Link href="/accessory/all/all" className="md:col-span-2 relative group overflow-hidden bg-gray-50 h-[250px] md:h-auto">
                <Image src="/images/cat-accessories.jpg" alt="Luxury Accessories" fill className="object-cover group-hover:scale-105 transition-all duration-1000" sizes="(max-width: 768px) 100vw, 50vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8"><h3 className="text-white text-[14px] tracking-[0.4em] uppercase font-bold">Accessory</h3></div>
              </Link>
            </div>
          </div>
        </section>

        {/* --- NEW ARRIVALS (Hover 双图切换) --- */}
        <section className="py-20 md:py-32 bg-white border-t border-black/5">
          <div className="max-w-[1600px] mx-auto px-6 md:px-24">
            <header className="flex justify-between items-end mb-12">
              <h2 className="text-[11px] font-bold tracking-[0.4em] uppercase mb-2">New Arrivals</h2>
              <Link href="/collection" className="text-[10px] border-b border-black pb-1 uppercase font-bold">View All</Link>
            </header>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {newArrivals.map((product) => (
                <article key={product.id}>
                  <Link href={`/${formatPath(product.gender)}/${formatPath(product.category)}/${formatPath(product.subCategories)}/${product.slug}`} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-5">
                      <Image src={product.images?.[0]?.url || '/images/placeholder.jpg'} alt={product.name} fill className="object-cover group-hover:opacity-0 transition-opacity duration-700" sizes="(max-width: 768px) 50vw, 25vw" />
                      {product.images?.[1] && <Image src={product.images[1].url} alt={product.name} fill className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700" sizes="(max-width: 768px) 50vw, 25vw" />}
                    </div>
                    <h4 className="text-[10px] tracking-[0.1em] uppercase font-bold mb-1">{toTitleCase(product.name)}</h4>
                    {/* 产品卡片价格颜色保持稍微暗一点以突出标题 */}
                    <p className="text-[11px] font-light text-black/40">{formatCurrency(product.price)}</p>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        

        {/* --- LIMITED VAULT (Black Section) --- */}
        <section className="bg-black py-24 text-white">
          <div className="max-w-[1600px] mx-auto px-6 md:px-24">
            <div className="mb-20">
              <p className="text-[10px] tracking-[0.5em] uppercase text-white/40 font-bold mb-4">Studio Private Vault</p>
              <h2 className="text-[36px] md:text-[56px] font-light tracking-tighter uppercase leading-none">
                Limited <span className="font-serif italic lowercase">acquisitions</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {limitedProducts.map((product) => (
                <article key={product.id}>
                  <Link href={`/limited/${product.slug}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900 mb-8">
                      <Image src={product.images?.[0]?.url || '/images/placeholder.jpg'} alt={product.name} fill className="object-cover opacity-90 group-hover:opacity-100 transition-all duration-1000" sizes="(max-width: 768px) 100vw, 33vw" />
                    </div>
                    <h4 className="text-[10px] tracking-[0.2em] uppercase font-bold mb-2 text-white/90">{toTitleCase(product.name)}</h4>
                    <div className="flex items-baseline gap-4">
                      <p className="text-[12px] font-light text-white/30 tracking-widest">{formatCurrency(product.price)}</p>
                      <span className="text-[8px] uppercase tracking-tighter text-red-500/80 font-bold px-1.5 py-0.5 border border-red-500/20">Only 1 Available</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* --- GLOBAL LOGISTICS PROMISE (Trust Badges) (image_1.png) 整体微调 --- */}
        <section className="py-20 bg-white border-b border-black/5">
          <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              {/* 标题变为纯黑并放大至 [11px] */}
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4 text-black">Global Express</span>
              {/* 描述文字变为纯黑并放大至 [11px] */}
              <p className="text-[11px] text-black uppercase tracking-[0.2em] leading-relaxed">
                Studio to door delivery <br /> within 5-7 business days.
              </p>
            </div>
            <div className="flex flex-col items-center text-center border-y md:border-y-0 md:border-x border-black/5 py-10 md:py-0">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4 text-black">Master Quality</span>
              <p className="text-[11px] text-black uppercase tracking-[0.2em] leading-relaxed">
                Direct from premium supply chains <br /> with hand-selected inspection.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] mb-4 text-black">Secure Tracking</span>
              <p className="text-[11px] text-black uppercase tracking-[0.2em] leading-relaxed">
                Full end-to-end tracking <br /> provided for every acquisition.
              </p>
            </div>
          </div>
        </section>
        
        {/* --- BRAND MANIFESTO (Cinematic Wide) --- */}
        <section className="py-24 bg-[#fafafa] overflow-hidden border-y border-black/5">
          <div className="max-w-[1400px] mx-auto px-6 text-center">
            
            <div className="relative w-full aspect-[21/9] max-h-[500px] mb-20 overflow-hidden bg-neutral-200 shadow-xl group">
               <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                 <source src="/videos/brand-detail.mp4" type="video/mp4" />
               </video>
               <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/5 pointer-events-none"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white/40 text-[9px] md:text-[10px] tracking-[1.2em] uppercase font-bold">Studio-to-Wardrobe</span>
               </div>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* LINJIN LUXURY | Los Angeles (image_3.png) 放大并变为纯黑 */}
              <h2 className="text-[11px] tracking-[0.6em] font-bold uppercase mb-12 text-black">
                LINJIN LUXURY | Los Angeles
              </h2>
              
              <p className="text-2xl md:text-4xl font-light leading-snug tracking-tighter text-black/90 mb-10">
                Premium Supply Chain Specialists. From the <span className="font-serif italic">Studio Floor</span> to your <span className="font-serif italic">Wardrobe</span>.
              </p>

              {/* Divider (image_2.png) 保持淡灰色以显精致 */}
              <div className="text-black/10 text-2xl mb-10">/</div>

              {/* 补充说明文字 (image_2.png) 放大并变为纯黑 */}
              <p className="text-[12px] uppercase tracking-[0.3em] font-medium text-black max-w-xl mx-auto leading-loose">
                Curated precision. Master-level leatherwork at honest pricing.
              </p>
            </div>
          </div>
        </section>

        {/* --- FAQ SECTION (Home Page Summary) --- */}
<section className="py-24 bg-white px-6 md:px-24">
  <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-20">
    
    {/* 左侧：Service Journal 入口标题 */}
    <div className="lg:w-1/3">
      <h3 className="text-3xl font-light uppercase tracking-tighter mb-8 text-black">
        Service <span className="font-serif italic lowercase text-black/40">journal</span>
      </h3>
      
      {/* 调整后的 Essential Questions 标题链接 */}
      <Link href="/essential-questions" className="group inline-block mb-10">
        <h4 className="text-[11px] text-black font-bold uppercase tracking-[0.4em] group-hover:opacity-50 transition-opacity">
          Essential Questions <span className="ml-2">↗</span>
        </h4>
      </Link>
    </div>

    {/* 右侧：FAQ 列表与 View All 按钮 */}
    <div className="lg:w-2/3 w-full">
      <div className="divide-y divide-black/10 border-b border-black/10">
        {displayFaqs.slice(0, 4).map((item, idx) => (
          <details key={idx} className="group py-7 outline-none cursor-pointer">
            <summary className="flex justify-between items-center list-none">
              <span className="text-[11px] font-bold uppercase tracking-widest text-black">
                {item.question}
              </span>
              <span className="text-lg font-light transition-transform duration-500 group-open:rotate-45 text-black">
                +
              </span>
            </summary>
            <div className="pt-6 text-[13px] text-black/80 font-light leading-relaxed max-w-xl">
              {item.answer}
            </div>
          </details>
        ))}
      </div>

      {/* 新增：View All FAQ 按钮 (对应 image_846a4e.png 箭头位置) */}
      <div className="mt-12 flex justify-start">
        <Link 
          href="/essential-questions" 
          className="text-[11px] font-bold uppercase tracking-[0.3em] border-b border-black pb-1 hover:opacity-50 transition-all text-black inline-flex items-center gap-4"
        >
          View All FAQ <span>—</span>
        </Link>
      </div>
    </div>
  </div>
</section>

        <InstagramCarousel />
        
       
      </main>
    </>
  );
}