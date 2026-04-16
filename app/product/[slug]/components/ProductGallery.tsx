'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductGallery({ product, images: propImages, altText }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSplit, setIsSplit] = useState(false);

  // 1. 优先提取图片数据
  const images = propImages || product?.images || [];

  // 2. 计算索引（添加保护逻辑防止报错）
  const nextIndex = images.length > 0 ? (currentIndex + 1) % images.length : 0;
  const prevIndex = images.length > 0 ? (currentIndex - 1 + images.length) % images.length : 0;

  // 当图片列表改变（如切换颜色）时，重置索引
  useEffect(() => {
    setCurrentIndex(0);
  }, [images.length, propImages]);

  // 左右键键盘监听逻辑
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (images.length === 0) return;
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
  }, [currentIndex, nextIndex, prevIndex, images.length]);

  // 3. 定义交互逻辑
  const handleMainClick = () => {
    if (!isSplit) {
      setIsSplit(true);
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const transition = {
    duration: 1.0,
    ease: [0.32, 0.72, 0, 1],
  };

  // --- 安全检查：如果没图，显示占位符 ---
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-screen bg-zinc-100 flex items-center justify-center text-xs uppercase tracking-widest text-zinc-400">
        No Images Available
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full bg-black overflow-hidden cursor-pointer select-none"
      onClick={handleMainClick}
    >
      {/* 主展示区 */}
      <div className="relative w-full h-full flex">
        <AnimatePresence initial={false} mode="popLayout">
          {/* 左侧/主图 */}
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
              // 🌟 优化：优先使用图片自带的 alt，否则使用传入的全局 altText
              alt={images[currentIndex]?.alt || `${altText || 'Luxury Bag'} - Main View`}
              priority
            />
          </motion.div>

          {/* 右侧分裂图 */}
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
                  // 🌟 优化：为下一张图设置对应的 alt 描述
                  alt={images[nextIndex]?.alt || `${altText || 'Luxury Bag'} - Detail View`}
                  loading="lazy"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </AnimatePresence>
      </div>

      {/* 底部缩略图与导航按钮 */}
      <div className="absolute bottom-6 right-6 z-40 flex items-center gap-4">
        {/* 上一张按钮 */}
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentIndex(prevIndex); setIsSplit(true); }}
          className="text-white opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Previous image"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 缩略图列表 */}
        <div className="flex items-end gap-2.5">
          {images.map((img: any, idx: number) => (
            <div
              key={idx}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); setIsSplit(true); }}
              className="group cursor-pointer flex flex-col items-center gap-1"
            >
              <motion.div
                className={`relative w-12 h-16 overflow-hidden rounded border transition-all duration-500 ${
                  currentIndex === idx
                    ? 'border-white/80 scale-110 shadow-lg'
                    : 'border-transparent opacity-60'
                }`}
              >
                <Image 
                  src={img.url} 
                  fill 
                  // 🌟 优化：缩略图也添加 alt，提高页面关键词密度
                  alt={img.alt || `${altText || 'Product'} Thumbnail ${idx + 1}`} 
                  className="object-cover" 
                />
              </motion.div>
            </div>
          ))}
        </div>

        {/* 下一张按钮 */}
        <button
          onClick={(e) => { e.stopPropagation(); setCurrentIndex(nextIndex); setIsSplit(true); }}
          className="text-white opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Next image"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}