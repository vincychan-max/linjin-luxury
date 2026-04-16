"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script'; // ✅ 引入 Next.js 脚本组件

export default function AboutPage() {
  /**
   * 1. 动画配置统一化 (Dry Code)
   */
  const fadeUp = {
    initial: { opacity: 0, y: 15 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
    viewport: { once: true }
  };

  /**
   * 2. 局部样式注入：仅针对 About 页面修改全局 Header 颜色
   */
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'about-header-theme-override';
    style.innerHTML = `
      header, header a, header span, header button, header svg { color: white !important; stroke: white !important; }
      header { border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important; background-color: transparent !important; backdrop-filter: blur(10px); }
      header img:not(.no-invert) { filter: invert(1) brightness(2); }
      header .bg-red-500, header .bg-red-600, header [class*="bg-emerald"] { filter: none !important; }
    `;
    document.head.appendChild(style);

    return () => {
      const el = document.getElementById('about-header-theme-override');
      if (el) el.remove();
    };
  }, []);

  /**
   * 3. 增强版 SEO 结构化数据 (JSON-LD)
   */
  const brandJsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": "LINJIN LUXURY",
    "alternateName": "LJL",
    "description": "LINJIN LUXURY (LJL) offers archival, handcrafted luxury handbags and leather goods. As a vertically integrated manufacturer, we deliver directly from our private atelier to global clients.",
    "url": "https://www.linjinluxury.com/about",
    "logo": "https://www.linjinluxury.com/logo.png",
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": "LINJIN" 
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "service@linjinluxury.com",
      "availableLanguage": ["English", "Chinese"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Guangzhou",
      "addressCountry": "CN"
    },
    "areaServed": ["United States", "Singapore", "Thailand", "Vietnam", "European Union"],
    "sameAs": [
      "https://www.instagram.com/linjinluxury", // 请替换为实际链接
      "https://www.tiktok.com/@linjinluxury"
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the M2C model at LINJIN LUXURY?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "M2C stands for Manufacturer-to-Consumer. By owning the entire supply chain and our private atelier, we deliver luxury handbags directly to our clients, eliminating unnecessary retail markups."
        }
      },
      {
        "@type": "Question",
        "name": "Does LINJIN LUXURY use hand-stitching?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Our production is a hybrid of precision machine manufacturing and artisanal hand-stitching on critical components to ensure both structural integrity and archival quality."
        }
      }
    ]
  };

  return (
    <main className="bg-black text-white min-h-screen font-light tracking-tight pb-20 selection:bg-white selection:text-black">
      {/* ✅ 使用 next/script 规范注入 JSON-LD */}
      <Script
        id="brand-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandJsonLd) }}
      />
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* --- Section 1: Hero --- */}
      <section className="h-[85vh] flex flex-col items-center justify-center text-center px-6 relative">
        <motion.span 
          {...fadeUp}
          className="text-[10px] md:text-xs uppercase tracking-[0.6em] text-white/40 mb-8"
        >
          The Purity of Origin
        </motion.span>
        
        <motion.h1 
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.2 }}
          className="text-4xl md:text-7xl uppercase tracking-[0.25em] font-extralight mb-12 leading-tight"
        >
          LINJIN <br /> 
          <span className="text-[0.4em] tracking-[0.4em] opacity-40 italic font-serif">Atelier</span>
        </motion.h1>

        <motion.p 
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.4 }}
          className="max-w-2xl text-[13px] md:text-base leading-relaxed italic px-4 font-extralight tracking-wide opacity-70"
        >
          &quot;At LINJIN LUXURY, exclusivity begins where the creation is born. By owning the source, we ensure that every piece is a pristine testament to our workshop standards—untouched by intermediaries, delivered fresh from the bench.&quot;
        </motion.p>
      </section>

      {/* --- Section 2: Narrative --- */}
      <section className="max-w-6xl mx-auto px-8 py-32 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-start">
          
          <motion.div {...fadeUp}>
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-8">01. Direct Provenance</h2>
            <h3 className="text-2xl md:text-4xl mb-8 font-extralight leading-tight">From Workshop <br /> To Client.</h3>
            <p className="opacity-60 text-sm md:text-base leading-loose mb-6">
              Unlike the traditional luxury market, <strong>LINJIN LUXURY (LJL)</strong> operates as a <strong>vertically integrated manufacturer</strong>. Every archival creation is dispatched directly from our private atelier, ensuring a <strong>Direct-to-Consumer (M2C)</strong> path that guarantees the pristine, untouched state of your selection.
            </p>
            <p className="opacity-60 text-sm md:text-base leading-loose">
              By controlling the production lifecycle, we eliminate unnecessary retail inflation. Your LJL creation is uniquely yours, carrying only the scent of premium noble leather and the spirit of fresh craftsmanship.
            </p>
          </motion.div>

          <motion.div {...fadeUp} className="md:pt-40">
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-8">02. Hybrid Craftsmanship</h2>
            <h3 className="text-2xl md:text-4xl mb-8 font-extralight leading-tight text-white">Noble Leathers <br /> & Archival Craft.</h3>
            <p className="opacity-60 text-sm md:text-base leading-loose">
              We select our hides from world-renowned tanneries that define high luxury. Our production is a deliberate <strong>hybrid of machine precision and artisan hand-stitching</strong>, ensuring structural perfection and hand-finished soul. From the structure of Togo to the luster of Box Calf, we deliver material excellence without the traditional markup.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- Section 3: Trust Metrics --- */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Business Model', value: 'Direct M2C' },
              { label: 'Leather Origin', value: 'Noble Grades' },
              { label: 'Logistics Passage', value: 'Global Secure' },
              { label: 'Production', value: 'Hybrid Craft' },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                {...fadeUp} 
                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                className="space-y-3"
              >
                <p className="text-xl md:text-2xl font-extralight tracking-tighter uppercase">{stat.value}</p>
                <p className="text-[9px] uppercase tracking-widest opacity-30">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Section 4: Global Distribution --- */}
      <section className="py-32 max-w-6xl mx-auto px-8 text-center">
        <motion.h2 {...fadeUp} className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-12">
          Strategic Global Distribution
        </motion.h2>
        <motion.div {...fadeUp} className="relative w-full h-[300px] md:h-[550px] mb-12">
          <Image 
            src="/images/world-map.jpg" 
            alt="Global distribution map of LINJIN LUXURY M2C handbags factory-direct logistics network serving USA, Europe, and Asia."
            fill
            className="object-contain grayscale opacity-20 invert"
          />
        </motion.div>
        <p className="max-w-2xl mx-auto text-[10px] md:text-xs tracking-[0.3em] opacity-40 uppercase">
          Los Angeles &nbsp; • &nbsp; Singapore &nbsp; • &nbsp; Thailand &nbsp; • &nbsp; Vietnam &nbsp; • &nbsp; Europe
        </p>
      </section>

      {/* --- Section 5: The Mission --- */}
      <section className="max-w-4xl mx-auto px-8 py-40 text-center">
        <motion.p {...fadeUp} className="text-xl md:text-4xl font-extralight leading-relaxed opacity-90 tracking-wide">
          &quot;We believe that true luxury is found in the transparency of the craft. Owning the source is the ultimate guarantee of authenticity.&quot;
        </motion.p>
      </section>

      {/* Final Call to Action */}
      <div className="text-center pb-40 flex flex-col md:flex-row items-center justify-center gap-8 px-6">
        <Link 
          href="/collection/all" 
          className="inline-block border border-white/20 px-16 py-6 text-[10px] uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all duration-1000"
        >
          Explore the Collection
        </Link>
        <Link 
          href="/limited" 
          className="inline-block bg-white text-black px-16 py-6 text-[10px] uppercase tracking-[0.5em] hover:bg-neutral-200 transition-all duration-1000"
        >
          The Reserve (Limited)
        </Link>
      </div>
    </main>
  );
}