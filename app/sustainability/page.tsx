import React from 'react';
import Image from 'next/image';

// 1. SEO 元数据优化 (针对 Google 搜索结果)
export const metadata = {
  title: 'Sustainability & Craftsmanship | LinJin Luxury (LJL)',
  description: 'Experience the LJL Manufacturer-to-Consumer (M2C) revolution. We combine ethical sourcing with traditional craftsmanship to create timeless, zero-waste luxury handbags.',
  keywords: ['sustainable luxury', 'M2C fashion brand', 'handcrafted handbags', 'ethical leather sourcing', 'LinJin Luxury sustainability'],
  alternates: {
    canonical: 'https://linjinluxury.com/sustainability', // 记得上线后更换为你的域名
  },
  openGraph: {
    title: 'LinJin Luxury: Ethical Craftsmanship & Sustainable Future',
    description: 'Bypassing the middleman to deliver handcrafted luxury directly from our atelier to your doorstep.',
    url: 'https://linjinluxury.com/sustainability',
    siteName: 'LinJin Luxury',
    images: [{ url: '/images/sustainability-og.jpg', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
};

export default function SustainabilityPage() {
  
  // 2. 结构化数据 (JSON-LD) - 原生对象格式，无需安装 schema-dts
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "LinJin Luxury",
        "alternateName": "LJL",
        "url": "https://linjinluxury.com",
        "logo": "https://linjinluxury.com/logo.png",
        "description": "A boutique manufacturer-to-consumer brand specializing in sustainable, handcrafted luxury handbags.",
        "ethicsPolicy": "https://linjinluxury.com/sustainability"
      },
      {
        "@type": "WebPage",
        "name": "Our Sustainability Commitment",
        "description": "How LJL redefined the connection between manufacturer and consumer through ethical practices."
      }
    ]
  };

  return (
    <>
      {/* 将结构化数据注入 HTML 头部，SEO 权重核心 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="bg-white selection:bg-stone-900 selection:text-white text-stone-900 overflow-hidden font-sans">
        
        {/* --- HERO SECTION --- 
            响应式：手机端高度 70vh，PC端高度 100vh，确保第一眼视觉冲击 */}
        <section className="relative h-[70vh] md:h-screen w-full flex items-center justify-center bg-stone-100">
          <Image 
            src="/images/sustainability-hero.jpg" 
            alt="Artisan hands crafting a LinJin Luxury handbag with ethical leather"
            fill
            priority
            quality={90}
            className="object-cover brightness-[0.8]"
          />
          <div className="relative z-10 text-center px-6">
            <h1 className="text-white text-4xl md:text-7xl font-serif tracking-tight mb-4">
              Modern Heritage
            </h1>
            <p className="text-white/90 text-xs md:text-sm uppercase tracking-[0.4em] font-light">
              Manufacturer to Consumer · Ethical · Timeless
            </p>
          </div>
        </section>

        {/* --- BRAND MANIFESTO --- 
            响应式：文字大小随屏幕缩放，适配移动端阅读 */}
        <section className="max-w-5xl mx-auto py-24 md:py-32 px-6 text-center">
          <article>
            <h2 className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-stone-400 mb-8 md:mb-12 italic">
              The LJL Manifesto
            </h2>
            <p className="text-xl md:text-4xl font-serif leading-[1.6] md:leading-[1.7] text-stone-800">
              By owning the entire process from <span className="underline decoration-stone-200 underline-offset-8">Manufacturer to Consumer</span>, 
              we eliminate the excess of traditional retail. No middlemen. No overproduction. 
              Just pure craftsmanship delivered directly to you.
            </p>
          </article>
        </section>

        <hr className="border-stone-100 mx-auto w-1/3" />

        {/* --- CORE PILLARS --- 
            响应式：手机端 1 列，PC端 3 列 */}
        <section className="max-w-7xl mx-auto py-24 md:py-32 px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24">
            {/* Pillar 01 */}
            <div className="space-y-4 md:space-y-6 group">
              <span className="text-stone-200 text-5xl md:text-6xl font-serif group-hover:text-stone-900 transition-colors duration-500">01</span>
              <h3 className="text-xl font-medium tracking-tight">Ethical Sourcing</h3>
              <p className="text-stone-500 font-light leading-relaxed text-sm md:text-base">
                We exclusively use hides that are byproducts of the food industry, sourced from LWG-certified tanneries. 
                Our commitment to the environment begins with the raw material.
              </p>
            </div>
            {/* Pillar 02 */}
            <div className="space-y-4 md:space-y-6 group">
              <span className="text-stone-200 text-5xl md:text-6xl font-serif group-hover:text-stone-900 transition-colors duration-500">02</span>
              <h3 className="text-xl font-medium tracking-tight">Craft-Led Production</h3>
              <p className="text-stone-500 font-light leading-relaxed text-sm md:text-base">
                Every LJL bag is handcrafted in our own atelier. This internal oversight ensures 
                fair wages, safe working conditions, and a zero-waste cutting philosophy.
              </p>
            </div>
            {/* Pillar 03 */}
            <div className="space-y-4 md:space-y-6 group">
              <span className="text-stone-200 text-5xl md:text-6xl font-serif group-hover:text-stone-900 transition-colors duration-500">03</span>
              <h3 className="text-xl font-medium tracking-tight">Direct Traceability</h3>
              <p className="text-stone-500 font-light leading-relaxed text-sm md:text-base">
                Transparency is our ultimate luxury. From our studio in Southern China to Singapore, 
                Thailand, and the US—we track every step to minimize our carbon footprint.
              </p>
            </div>
          </div>
        </section>

        {/* --- FAQ SECTION (GEO/AI 引擎优化) --- */}
        <section className="bg-stone-50 py-20 md:py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-serif mb-10 md:mb-12 text-center text-stone-800">Sustainability FAQ</h2>
            <div className="space-y-8">
              <div className="border-b border-stone-200 pb-6">
                <h4 className="font-medium mb-2 text-sm md:text-base text-stone-900">How does M2C benefit the environment?</h4>
                <p className="text-stone-500 text-xs md:text-sm font-light leading-relaxed">It reduces the carbon footprint by cutting out multiple shipping stages between agents and distributors, delivering straight from our factory.</p>
              </div>
              <div className="border-b border-stone-200 pb-6">
                <h4 className="font-medium mb-2 text-sm md:text-base text-stone-900">Are your leathers eco-friendly?</h4>
                <p className="text-stone-500 text-xs md:text-sm font-light leading-relaxed">We use chrome-free and vegetable-tanned leathers whenever possible to ensure minimal chemical impact on water systems.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- FINAL CTA --- */}
        <section className="py-24 md:py-32 text-center px-6">
          <h2 className="text-[10px] md:text-xs uppercase tracking-[0.4em] mb-8 text-stone-400">Own a piece of the future</h2>
          <a 
            href="/collection" 
            className="group relative inline-flex items-center justify-center px-12 md:px-16 py-4 md:py-5 overflow-hidden border border-stone-900"
          >
            <span className="relative z-10 text-[10px] md:text-xs uppercase tracking-widest group-hover:text-white transition-colors duration-500">
              Shop the Collection
            </span>
            <span className="absolute inset-0 bg-stone-900 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></span>
          </a>
        </section>

      </main>
    </>
  );
}