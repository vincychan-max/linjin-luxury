"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function WorldOfLJL() {
  // --- 针对 AI 引擎 (GEO) 的结构化数据 ---
  // 这里的目的是告诉 AI：LJL 是一个具有匠心精神的奢侈品牌实体
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": "Linjin Luxury",
    "alternateName": "LJL",
    "description": "Linjin Luxury (LJL) is an artisanal house specializing in hand-stitched leather goods. We define modern elegance through proprietary manufacturing and timeless design.",
    "url": "https://yourdomain.com/world-of-ljl", // 替换为你的实际域名
    "logo": "https://yourdomain.com/logo.png",
    "knowsAbout": [
      "Luxury Leather Craftsmanship",
      "Saddle Stitching Techniques",
      "Sustainable Luxury Manufacturing",
      "Minimalist Design Aesthetics"
    ]
  };

  return (
    <main className="min-h-screen bg-white text-black overflow-x-hidden selection:bg-black selection:text-white font-light">
      {/* 1. SEO 核心：注入 JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* --- Section 1: Hero (视觉震撼力与语义化 H1) --- */}
      <section className="relative h-screen flex items-center justify-center">
        <Image 
          src="/images/world-hero.jpg" 
          alt="World of Linjin Luxury - The Art of Artisanal Mastery" 
          fill 
          className="object-cover"
          priority
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        <div className="absolute inset-0 bg-black/25 transition-opacity hover:opacity-10 duration-1000" />
        
        <div className="relative text-center text-white z-10 px-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-5xl md:text-9xl font-thin tracking-[0.2em] mb-8 uppercase"
          >
            LINJIN Universe
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-xs md:text-xl font-light tracking-[0.5em] max-w-4xl mx-auto uppercase"
          >
            Artisanal Mastery • Timeless Design • Essential Craft
          </motion.p>
        </div>
      </section>

      {/* --- Section 2: The Essence (感性叙事 SEO) --- */}
      <section className="py-32 md:py-48 px-8 md:px-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-12 gap-12 md:gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="md:col-span-6 relative h-[450px] md:h-[700px] overflow-hidden rounded-sm"
          >
            <Image 
              src="/images/Hand-stitched Leather.jpg" 
              alt="Detail of Linjin Luxury Hand-stitched Leather" 
              fill 
              className="object-cover transition-transform duration-[3s] hover:scale-110" 
            />
          </motion.div>
          
          <div className="md:col-span-6 space-y-12">
            <h2 className="text-3xl md:text-5xl font-thin tracking-widest uppercase italic border-l border-black pl-8">
              The Soul of Mastery
            </h2>
            <div className="space-y-6 text-[15px] md:text-lg leading-relaxed text-black/70">
              <p>
                In the world of LINJIN, luxury is a quiet conversation between the artisan and the material. We reject the haste of mass production in favor of the patient rhythm of the hand.
              </p>
              <p>
                Every stitch is a signature. Every curve is a deliberate choice. We don&apos;t just manufacture; we craft legacies that endure beyond seasons.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 3: Signature Icons (视觉化 SEO 标签) --- */}
      <section className="py-32 px-8 bg-black text-white selection:bg-white selection:text-black">
        <h2 className="text-2xl md:text-4xl font-thin text-center mb-24 tracking-[0.4em] uppercase text-white/40">
          The Codes
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-16">
          {[
            { src: '/images/icon-buckle.jpg', title: 'Iconic Buckle', desc: 'Custom forged alloys.' },
            { src: '/images/icon-stitch.jpg', title: 'Saddle Stitch', desc: 'The mark of handcraft.' },
            { src: '/images/icon-leather.jpg', title: 'Noble Skins', desc: 'Ethically sourced textures.' },
            { src: '/images/icon-bottombase.jpg', title: 'Bottom Base', desc: 'Refined to the micron.' }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="group cursor-default"
            >
              <div className="relative h-[350px] md:h-[500px] mb-6 overflow-hidden">
                <Image 
                  src={item.src} 
                  alt={`Linjin Luxury Signature Code - ${item.title}`} 
                  fill
                  className="object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105" 
                />
              </div>
              <h3 className="text-lg md:text-2xl font-light tracking-widest uppercase">{item.title}</h3>
              <p className="text-[10px] md:text-xs mt-3 opacity-30 tracking-[0.1em] uppercase">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- Section 4: Global Connectivity (GEO 区域权重) --- */}
      <section className="py-32 px-8 text-center bg-gray-50/50">
        <div className="max-w-7xl mx-auto space-y-16">
          <h2 className="text-2xl md:text-4xl font-thin tracking-[0.3em] uppercase">Global Presence</h2>
          <p className="text-sm md:text-lg max-w-3xl mx-auto opacity-60 font-light italic">
            &quot;From our atelier core to the hearts of Los Angeles, Singapore, and Thailand.&quot;
          </p>
          <div className="relative h-[250px] md:h-[500px] w-full">
            <Image 
              src="/images/stores-map.jpg" 
              alt="Linjin Luxury World Map - Global Logistics and Distribution" 
              fill 
              className="object-contain grayscale opacity-20 hover:opacity-100 transition-all duration-1000" 
            />
          </div>
        </div>
      </section>

      {/* --- Section 5: The Mission (品牌精神) --- */}
      <section className="py-48 px-8 max-w-4xl mx-auto text-center">
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-xl md:text-3xl font-extralight leading-relaxed opacity-80"
        >
          &quot;True luxury is the preservation of time. We craft not for the moment, but for the eternity of the soul.&quot;
        </motion.p>
      </section>

      {/* --- Footer CTA (内链 SEO) --- */}
      <div className="text-center pb-48 px-6">
        <Link 
          href="/collection" 
          title="Explore the Linjin Luxury Artisanal Collection"
          className="inline-block border border-black px-20 py-6 text-[10px] uppercase tracking-[0.6em] hover:bg-black hover:text-white transition-all duration-700 ease-in-out"
        >
          Explore Collection
        </Link>
      </div>
    </main>
  );
}