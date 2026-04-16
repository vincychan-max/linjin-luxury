// app/components/InstagramCarousel.tsx
"use client";
import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const instagramPosts = [
  { id: 'ig1', url: '/images/ig-1.jpg', label: 'LA Studio verified' },
  { id: 'ig2', url: '/images/ig-2.jpg', label: 'Curated acquisitions' },
  { id: 'ig3', url: '/images/ig-3.jpg', label: 'Collector Vault' },
  { id: 'ig4', url: '/images/ig-4.jpg', label: 'Professional care' },
  { id: 'ig5', url: '/images/ig-5.jpg', label: 'Direct sourcing' },
  { id: 'ig6', url: '/images/ig-6.jpg', label: 'Authentic Excellence' },
];

const InstagramCarousel: React.FC = () => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const scrollerContent = Array.from(scroller.children);
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true) as HTMLElement;
      scroller.appendChild(duplicatedItem);
    });
  }, []);

  return (
    <section className="py-24 bg-white overflow-hidden text-center border-t border-gray-50">
      {/* 头部标题区域 - 已将 @LINJIN_LUXURY 移至此处 */}
      <div className="max-w-7xl mx-auto px-6 mb-16 flex flex-col items-center">
        <p className="text-[9px] tracking-[6px] uppercase text-gray-300 mb-6">Social Context</p>
        
        {/* 主标题 */}
        <h2 className="text-3xl md:text-4xl font-light tracking-tight uppercase text-black mb-6">
          Studio <span className="font-serif italic lowercase text-black">on</span> Instagram
        </h2>

        {/* 品牌入口：根据截图指示移至标题下方 */}
        <Link 
          href="https://instagram.com/linjin_luxury" 
          target="_blank" 
          className="group inline-flex flex-col items-center"
        >
          <span className="text-[11px] tracking-[5px] uppercase text-gray-600 group-hover:text-black transition-colors duration-300 font-medium">
            @linjin_luxury
          </span>
          {/* 装饰线 */}
          <div className="w-6 h-[1px] bg-gray-200 mt-2 group-hover:w-full group-hover:bg-black transition-all duration-500"></div>
        </Link>
      </div>

      {/* 无缝滚动瀑布流区域 */}
      <div className="w-full overflow-hidden relative group">
        <div 
          ref={scrollerRef}
          className="flex space-x-4 md:space-x-6 whitespace-nowrap animate-scroll-fast group-hover:pause-scroll"
        >
          {instagramPosts.map((post, idx) => (
            <div 
              key={`${post.id}-${idx}`}
              className="relative aspect-[3/4] h-[350px] md:h-[450px] flex-shrink-0 overflow-hidden bg-gray-50 border border-gray-100 shadow-sm"
            >
              <Image 
                src={post.url} 
                alt="Instagram Content" 
                fill 
                className="object-cover opacity-95 hover:opacity-100 transition-all duration-[1500ms]" 
              />
              <div className="absolute top-6 left-6 border border-white/20 px-3 py-1.5 backdrop-blur-md opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-[8px] tracking-[3px] uppercase font-bold text-white">{post.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-scroll-fast {
          animation: scroll 45s linear infinite;
        }
        .pause-scroll {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default InstagramCarousel;