'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// 🚀 修改 Props 定义，使其支持直接传入 images 数组
export default function ProductGallery({ product, images: propImages }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSplit, setIsSplit] = useState(false);

  // 🚀 核心修复逻辑：
  // 如果有传 images (颜色联动图)，就用 images；否则回退到 product.images
  const images = propImages || product?.images || [];

  const nextIndex = (currentIndex + 1) % images.length;
  const prevIndex = (currentIndex - 1 + images.length) % images.length;

  // 增加一个重置机制：如果图片数组变了（比如切颜色了），重置索引到第一张
  useEffect(() => {
    setCurrentIndex(0);
  }, [images.length, propImages]); 

  if (!images.length) return (
    <div className="w-full h-screen bg-zinc-100 flex items-center justify-center text-xs uppercase tracking-widest text-zinc-400">
      No Images Available
    </div>
  );

  const transition = {
    duration: 1.0,
    ease: [0.32, 0.72, 0, 1],
  };

  const handleMainClick = () => {
    if (!isSplit) {
      setIsSplit(true);
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const handleThumbClick = (index: number) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
    setIsSplit(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex(nextIndex);
        setIsSplit(true);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex(prevIndex);
        setIsSplit(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, nextIndex, prevIndex]);

  return (
    <div
      className="relative w-full h-full bg-black overflow-hidden cursor-pointer select-none"
      onClick={handleMainClick}
    >
      <div className="relative w-full h-full flex">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={`left-${currentIndex}-${images[currentIndex]?.url}`}
            initial={{ width: '100%' }}
            animate={{ width: isSplit ? '50%' : '100%' }}
            exit={{ width: '0%' }}
            transition={transition}
            className="relative h-full overflow-hidden flex items-center justify-center z-20"
          >
            <Image
              src={images[currentIndex]?.url}
              fill
              className="object-cover"
              style={{ objectPosition: isSplit ? 'right center' : 'center' }}
              alt="current"
              priority
            />
          </motion.div>

          <AnimatePresence>
            {isSplit && (
              <motion.div
                key={`right-${currentIndex}-${images[nextIndex]?.url}`}
                initial={{ width: '0%' }}
                animate={{ width: '50%' }}
                exit={{ width: '0%' }}
                transition={transition}
                className="relative h-full overflow-hidden flex items-center justify-center z-10"
              >
                <Image
                  src={images[nextIndex]?.url}
                  fill
                  className="object-cover"
                  style={{ objectPosition: 'left center' }}
                  alt="next"
                  loading="lazy"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </AnimatePresence>
      </div>

      {/* 缩略图部分 */}
      <div className="absolute bottom-6 right-6 z-40 flex items-center gap-4">
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentIndex(prevIndex); setIsSplit(true); }}
          className="text-white opacity-50 hover:opacity-90 transition-opacity"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-end gap-2.5">
          {images.map((img: any, idx: number) => (
            <div
              key={idx}
              onClick={(e) => { e.stopPropagation(); handleThumbClick(idx); }}
              className="group cursor-pointer flex flex-col items-center gap-1"
            >
              <motion.div
                className={`relative w-12 h-16 overflow-hidden rounded border transition-all duration-500 ${
                  currentIndex === idx
                    ? 'border-white/80 scale-110 shadow-lg'
                    : 'border-transparent opacity-60'
                }`}
              >
                <Image src={img.url} fill alt="" className="object-cover" />
              </motion.div>
            </div>
          ))}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); setCurrentIndex(nextIndex); setIsSplit(true); }}
          className="text-white opacity-50 hover:opacity-90 transition-opacity"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}