// app/components/InstagramCarousel.tsx
'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

const blurDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAgoB/4D1f0AAAAASUVORK5CYII=';

export default function InstagramCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const dotsContainer = document.getElementById('dots-container');
    if (!dotsContainer) return;

    const totalItems = carousel.children.length;
    let currentIndex = 0;

    const getItemWidth = () => {
      if (carousel.children.length === 0) return 0;
      const rect = carousel.children[0].getBoundingClientRect();
      const style = window.getComputedStyle(carousel);
      const gap = parseFloat(style.gap) || 32;
      return rect.width + gap;
    };

    // 创建 dots
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalItems; i++) {
      const dot = document.createElement('button');
      dot.className = 'w-3 h-3 rounded-full bg-black/30 hover:bg-black/60 transition';
      if (i === 0) dot.classList.add('bg-black/80');
      dot.addEventListener('click', () => {
        currentIndex = i;
        carousel.scrollTo({ left: i * getItemWidth(), behavior: 'smooth' });
        updateDots();
      });
      dotsContainer.appendChild(dot);
    }
    const dots = dotsContainer.children;

    const updateDots = () => {
      Array.from(dots).forEach((dot, i) => {
        dot.classList.toggle('bg-black/80', i === currentIndex);
        dot.classList.toggle('bg-black/30', i !== currentIndex);
      });
    };

    // 增量滚动（最稳定）
    const scrollNext = () => {
      const itemWidth = getItemWidth();
      carousel.scrollBy({ left: itemWidth, behavior: 'smooth' });
      currentIndex = (currentIndex + 1) % totalItems;
      updateDots();
    };

    const scrollPrev = () => {
      const itemWidth = getItemWidth();
      carousel.scrollBy({ left: -itemWidth, behavior: 'smooth' });
      currentIndex = (currentIndex - 1 + totalItems) % totalItems;
      updateDots();
    };

    prevBtn?.addEventListener('click', scrollPrev);
    nextBtn?.addEventListener('click', scrollNext);

    carousel.addEventListener('scroll', () => {
      const itemWidth = getItemWidth();
      if (itemWidth > 0) {
        const newIndex = Math.round(carousel.scrollLeft / itemWidth);
        if (newIndex !== currentIndex) {
          currentIndex = newIndex % totalItems;
          updateDots();
        }
      }
    });

    // resize 时对齐
    window.addEventListener('resize', () => {
      carousel.scrollTo({ left: currentIndex * getItemWidth(), behavior: 'instant' });
    });

    // 初始状态
    updateDots();
    console.log('Client-side Instagram carousel initialized successfully!');

    // 清理
    return () => {
      prevBtn?.removeEventListener('click', scrollPrev);
      nextBtn?.removeEventListener('click', scrollNext);
    };
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-8 pb-4
                   scrollbar-hide 
                   [-ms-overflow-style:none] 
                   [scrollbar-width:none] 
                   [&::-webkit-scrollbar]:hidden
                   touch-action:pan-x pinch-zoom"
      >
        <div className="flex-none w-full md:w-1/3 aspect-square relative overflow-hidden bg-gray-100 shadow-lg rounded-lg">
          <Image 
            src="/images/ig-1.jpg" 
            alt="Linjin Luxury Instagram - Client styling inspiration" 
            fill 
            placeholder="blur"
            blurDataURL={blurDataURL}
            className="object-cover" 
          />
        </div>
        <div className="flex-none w-full md:w-1/3 aspect-square relative overflow-hidden bg-gray-100 shadow-lg rounded-lg">
          <Image 
            src="/images/ig-2.jpg" 
            alt="Linjin Luxury Instagram - New arrival handbag" 
            fill 
            placeholder="blur"
            blurDataURL={blurDataURL}
            className="object-cover" 
          />
        </div>
        <div className="flex-none w-full md:w-1/3 aspect-square relative overflow-hidden bg-gray-100 shadow-lg rounded-lg">
          <Image 
            src="/images/ig-3.jpg" 
            alt="Linjin Luxury Instagram - Behind the scenes" 
            fill 
            placeholder="blur"
            blurDataURL={blurDataURL}
            className="object-cover" 
          />
        </div>
        <div className="flex-none w-full md:w-1/3 aspect-square relative overflow-hidden bg-gray-100 shadow-lg rounded-lg">
          <Image 
            src="/images/ig-4.jpg" 
            alt="Linjin Luxury Instagram - Luxury handbag detail" 
            fill 
            placeholder="blur"
            blurDataURL={blurDataURL}
            className="object-cover" 
          />
        </div>
        <div className="flex-none w-full md:w-1/3 aspect-square relative overflow-hidden bg-gray-100 shadow-lg rounded-lg">
          <Image 
            src="/images/ig-5.jpg" 
            alt="Linjin Luxury Instagram - Client unboxing" 
            fill 
            placeholder="blur"
            blurDataURL={blurDataURL}
            className="object-cover" 
          />
        </div>
        <div className="flex-none w-full md:w-1/3 aspect-square relative overflow-hidden bg-gray-100 shadow-lg rounded-lg">
          <Image 
            src="/images/ig-6.jpg" 
            alt="Linjin Luxury Instagram - Los Angeles styling" 
            fill 
            placeholder="blur"
            blurDataURL={blurDataURL}
            className="object-cover" 
          />
        </div>
      </div>

      {/* prev/next 按钮 - 高 z-index + 触屏优化 */}
      <button
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 md:p-3 rounded-full shadow-2xl hover:bg-white transition text-xl md:text-2xl z-[9999] pointer-events-auto touch-action-manipulation cursor-pointer"
        id="prev-btn"
      >
        ‹
      </button>
      <button
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 md:p-3 rounded-full shadow-2xl hover:bg-white transition text-xl md:text-2xl z-[9999] pointer-events-auto touch-action-manipulation cursor-pointer"
        id="next-btn"
      >
        ›
      </button>

      <div className="flex justify-center mt-8 gap-2" id="dots-container" />
    </div>
  );
}