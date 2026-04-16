'use client';

import React, { useState, useEffect } from 'react';

// 1. 定义数据接口，确保类型安全
interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSection {
  title: string;
  id: string;
  items: FaqItem[];
}

interface FaqClientProps {
  faqData: FaqSection[];
}

// 品牌化关键词：Provenance (出处), Logistics (物流), Returns Policy (退换), Bespoke Inquiries (定制)
const hotTopics = ["Provenance", "Logistics", "Returns Policy", "Bespoke Inquiries"];

// 2. 导出组件：必须使用 export default 解决 ts(2306) 报错
export default function FaqClient({ faqData }: FaqClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // 搜索防抖逻辑
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 生成 GEO (AI搜索) 结构化数据
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.flatMap(section => 
      section.items.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    )
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.pageYOffset - 100,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full text-black antialiased">
      {/* 注入 SEO 结构化脚本 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 搜索区域：纯黑视觉 */}
      <div className="mb-20 max-w-4xl">
        <div className="relative border-b-2 border-black pb-2 flex items-end">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH STUDIO ARCHIVE..."
            className="w-full bg-transparent text-[24px] md:text-[32px] font-light focus:outline-none placeholder:text-black/10 uppercase tracking-tighter text-black"
          />
        </div>
        
        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
          <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-black">Common Inquiries:</span>
          {hotTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSearchTerm(topic)}
              className="text-[11px] tracking-[0.15em] uppercase font-bold text-black hover:opacity-50 transition-all relative group"
            >
              {topic}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-black transition-all group-hover:w-full"></span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-16 md:gap-24">
        {/* 左侧导航 INDEX：强制全黑，不发灰 */}
        <nav className="hidden lg:block w-64 sticky top-48 h-fit">
          <div className="relative pb-6 mb-8 border-b border-black/20">
            <p className="text-[11px] tracking-[0.5em] uppercase font-black text-black">Index</p>
          </div>
          
          <div className="space-y-5">
            {faqData.map((section) => {
              const isActive = debouncedTerm && section.title.toLowerCase().includes(debouncedTerm.toLowerCase());
              return (
                <button 
                  key={section.id} 
                  onClick={() => scrollToSection(section.id)}
                  className="group flex items-center text-left w-full transition-all duration-300"
                >
                  <span className={`h-[1px] bg-black transition-all duration-500 mr-4 ${isActive ? 'w-8 opacity-100' : 'w-0 group-hover:w-4 opacity-100'}`}></span>
                  <span className={`text-[12px] font-bold uppercase tracking-[0.2em] text-black ${isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                    {section.title}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* 内容主体：语义化标签与压缩行距 */}
        <div className="flex-1 space-y-24">
          {faqData.map((section) => {
            const filteredItems = section.items.filter(item =>
              item.question?.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
              item.answer?.toLowerCase().includes(debouncedTerm.toLowerCase())
            );

            if (debouncedTerm && filteredItems.length === 0) return null;

            return (
              <section key={section.id} id={section.id} className="scroll-mt-40">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.5em] text-black mb-8 flex items-center gap-4">
                  <span className="w-8 h-[1px] bg-black"></span>
                  {section.title}
                </h2>

                <div className="space-y-1 border-t border-black/10">
                  {filteredItems.map((item, index) => (
                    <details 
                      key={index} 
                      className="group border-b border-black/5"
                      open={!!debouncedTerm}
                    >
                      <summary className="flex justify-between items-center cursor-pointer list-none py-6 outline-none">
                        <span className="text-[18px] md:text-[22px] font-light text-black group-hover:translate-x-2 transition-all duration-500">
                          {item.question}
                        </span>
                        <span className="text-xl font-extralight text-black group-open:rotate-45 transition-transform duration-500">
                          +
                        </span>
                      </summary>
                      <div className="pb-8 pt-2 max-w-2xl text-black">
                        <p className="text-[16px] md:text-[18px] font-light leading-[1.7]">
                          {item.answer}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

     {/* 极简主义底部 - 完全对照参考图设计 */}
      <footer className="mt-60 mb-40 flex flex-col items-center justify-center text-center">
        <h2 className="text-[28px] md:text-[42px] font-light tracking-[0.15em] text-black mb-12 uppercase">
          Still Have Questions?
        </h2>
        
        <a 
          href="mailto:concierge@linjinluxury.com" 
          className="bg-black text-white px-16 py-6 text-[12px] font-bold uppercase tracking-[0.4em] hover:opacity-80 transition-opacity duration-300"
        >
          Contact Us
        </a>

        {/* 极细的品牌脚注，保持呼吸感 */}
        <div className="mt-40 text-[9px] tracking-[0.5em] uppercase font-bold text-black/20">
          LINJIN LUXURY ARCHIVE © 2026
        </div>
      </footer>
    </div>
  );
}