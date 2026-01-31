// app/product/[id]/components/Recommendations.tsx
'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface RecommendationsProps {
  recommendedProducts: any[];
}

export default function Recommendations({ recommendedProducts = [] }: RecommendationsProps) {
  const recScrollRef = useRef<HTMLDivElement>(null);

  const scrollRecLeft = () => {
    recScrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRecRight = () => {
    recScrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  // 如果没有数据，使用原硬编码 fallback 产品（确保“下面的产品”一定显示）
  const productsToShow = recommendedProducts.length > 0 ? recommendedProducts : [
    { id: '2', name: 'Ophidia GG Small Shoulder Bag', price: '$2,100', image: '/images/rec1.jpg' },
    { id: '3', name: 'Dionysus Super Mini Bag', price: '$1,890', image: '/images/rec2.jpg' },
    { id: '4', name: 'Horsebit 1955 Mini Bag', price: '$2,650', image: '/images/rec3.jpg' },
    { id: '5', name: 'Jackie 1961 Mini Shoulder Bag', price: '$2,980', image: '/images/rec4.jpg' },
    { id: '6', name: 'GG Marmont Small Bag', price: '$2,500', image: '/images/rec5.jpg' },
    { id: '7', name: 'Gucci Diana Mini Tote', price: '$3,200', image: '/images/rec6.jpg' },
    { id: '8', name: 'Gucci Horsebit Chain Bag', price: '$3,500', image: '/images/rec7.jpg' },
  ];

  return (
    <div className="w-full bg-white py-20 md:py-32">
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-thin uppercase tracking-widest text-center mb-16 md:mb-24">
        You May Also Like
      </h2>
      <div className="relative px-4 md:px-8">
        <button onClick={scrollRecLeft} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm w-12 h-12 md:w-20 md:h-20 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition">
          <i className="fas fa-chevron-left text-2xl md:text-4xl" />
        </button>
        <button onClick={scrollRecRight} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm w-12 h-12 md:w-20 md:h-20 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition">
          <i className="fas fa-chevron-right text-2xl md:text-4xl" />
        </button>

        <div ref={recScrollRef} className="flex gap-8 md:gap-16 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide px-4 md:px-8">
          {productsToShow.map((rec) => (
            <div key={rec.id} className="snap-center flex-shrink-0 w-80 md:w-96 group cursor-pointer">
              <Link href={`/product/${rec.id}`} className="block">
                <div className="relative overflow-hidden rounded-xl shadow-2xl aspect-[3/4]">
                  <Image
                    src={rec.image || '/images/placeholder.jpg'}
                    alt={rec.name}
                    fill
                    sizes="(max-width: 768px) 80vw, 400px"
                    loading="lazy"
                    quality={95}
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="mt-12 text-center">
                  <p className="!text-black text-2xl font-thin tracking-widest">{rec.name}</p>
                  <p className="!text-black mt-6 text-xl">{rec.price}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}