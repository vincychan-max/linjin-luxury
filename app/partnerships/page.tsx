"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Script from 'next/script';

export default function PartnershipsPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 1. JSON-LD 增强：增加 sameAs 社交数组 & 标准化营业时间
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ManufacturingBusiness",
    "name": "Linjin Luxury Factory",
    "alternateName": "Linjin Leather Goods Manufacturer",
    "url": "https://linjinluxury.com/partnerships",
    "logo": "https://linjinluxury.com/logo.png",
    "image": "https://linjinluxury.com/factory-hero.jpg",
    "description": "Premium luxury leather goods manufacturer in Guangzhou, China. Direct factory access for OEM, ODM, and White Label luxury handbag production.",
    "hasMap": "https://www.google.com/maps?cid=YOUR_CID",
    "sameAs": [
      "https://www.linkedin.com/company/linjin-luxury",
      "https://www.instagram.com/linjin_leather",
      "https://www.facebook.com/linjinluxury"
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Artisan Industrial District, Huadu",
      "addressLocality": "Guangzhou",
      "addressRegion": "Guangdong",
      "postalCode": "510000",
      "addressCountry": "CN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 23.385, 
      "longitude": 113.218
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+86-138-0000-0000",
        "contactType": "sales",
        "email": "partnership@linjin-luxury.com",
        "areaServed": "Global",
        "availableLanguage": ["English", "Chinese", "French"]
      }
    ],
    // 2. 营业时间标准化为数组格式
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ]
  };

  return (
    <main className="bg-black text-white min-h-screen font-light selection:bg-white selection:text-black">
      {/* --- SEO Metadata 增强：将 Leather Goods 显性化放入 Title/Description --- */}
      <Head>
        <title>Factory Direct Luxury Leather Goods Manufacturer | Linjin 2026</title>
        <meta name="description" content="Direct access to Linjin's Guangzhou leather goods factory. Premium OEM & White Label manufacturing for luxury handbags and accessories. Secure 2026 production slots." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>

      <Script
        id="json-ld-partnerships"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <style jsx global>{`
        header, nav, [class*="header"], [class*="nav"] {
          background-color: transparent !important;
          mix-blend-mode: ${isMobile ? 'normal' : 'difference'} !important;
          transition: all 0.5s ease;
          z-index: 100;
        }
        header *, nav * {
          color: white !important;
          stroke: white !important;
          fill: white !important;
          opacity: 1 !important;
          border-color: white !important;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
      `}</style>

      {/* --- Video Hero Section --- */}
      <section className="relative h-[100svh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            poster="/images/hero-fallback-highres.jpg" 
            className="w-full h-full object-cover opacity-60 scale-100 md:scale-105"
          >
            <source src={isMobile ? "/videos/factory-hero-mobile.mp4" : "/videos/factory-hero.mp4"} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div> 
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center md:text-left w-full">
          <div className="animate-fadeIn">
            <span className="text-[10px] tracking-[0.6em] uppercase opacity-90 mb-8 block font-bold">
              The Linjin Factory · 2026 Global Leather Goods Supply Chain
            </span>
            {/* 3. Hero 文案调整为：Factory-Direct Luxury */}
            <h1 className="text-5xl md:text-[9rem] font-extralight tracking-tighter mb-10 italic leading-[0.85]">
              Factory-Direct <br /> Luxury
            </h1>
            <p className="max-w-xl text-base md:text-xl opacity-80 leading-relaxed font-serif mb-12">
              Eliminate the 10x retail markup. Secure your 2026 production window with our **Guangzhou artisan atelier** for uncompromising luxury quality.
            </p>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* 4. 内部链接 prefetch 优化 */}
              <Link 
                href="/contact" 
                prefetch={true}
                className="px-12 py-5 bg-white text-black text-[11px] font-bold uppercase tracking-[0.4em] hover:invert transition-all text-center shadow-2xl"
              >
                Book Production Slot
              </Link>
              <a 
                href="mailto:partnership@linjin-luxury.com"
                className="px-12 py-5 border border-white/40 text-[11px] uppercase tracking-[0.4em] hover:bg-white/10 transition-all text-center backdrop-blur-sm"
              >
                Inquire via Email
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-30 animate-bounce hidden md:block">
          <div className="w-[1px] h-12 bg-white"></div>
        </div>
      </section>

      {/* --- M2C Advantage --- */}
      <section className="py-32 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <h2 className="text-3xl md:text-5xl font-extralight tracking-tighter leading-tight italic">
              Mastery from the heart of Southern China's leather hub
            </h2>
            <div className="space-y-12">
              <div className="group border-l border-white/10 pl-8 py-2">
                <h3 className="text-xs uppercase tracking-widest font-bold mb-4 text-white/90">01 / Vertical Integration</h3>
                <p className="text-sm opacity-40 leading-relaxed group-hover:opacity-100 transition-opacity duration-500">
                  From raw hide selection in Italy to final edge painting in **Guangzhou**, we control the entire lifecycle. No middle-men, just pure craftsmanship.
                </p>
              </div>
              <div className="group border-l border-white/10 pl-8 py-2">
                <h3 className="text-xs uppercase tracking-widest font-bold mb-4 text-white/90">02 / Global Fulfillment</h3>
                <p className="text-sm opacity-40 leading-relaxed group-hover:opacity-100 transition-opacity duration-500">
                  Strategically located for rapid export. Our logistics network ensures seamless duty-free delivery to **London, New York, and Paris** hubs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Partnership Cards --- */}
      <section className="py-24 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <article className="bg-[#0a0a0a] border border-white/5 p-12 md:p-16 hover:border-white/30 transition-all duration-700 group">
            <h3 className="text-3xl font-light mb-6 tracking-tight">Industrial OEM</h3>
            <p className="text-sm opacity-40 leading-relaxed mb-10">
              Full-scale manufacturing for global retailers. We provide high-volume capacity, custom hardware casting, and **B2B supply chain optimization**.
            </p>
            <Link href="/contact" prefetch={false} className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-white/20 pb-1 hover:border-white transition-all">Start Project</Link>
          </article>
          <article className="bg-[#0a0a0a] border border-white/5 p-12 md:p-16 hover:border-white/30 transition-all duration-700 group">
            <h3 className="text-3xl font-light mb-6 tracking-tight">White Label Archive</h3>
            <p className="text-sm opacity-40 leading-relaxed mb-10">
              Access our **archival silhouettes**. Low MOQ solutions for boutique brands, handcrafted with the same precision as our couture commissions.
            </p>
            <Link href="/contact" prefetch={false} className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-white/20 pb-1 hover:border-white transition-all">Browse Models</Link>
          </article>
        </div>
      </section>

      {/* --- Capacity Stats --- */}
      <section className="py-24 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { v: "500k+", l: "Annual Capacity" },
            { v: "14 Days", l: "Rapid Prototyping" },
            { v: "100%", l: "In-house QC" },
            { v: "30+", l: "Global Partners" }
          ].map((s, i) => (
            <div key={i}>
              <div className="text-4xl font-extralight tracking-tighter mb-2 italic">{s.v}</div>
              <div className="text-[9px] uppercase tracking-[0.3em] opacity-40 font-bold">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section id="contact-section" className="py-48 px-6 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-block px-4 py-1 border border-white/10 rounded-full text-[9px] uppercase tracking-[0.4em] mb-12 opacity-60">
            Booking Q4 2026 Production in Guangzhou
          </div>
          <h2 className="text-5xl md:text-8xl font-extralight tracking-tighter mb-16 italic leading-tight">
            Direct Access. <br /> Master Quality.
          </h2>
          <div className="flex flex-col items-center gap-8">
            <Link 
              href="/contact" 
              prefetch={true}
              className="inline-block px-20 py-7 bg-white text-black text-[12px] font-black uppercase tracking-[0.5em] hover:scale-105 transition-all shadow-2xl"
            >
              Inquire Now
            </Link>
            <a href="tel:+8613800000000" className="text-sm opacity-40 hover:opacity-100 transition-opacity tracking-[0.2em]">
              CALL DIRECT: +86 138 0000 0000
            </a>
          </div>
        </div>
      </section>

      {/* --- Footer Seal: 透明度调至 35% 兼顾可见度与美感 --- */}
      <footer className="py-12 border-t border-white/5 text-center opacity-35">
        <p className="text-[9px] tracking-[0.6em] uppercase italic">
          LINJIN LUXURY · GUANGZHOU ATELIER · EST. 2026
        </p>
        <div className="mt-4 flex justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
           {/* 社交链接增加社交信号 */}
           <a href="https://linkedin.com" className="text-[8px] tracking-widest uppercase hover:text-white">LinkedIn</a>
           <a href="https://instagram.com" className="text-[8px] tracking-widest uppercase hover:text-white">Instagram</a>
        </div>
      </footer>
    </main>
  );
}