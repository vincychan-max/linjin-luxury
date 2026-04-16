"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
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

  // 进阶 SEO/GEO 结构化数据
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Linjin Luxury",
      "alternateName": "LJL",
      "description": "Global M2C luxury supply chain specialists focusing on exceptional leather craftsmanship.",
      "url": "https://www.linjinluxury.com",
      "logo": "https://www.linjinluxury.com/icon.png",
      "image": "https://www.linjinluxury.com/logo.png",
      "areaServed": ["CN", "US", "SG", "TH"],
      "sameAs": [
        "https://instagram.com/linjinluxury",
        "https://x.com/linjinluxury",
        "https://tiktok.com/@linjinluxury",
        "https://facebook.com/linjinluxury",
        "https://linkedin.com/company/linjinluxury",
        "https://youtube.com/@linjinluxury"
      ],
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Los Angeles",
        "addressRegion": "CA",
        "addressCountry": "US"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Linjin Luxury",
      "url": "https://www.linjinluxury.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.linjinluxury.com/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  ];

  return (
    <footer className="bg-black text-white pt-20 pb-10 font-light tracking-tight mt-auto border-t border-white/5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* --- 品牌宣言 --- */}
        <div className="border-b border-white/10 pb-12 mb-12 text-center">
          <h2 className="text-lg md:text-2xl font-light tracking-[0.3em] uppercase mb-4 opacity-90">
            Luxury Without Retail Markups
          </h2>
          <p className="max-w-2xl mx-auto text-[13px] md:text-base opacity-50 leading-relaxed italic px-4">
            Timeless pieces. No intermediaries. Crafted for those who know.
          </p>
        </div>

        {/* --- 导航网格 --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-12 md:gap-12 mb-20">
          
          {/* Client Service */}
          <nav aria-label="Services navigation" className="text-center md:text-left">
            <h3 className="text-xs uppercase tracking-[0.2em] mb-6 md:mb-8 font-semibold opacity-40">Client Service</h3>
            <ul className="space-y-4 text-[13px] opacity-70">
              <li><Link href="/faq" className="hover:opacity-100 transition-opacity block py-1">FAQ</Link></li>
              <li><Link href="/verify" className="hover:opacity-100 transition-opacity block py-1">Authenticity Verification</Link></li>
              <li><Link href="/contact" className="hover:opacity-100 transition-opacity block py-1">Contact</Link></li>
              <li><Link href="/shipping" className="hover:opacity-100 transition-opacity block py-1">Shipping Information</Link></li>
              <li><Link href="/policies/returns" className="hover:opacity-100 transition-opacity block py-1">Returns & Exchanges</Link></li>
              <li><Link href="/care" className="hover:opacity-100 transition-opacity block py-1">Product Care</Link></li>
              <li><Link href="/payment" className="hover:opacity-100 transition-opacity block py-1">Payment Methods</Link></li>
            </ul>
          </nav>

          {/* Collections */}
          <nav aria-label="Collection navigation" className="text-center md:text-left">
            <h3 className="text-xs uppercase tracking-[0.2em] mb-6 md:mb-8 font-semibold opacity-40">The Collections</h3>
            <ul className="space-y-4 text-[13px] opacity-70">
              <li><Link href="/best-sellers" className="hover:opacity-100 transition-opacity block py-1">Best Sellers</Link></li>
              <li><Link href="/collection/women/shoulder-bags" className="hover:opacity-100 transition-opacity block py-1">Shoulder Bags</Link></li>
              <li><Link href="/collection/women/tote-bags" className="hover:opacity-100 transition-opacity block py-1">Tote Bags</Link></li>
              <li><Link href="/collection/women/clutch-bags" className="hover:opacity-100 transition-opacity block py-1">Clutch Bags</Link></li>
              <li><Link href="/collection/women/crossbody-bags" className="hover:opacity-100 transition-opacity block py-1">Crossbody Bags</Link></li>
              <li><Link href="/collection/all" className="hover:opacity-100 transition-opacity underline underline-offset-4 block py-1">Discover All</Link></li>
            </ul>
          </nav>

          {/* The House */}
          <nav aria-label="About navigation" className="text-center md:text-left">
            <h3 className="text-xs uppercase tracking-[0.2em] mb-6 md:mb-8 font-semibold opacity-40">The House</h3>
            <ul className="space-y-4 text-[13px] opacity-70">
              <li><Link href="/world-of-ljl" className="hover:opacity-100 transition-opacity block py-1">The World of LJL</Link></li>
              <li><Link href="/about" className="hover:opacity-100 transition-opacity block py-1">Our Workshop</Link></li>
              <li><Link href="/journal" className="hover:opacity-100 transition-opacity block py-1">The Journal</Link></li>
              <li><Link href="/bespoke" className="hover:opacity-100 transition-opacity block py-1">Bespoke Service</Link></li>
              <li><Link href="/policies/privacy" className="hover:opacity-100 transition-opacity block py-1">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:opacity-100 transition-opacity block py-1">Terms of Service</Link></li>
              <li>
                <Link href="/sitemap" className="hover:opacity-100 transition-opacity block py-1 text-[11px] opacity-40 uppercase tracking-widest mt-4">
                  Sitemap
                </Link>
              </li>
            </ul>
          </nav>

          {/* Newsletter & Social */}
          <div className="flex flex-col text-center md:text-left">
            <h3 className="text-xs uppercase tracking-[0.2em] mb-6 md:mb-8 font-semibold opacity-40">Newsletter</h3>
            
            <div className="text-[13px] opacity-60 mb-8 leading-relaxed px-4 md:px-0 flex flex-col gap-1">
              <span className="font-medium mb-1">Join our private list for:</span>
              <span>— Early access to new collections</span>
              <span>— Exclusive pricing from our atelier</span>
              <span>— Limited production releases</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col space-y-3 px-4 md:px-0" noValidate>
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-0 py-3 bg-transparent border-b border-white/20 text-white rounded-none placeholder:text-white/20 focus:outline-none focus:border-white transition-all text-xs tracking-widest text-center md:text-left"
                required
                disabled={status === 'loading' || status === 'success'}
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="w-full py-4 bg-white text-black uppercase tracking-[0.2em] text-[11px] font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? 'Processing...' : status === 'success' ? 'Subscribed' : 'Subscribe'}
              </button>
            </form>

            {message && (
              <p className={`mt-4 text-[11px] tracking-wide ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}

            {/* --- 信任背书与核心卖点 (Factory-Direct Luxury) --- */}
            <div className="text-[11px] mt-6 tracking-wider leading-relaxed px-4 md:px-0 flex flex-col gap-2">
              <p className="font-bold text-white opacity-80 tracking-[0.3em] uppercase">
                The Linjin Factory
              </p>
              <p className="opacity-40 uppercase">
                Trusted by clients in 30+ countries · Secure payments · Global shipping
              </p>
            </div>

            {/* 社交媒体区域 */}
            <div className="flex flex-wrap gap-6 mt-10 justify-center md:justify-start items-center">
              <a href="https://instagram.com/linjinluxury" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-all hover:scale-110">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                  <defs>
                    <linearGradient id="inst-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f09433" /><stop offset="50%" stopColor="#dc2743" /><stop offset="100%" stopColor="#bc1888" />
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#inst-grad)"></rect>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" stroke="url(#inst-grad)"></path>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="url(#inst-grad)"></circle>
                </svg>
              </a>
              <a href="https://x.com/linjinluxury" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-all hover:scale-110 text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
              </a>
              <a href="https://tiktok.com/@linjinluxury" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-all hover:scale-110 text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 448 512"><path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z"></path></svg>
              </a>
              <a href="https://facebook.com/linjinluxury" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-all hover:scale-110" style={{ color: '#1877F2' }}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://linkedin.com/company/linjinluxury" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-all hover:scale-110" style={{ color: '#0A66C2' }}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v5.886zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/></svg>
              </a>
              <a href="https://youtube.com/@linjinluxury" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-all hover:scale-110" style={{ color: '#FF0000' }}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>
              </a>
            </div>
          </div>
        </div>
          
        {/* --- 底部版权与品牌视觉印章 --- */}
        <div className="border-t border-white/5 pt-12 flex flex-col items-center w-full"> 
          
          {/* Logo 容器 */}
          <div className="flex items-center justify-center">
            <img 
              src="/images/logo.png" 
              alt="Linjin Luxury Logo" 
              className="max-h-[64px] md:max-h-[80px] w-auto object-contain opacity-90 scale-150 transform origin-center"
            />
          </div>

          {/* 底部版权与合作伙伴入口 */}
          <div className="w-full border-t border-white/5 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-[0.2em] uppercase font-medium px-6 md:px-12 pb-10">
            
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 mb-6 md:mb-0">
              <p className="opacity-40">© {currentYear} LINJIN LUXURY. ALL RIGHTS RESERVED.</p>
              
              <span className="hidden md:block w-[1px] h-3 bg-white/10"></span>
              
              <Link 
                href="/partnerships" 
                className="opacity-40 hover:opacity-100 hover:text-white transition-all duration-500 ease-out tracking-[0.25em]"
              >
                Partner With Us
              </Link>
            </div>

            {/* 地区/城市列表 */}
            <div className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-3 opacity-40">
              <span className="text-white opacity-100 font-semibold">China</span>
              <span className="opacity-30">/</span>
              <span>Los Angeles</span>
              <span className="opacity-30">/</span>
              <span>Singapore</span>
              <span className="opacity-30">/</span>
              <span>Thailand</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}