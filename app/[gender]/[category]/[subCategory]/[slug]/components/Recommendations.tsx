'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface RecommendationsProps {
  recommendedProducts: any[];
}

export function Recommendations({ recommendedProducts = [] }: RecommendationsProps) {
  const recScrollRef = useRef<HTMLDivElement>(null);

  const scrollRecLeft = () => {
    recScrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' });
  };

  const scrollRecRight = () => {
    recScrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' });
  };

  if (recommendedProducts.length === 0) return null;

  return (
    <div className="w-full bg-white py-24 md:py-32 border-t border-gray-100">
      {/* 标题部分：更紧致的字间距 */}
      <h2 className="text-2xl md:text-3xl font-light uppercase tracking-[0.4em] text-center mb-16 md:mb-20 text-black">
        You May Also Like
      </h2>
      
      <div className="relative px-4 md:px-16">
        {/* 左箭头：更有设计感的细线条 */}
        <button 
          onClick={scrollRecLeft} 
          className="absolute left-4 md:left-8 top-[40%] -translate-y-1/2 z-20 bg-white/90 backdrop-blur-md w-12 h-12 rounded-full shadow-sm flex items-center justify-center hover:bg-black hover:text-white transition-all duration-500 group hidden md:flex"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 右箭头 */}
        <button 
          onClick={scrollRecRight} 
          className="absolute right-4 md:right-8 top-[40%] -translate-y-1/2 z-20 bg-white/90 backdrop-blur-md w-12 h-12 rounded-full shadow-sm flex items-center justify-center hover:bg-black hover:text-white transition-all duration-500 group hidden md:flex"
        >
          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* 滚动容器：加入 custom-scrollbar 隐藏样式 */}
        <div 
          ref={recScrollRef} 
          className="flex gap-6 md:gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style jsx>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {recommendedProducts.map((rec) => (
            <div key={rec.id} className="snap-start flex-shrink-0 w-[75vw] md:w-[350px] group cursor-pointer">
              <Link href={`/product/${rec.slug}`} className="block">
                
                {/* 图片容器：加入更细腻的悬停遮罩 */}
                <div className="relative overflow-hidden aspect-[3/4] bg-[#F9F9F9]">
                  <Image
                    src={rec.images?.[0]?.url || '/images/placeholder.jpg'}
                    alt={rec.name}
                    fill
                    sizes="(max-width: 768px) 75vw, 350px"
                    className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                  />
                  {/* 悬停时的微弱光影 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </div>

                {/* 文本信息 */}
                <div className="mt-8 text-center">
                  <h3 className="text-black text-[10px] font-bold tracking-[0.3em] uppercase mb-2">
                    {rec.name}
                  </h3>
                  <p className="text-zinc-400 text-[12px] font-light tracking-widest transition-colors group-hover:text-black">
                    USD {rec.price?.toLocaleString()}
                  </p>
                  
                  {/* 悬停时出现的“探索”横线 */}
                  <div className="mt-4 flex justify-center">
                    <div className="w-0 h-[1px] bg-black transition-all duration-500 group-hover:w-8" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}