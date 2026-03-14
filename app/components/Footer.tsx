"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  // 1. 动态内容优化：防止 Hydration 报错
  const [currentYear, setCurrentYear] = useState(2026);
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        setMessage('Thank you! You’ve been subscribed.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  // 2. 结构化数据 (JSON-LD)：专门喂给 AI (Gemini/Perplexity) 和 Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Linjin Luxury",
    "alternateName": "LINJIN",
    "url": "https://yourdomain.com", // 替换为你的域名
    "logo": "https://yourdomain.com/logo.png",
    "sameAs": [
  "https://instagram.com/linjinluxury",
  "https://facebook.com/linjinluxury",
  "https://tiktok.com/@linjinluxury",
  "https://youtube.com/@linjinluxury" // 加上这一行
],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Los Angeles",
      "addressRegion": "CA",
      "addressCountry": "US"
    }
  };

  return (
    <footer className="bg-black text-white py-20 font-light">
      {/* 结构化数据脚本（浏览器不显示，AI 必读） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          
          {/* 列1: 品牌标识与服务 (语义化 HTML5) */}
          <div className="flex flex-col">
            <div className="mb-10">
              <Link href="/">
                <h2 className="text-3xl font-light tracking-[0.2em] uppercase opacity-90 hover:opacity-100 transition">
                  LINJIN LUXURY
                </h2>
              </Link>
            </div>

            <nav aria-label="Services navigation">
              <h3 className="text-lg uppercase tracking-widest mb-8 opacity-80">Services</h3>
              <ul className="space-y-4 text-base opacity-70">
                {['FAQ', 'Authenticity Verification', 'Contact Us', 'Shipping & Returns', 'Product Care'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase().replace(/ /g, '-')}`} className="hover:opacity-100 transition border-b border-transparent hover:border-white/20 pb-0.5">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* 列2: Collection (SEO 关键链接) */}
          <nav aria-label="Collection navigation">
            <h3 className="text-lg uppercase tracking-widest mb-8 opacity-80">Collection</h3>
            <ul className="space-y-4 text-base opacity-70">
              <li><Link href="/collection/shoulder-bags" className="hover:opacity-100 transition">Shoulder Bags</Link></li>
              <li><Link href="/collection/tote-bags" className="hover:opacity-100 transition">Tote Bags</Link></li>
              <li><Link href="/collection/clutch-bags" className="hover:opacity-100 transition">Clutch Bags</Link></li>
              <li><Link href="/collection/crossbody-bags" className="hover:opacity-100 transition">Crossbody Bags</Link></li>
              <li><Link href="/collection" className="hover:opacity-100 transition italic">View All</Link></li>
            </ul>
          </nav>

          {/* 列3: About */}
          <nav aria-label="About navigation">
            <h3 className="text-lg uppercase tracking-widest mb-8 opacity-80">About Linjin</h3>
            <ul className="space-y-4 text-base opacity-70">
              <li><Link href="/about" className="hover:opacity-100 transition">Our Story</Link></li>
              <li><Link href="/sustainability" className="hover:opacity-100 transition">Sustainability</Link></li>
              <li><Link href="/careers" className="hover:opacity-100 transition">Careers</Link></li>
              <li><Link href="/press" className="hover:opacity-100 transition">Press</Link></li>
            </ul>
          </nav>

          {/* 列4: Newsletter (保留你最喜欢的 UI) */}
          <div>
            <h3 className="text-lg uppercase tracking-widest mb-8 opacity-80">Stay Exclusive</h3>
            <p className="text-base opacity-70 mb-12 leading-relaxed">
              Unlock early access to new arrivals, private offers, and exclusive pieces reserved for subscribers.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
              <input
                type="email"
                placeholder="* YOUR EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-transparent border border-white/30 text-white rounded-xl placeholder:text-white/30 focus:outline-none focus:border-white transition-all uppercase text-sm tracking-widest"
                required
                disabled={status === 'loading' || status === 'success'}
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="w-full py-4 bg-white text-black uppercase tracking-[0.2em] rounded-xl hover:bg-gray-200 transition font-bold text-sm disabled:opacity-50"
              >
                {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed' : 'Subscribe'}
              </button>
            </form>

            <div className="h-10 mt-4">
              {message && (
                <p className={`text-sm tracking-wide ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </p>
              )}
            </div>

            {/* 社交图标：保留你原来的彩色/品牌图标样式 */}
            <div className="flex flex-wrap gap-6 mt-6 items-center">
  {/* Instagram - 官方渐变色感（这里用偏粉红的品牌色） */}
  <a href="https://instagram.com/linjinluxury" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="Instagram">
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#E4405F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5"></rect>
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  </a>

  {/* X (Twitter) - 黑色/白色（在黑色背景下通常用白色） */}
  <a href="https://twitter.com/linjinluxury" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform text-white" aria-label="X">
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
    </svg>
  </a>

  {/* TikTok - 官方青/红叠加感（这里使用白色以适配黑底，或者用 TikTok 的标志性配色） */}
  <a href="https://tiktok.com/@linjinluxury" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform text-[#00f2ea]" aria-label="TikTok">
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 448 512">
      <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z"></path>
    </svg>
  </a>

  {/* Facebook - 官方蓝色 */}
  <a href="https://facebook.com/linjinluxury" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform text-[#1877F2]" aria-label="Facebook">
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
    </svg>
  </a>

  {/* LinkedIn - 官方深蓝 */}
  <a href="https://linkedin.com/company/linjinluxury" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform text-[#0A66C2]" aria-label="LinkedIn">
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
    </svg>
  </a>

  {/* YouTube - 官方红色 */}
  <a href="https://youtube.com/@linjinluxury" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform text-[#FF0000]" aria-label="YouTube">
    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
    </svg>
  </a>
</div>
          </div>
        </div>

        {/* 版权信息 (SEO 地标) */}
        <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center text-sm opacity-50 tracking-widest uppercase">
          <p>© {currentYear} Linjin Luxury. All rights reserved.</p>
          <p className="mt-4 md:mt-0 text-[12px]">Los Angeles • Singapore • Thailand</p>
        </div>
      </div>
    </footer>
  );
}