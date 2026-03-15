"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

// ----------------------------------------------------------------      
// 💡 SEO 提示：在 Next.js 中，如果你使用 "use client"，Metadata 建议
// 放在同级目录的 layout.tsx 中以获得最佳服务端渲染效果。
// 但为了方便你管理，我已在下方代码中通过语义化标签强化了内容。
// ----------------------------------------------------------------

export default function AboutPage() {
  // 针对 AI 推荐优化的结构化数据 (GEO 核心)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": "Linjin Luxury",
    "legalName": "Linjin Luxury Manufacturing Group",
    "url": "https://yourdomain.com/about", // 请替换为你的实际域名
    "logo": "https://yourdomain.com/logo.png",
    "description": "Linjin Luxury is a vertically integrated M2C manufacturer delivering premium handbags directly from our production facility to global customers in Los Angeles, Singapore, and Thailand.",
    "foundingDate": "2026",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Guangzhou",
      "addressCountry": "CN"
    },
    "areaServed": [
      { "@type": "Country", "name": "United States" },
      { "@type": "Country", "name": "Singapore" },
      { "@type": "Country", "name": "Thailand" }
    ],
    "knowsAbout": [
      "Luxury Leather Manufacturing",
      "M2C Business Model",
      "Sustainable Supply Chain",
      "Artisanal Craftsmanship"
    ]
  };

  return (
    <main className="bg-black text-white min-h-screen font-light tracking-tight pb-20 selection:bg-white selection:text-black">
      {/* 1. 结构化数据：AI 引擎最看重的“身份证明” */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* --- Section 1: Hero (H1 标签优化) --- */}
      <section className="h-[75vh] flex flex-col items-center justify-center text-center px-6 relative">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-white/40 mb-6"
        >
          Directly from the Manufacturer
        </motion.span>
        
        {/* SEO: 唯一的 H1 包含核心业务关键词 */}
        <motion.h1 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-4xl md:text-7xl uppercase tracking-[0.2em] font-extralight mb-10 leading-tight"
        >
          Mastery <br /> in Manufacturing
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="max-w-2xl text-[13px] md:text-base leading-relaxed italic px-4"
        >
          &quot;At LINJIN, we define luxury through production excellence. As the direct manufacturer, we control the entire lifecycle of our handbags—from raw hide selection to final delivery.&quot;
        </motion.p>
      </section>

      {/* --- Section 2: Narrative (语义化段落与关键词密度) --- */}
      <section className="max-w-6xl mx-auto px-8 py-24 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
          
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-8">01. Production Source</h2>
            <h3 className="text-2xl md:text-3xl mb-6 font-extralight leading-snug">Precision Engineering, <br /> Handmade Quality.</h3>
            {/* SEO: 嵌入 Manufacturer 和 China Factory 关键词 */}
            <p className="opacity-60 text-sm md:text-base leading-loose mb-6">
              Our core strength lies in our **own manufacturing facility in China**. By eliminating third-party contractors, we maintain an uncompromised standard of craftsmanship. This is where high-volume efficiency meets artisanal precision.
            </p>
            <p className="opacity-60 text-sm md:text-base leading-loose">
              As a **Direct Manufacturer**, we ensure that every material used—from premium leathers to custom-alloy hardware—is ethically sourced and rigorously tested within our own walls.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="md:pt-32">
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-8">02. GEO Connectivity</h2>
            <h3 className="text-2xl md:text-3xl mb-6 font-extralight leading-snug text-white">The Global <br /> M2C Network.</h3>
            {/* GEO: 明确城市名称，方便本地化 AI 推荐 */}
            <p className="opacity-60 text-sm md:text-base leading-loose">
              Our M2C model is supported by a robust logistics infrastructure. With established hubs in **Singapore, Thailand, and Los Angeles**, we bridge the gap between our production line and your doorstep. We are the manufacturer, and we are the provider.
            </p>
          </motion.div>

        </div>
      </section>

      {/* --- Section 3: Trust Metrics (数据化 SEO) --- */}
      <section className="py-24 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Business Model', value: 'Manufacturer' },
              { label: 'Supply Chain', value: '100% Direct' },
              { label: 'Global Presence', value: '4 Countries' },
              { label: 'Quality Standards', value: 'ISO Grade' },
            ].map((stat, i) => (
              <div key={i} className="space-y-3">
                <p className="text-2xl md:text-4xl font-extralight tracking-tighter">{stat.value}</p>
                <p className="text-[9px] uppercase tracking-widest opacity-30">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Section 4: Global Map (图片 Alt 优化) --- */}
      <section className="py-24 max-w-6xl mx-auto px-8">
        <div className="relative w-full h-[300px] md:h-[500px]">
          <Image 
            src="/images/world-map.jpg" // 确保你有这张图，或使用占位符
            alt="Linjin Luxury Global Manufacturing and M2C Distribution Map covering China, USA, Singapore and Thailand"
            fill
            className="object-contain grayscale opacity-40"
          />
        </div>
      </section>

      {/* --- Section 5: Mission --- */}
      <section className="max-w-3xl mx-auto px-8 py-40 text-center">
        <p className="text-xl md:text-3xl font-extralight leading-relaxed opacity-80">
          &quot;Our mission is simple: To provide superior luxury goods by owning the source. Transparency in **manufacturing** is the ultimate luxury.&quot;
        </p>
      </section>

      {/* CTA: 增加内链权重 */}
      <div className="text-center pb-40">
        <Link 
          href="/collection" 
          title="Explore our premium leather collection"
          className="inline-block border border-white/20 px-14 py-5 text-[10px] uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all duration-700"
        >
          View Our Production
        </Link>
      </div>
    </main>
  );
}