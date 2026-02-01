'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// ✅ 关键：关闭 SSR 的 AR 组件
const ModelViewer = dynamic(() => import('./ModelViewer'), { ssr: false });

interface ProductGalleryProps {
  product: any;
  selectedColor: string;
}

export default function ProductGallery({ product, selectedColor }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [mediaMode, setMediaMode] = useState<'photos' | 'video' | 'ar'>('photos');
  const [zoomed, setZoomed] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  // 校验图片 URL
  const isValidUrl = (str: any): str is string => {
    if (typeof str !== 'string' || str.trim() === '') return false;
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  // 默认图片
  const fallbackImages = useMemo<string[]>(() => {
    return Array.isArray(product.images)
      ? product.images.filter((url: any) => isValidUrl(url))
      : [];
  }, [product.images]);

  // 颜色图片
  const currentColorImages = useMemo<string[]>(() => {
    const candidate = product.colorImages?.[selectedColor?.toLowerCase()];
    return Array.isArray(candidate)
      ? candidate.filter((url: any) => isValidUrl(url))
      : [];
  }, [product.colorImages, selectedColor]);

  const finalImages = currentColorImages.length > 0 ? currentColorImages : fallbackImages;
  const currentMainImage = finalImages[selectedImage] || '/images/placeholder.jpg';

  useEffect(() => {
    setSelectedImage(0);
    setZoomed(false);
  }, [selectedColor]);

  const prevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? finalImages.length - 1 : prev - 1));
    setZoomed(false);
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev === finalImages.length - 1 ? 0 : prev + 1));
    setZoomed(false);
  };

  // 手势滑动
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartX.current) return;
    const diffX = touchStartX.current - e.touches[0].clientX;
    if (Math.abs(diffX) > 50) {
      diffX > 0 ? nextImage() : prevImage();
      touchStartX.current = null;
    }
  };

  // 鼠标拖动切换
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseStartX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || mouseStartX.current === null) return;
    const diffX = mouseStartX.current - e.clientX;
    if (Math.abs(diffX) > 60) {
      diffX > 0 ? nextImage() : prevImage();
      mouseStartX.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    mouseStartX.current = null;
  };

  const handleShare = () => {
    const shareData = {
      title: product.name || 'Check this product',
      text: 'Check out this amazing product!',
      url: window.location.href,
    };

    if (navigator.share) navigator.share(shareData).catch(() => {});
    else navigator.clipboard?.writeText(shareData.url);
  };

  const hasVideo = !!product.video;
  const hasAR = !!product.modelGlb;

  return (
    <div className="relative w-full aspect-[9/12] md:aspect-[16/9] overflow-hidden">

      {/* ========== 图片模式 ========== */}
      {mediaMode === 'photos' && (
        <div
          className="relative w-full h-full cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => setZoomed(!zoomed)}
        >
          <Image
            src={currentMainImage}
            alt={product.name}
            fill
            sizes="100vw"
            className={`object-cover transition-transform duration-500 ${zoomed ? 'scale-150' : 'scale-100'}`}
            priority
          />

          {/* 左右箭头 */}
          {finalImages.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/80 w-12 h-12 rounded-full shadow">‹</button>
              <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/80 w-12 h-12 rounded-full shadow">›</button>
            </>
          )}
        </div>
      )}

      {/* ========== 视频模式 ========== */}
      {mediaMode === 'video' && hasVideo && (
        <video
          src={product.video}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      )}

      {/* ========== AR 模式 ========== */}
      {mediaMode === 'ar' && hasAR && (
        <ModelViewer
          src={product.modelGlb}
          iosSrc={product.modelUsdz || ''}
          alt={`${product.name} AR view`}
        />
      )}

      {/* 分享按钮 */}
      <button
        onClick={handleShare}
        className="absolute right-4 top-4 bg-white w-10 h-10 rounded-full shadow flex items-center justify-center"
      >
        ↗
      </button>

      {/* 底部 Tabs */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 px-6 py-2 rounded-full flex gap-6 text-sm uppercase tracking-wider">
        <button onClick={() => setMediaMode('photos')} className={mediaMode === 'photos' ? 'font-bold' : ''}>Photos</button>
        {hasVideo && <button onClick={() => setMediaMode('video')} className={mediaMode === 'video' ? 'font-bold' : ''}>Video</button>}
        {hasAR && <button onClick={() => setMediaMode('ar')} className={mediaMode === 'ar' ? 'font-bold' : ''}>AR Try-On</button>}
      </div>
    </div>
  );
}
