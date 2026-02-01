'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// 修复 TypeScript 对 <model-viewer> 自定义元素的类型错误
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;  // 允许所有属性（简单安全方式）
    }
  }
}

interface ProductGalleryProps {
  product: any;
  selectedColor: string;
}

export default function ProductGallery({ product, selectedColor }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [previousImage, setPreviousImage] = useState<string | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [leftZoomed, setLeftZoomed] = useState(false);
  const [rightZoomed, setRightZoomed] = useState(false);
  const [mediaMode, setMediaMode] = useState<'photos' | 'video' | 'ar'>('photos');

  const touchStartX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const isValidUrl = (str: any): str is string => {
    if (typeof str !== 'string' || str.trim() === '') return false;
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const fallbackImages = useMemo<string[]>(() => {
    return Array.isArray(product.images)
      ? product.images.filter((url: any) => isValidUrl(url))
      : [];
  }, [product.images]);

  const currentColorImages = useMemo<string[]>(() => {
    const candidate = product.colorImages?.[selectedColor.toLowerCase()];
    return Array.isArray(candidate)
      ? candidate.filter((url: any) => isValidUrl(url))
      : [];
  }, [product.colorImages, selectedColor]);

  const finalImages = useMemo<string[]>(() =>
    currentColorImages.length > 0 ? currentColorImages : fallbackImages,
    [currentColorImages, fallbackImages]
  );

  const currentMainImage = finalImages[selectedImage] || '/images/placeholder.jpg';

  useEffect(() => {
    setSelectedImage(0);
    setPreviousImage(null);
    setShowCompare(false);
    setLeftZoomed(false);
    setRightZoomed(false);
  }, [selectedColor]);

  const handleImageClick = (index: number) => {
    if (selectedImage === index) {
      setShowCompare(false);
      setLeftZoomed(false);
      setRightZoomed(false);
    } else {
      setPreviousImage(currentMainImage);
      setSelectedImage(index);
      setShowCompare(true);
      setLeftZoomed(false);
      setRightZoomed(false);
    }
  };

  const prevImage = () => {
    const newIndex = selectedImage === 0 ? finalImages.length - 1 : selectedImage - 1;
    setPreviousImage(currentMainImage);
    setSelectedImage(newIndex);
    setShowCompare(true);
    setLeftZoomed(false);
    setRightZoomed(false);
  };

  const nextImage = () => {
    const newIndex = selectedImage === finalImages.length - 1 ? 0 : selectedImage + 1;
    setPreviousImage(currentMainImage);
    setSelectedImage(newIndex);
    setShowCompare(true);
    setLeftZoomed(false);
    setRightZoomed(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartX.current) return;
    const diffX = touchStartX.current - e.touches[0].clientX;
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) nextImage();
      else prevImage();
      touchStartX.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseStartX.current = e.clientX;
    isDragging.current = true;
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !mouseStartX.current) return;
    const diffX = mouseStartX.current - e.clientX;
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) nextImage();
      else prevImage();
      mouseStartX.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    mouseStartX.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.deltaX > 0 ? nextImage() : prevImage();
    } else if (Math.abs(e.deltaY) > 20) {
      e.deltaY > 0 ? nextImage() : prevImage();
    }
  };

  const handleShare = () => {
    const shareData = {
      title: product.name || 'Check this product',
      text: 'Check out this amazing product!',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareData.url);
      alert('Product link copied to clipboard!');
    } else {
      alert('Sharing not supported. Copy the URL manually.');
    }
  };

  const hasVideo = !!product.video;
  const hasAR = !!product.modelGlb;

  return (
    <div className="relative w-full aspect-[9/12] md:aspect-[16/9] max-h-screen overflow-hidden">
      {mediaMode === 'photos' && (
        <div className="relative w-full h-full group">
          {/* 主图区域 */}
          {showCompare && previousImage ? (
            <div
              className="flex flex-col md:flex-row h-full relative"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <div
                className="w-full md:w-1/2 flex-1 relative overflow-hidden cursor-zoom-in transition-all duration-500"
                onClick={() => setLeftZoomed(!leftZoomed)}
              >
                {leftZoomed && <div className="absolute inset-0 z-10 cursor-zoom-out" onClick={(e) => { e.stopPropagation(); setLeftZoomed(false); }} />}
                <Image
                  src={previousImage}
                  alt="Previous"
                  fill
                  sizes="50vw"
                  className={`object-cover transition-transform duration-500 origin-center ${leftZoomed ? 'scale-200' : 'scale-100'}`}
                  quality={95}
                  priority
                />
              </div>

              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30 hidden md:block -translate-x-1/2" />

              <div
                className="w-full md:w-1/2 flex-1 relative overflow-hidden cursor-zoom-in transition-all duration-500"
                onClick={() => setRightZoomed(!rightZoomed)}
              >
                {rightZoomed && <div className="absolute inset-0 z-10 cursor-zoom-out" onClick={(e) => { e.stopPropagation(); setRightZoomed(false); }} />}
                <Image
                  src={currentMainImage}
                  alt={product.name}
                  fill
                  sizes="50vw"
                  className={`object-cover transition-transform duration-500 origin-center ${rightZoomed ? 'scale-200' : 'scale-100'}`}
                  priority
                  quality={95}
                />
              </div>
            </div>
          ) : (
            <div
              className="relative w-full h-full cursor-grab active:cursor-grabbing select-none md:pl-32"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              onClick={() => setRightZoomed(!rightZoomed)}
            >
              {rightZoomed && <div className="absolute inset-0 z-10 cursor-zoom-out" onClick={(e) => { e.stopPropagation(); setRightZoomed(false); }} />}
              <Image
                src={currentMainImage}
                alt={product.name}
                fill
                sizes="100vw"
                className={`object-cover transition-transform duration-500 origin-center ${rightZoomed ? 'scale-200' : 'scale-100'}`}
                priority
                quality={95}
              />
            </div>
          )}

          {/* 左右箭头 */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <button
              onClick={prevImage}
              className="absolute left-8 top-1/2 -translate-y-1/2 pointer-events-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
            >
              <svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
            >
              <svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      )}
          
      {/* Video / AR 模式（无左侧padding） */}
      {(mediaMode === 'video' || mediaMode === 'ar') && (
        <div className="w-full h-full">
          {mediaMode === 'video' && hasVideo && (
            <video
              src={product.video}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              preload="metadata"
            />
          )}
          {mediaMode === 'ar' && hasAR && (
            <model-viewer
              src={product.modelGlb}
              ios-src={product.modelUsdz || ''}
              alt={`${product.name} AR view`}
              camera-controls
              ar
              ar-modes="scene-viewer quick-look webxr"
              ar-scale="auto"
              xr-environment
              shadow-intensity="1"
              auto-rotate
              loading="lazy"
              className="w-full h-full"
            >
              <button slot="ar-button" className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-4 rounded-full uppercase tracking-widest text-lg">
                Tap to View in AR
              </button>
            </model-viewer>
          )}
        </div>
      )}

      {/* 新增：分享按钮（右上角，全模式通用） */}
      <div className="absolute right-4 md:right-8 top-4 md:top-8 z-30">
        <button
          onClick={handleShare}
          className="bg-white/90 backdrop-blur-md hover:bg-white w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all"
          aria-label="Share product"
        >
          <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.41" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>

      {/* 移动端图片指示器：计数 + Dots（最高优先） */}
      {mediaMode === 'photos' && finalImages.length > 1 && (
        <div className="md:hidden absolute left-1/2 -translate-x-1/2 bottom-24 z-20 flex flex-col items-center gap-4 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md text-black font-bold text-lg px-6 py-3 rounded-full shadow-2xl">
            {selectedImage + 1} / {finalImages.length}
          </div>
          <div className="flex items-center gap-3">
            {finalImages.map((_, index) => (
              <div
                key={index}
                className={`rounded-full transition-all duration-300 ${
                  index === selectedImage
                    ? 'bg-white w-10 h-2.5 shadow-md'
                    : 'bg-white/60 w-2.5 h-2.5'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 媒体 Tabs（底部居中） */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl flex gap-6 uppercase tracking-widest text-sm md:text-base">
        <button
          onClick={() => setMediaMode('photos')}
          className={`pb-1 transition relative ${mediaMode === 'photos' ? 'text-black font-bold' : 'text-gray-500'}`}
        >
          Photos
          {mediaMode === 'photos' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
        </button>
        {hasVideo && (
          <button
            onClick={() => setMediaMode('video')}
            className={`pb-1 transition relative ${mediaMode === 'video' ? 'text-black font-bold' : 'text-gray-500'}`}
          >
            Video
            {mediaMode === 'video' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
          </button>
        )}
        {hasAR && (
          <button
            onClick={() => setMediaMode('ar')}
            className={`pb-1 transition relative ${mediaMode === 'ar' ? 'text-black font-bold' : 'text-gray-500'}`}
          >
            AR Try-On
            {mediaMode === 'ar' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
          </button>
        )}
      </div>

      {/* 缩略图：只在桌面端显示左侧垂直，并添加图片计数（放在缩略图区域顶部） */}
      {mediaMode === 'photos' && finalImages.length > 1 && (
        <div className="hidden md:flex flex-col gap-3 absolute left-8 top-1/2 -translate-y-1/2 z-20 overflow-y-auto scrollbar-hide max-h-[80vh] py-8">
          <div className="self-center mb-6">
            <div className="bg-white/90 backdrop-blur-md text-black font-bold text-lg px-6 py-3 rounded-full shadow-2xl">
              {selectedImage + 1} / {finalImages.length}
            </div>
          </div>
          {finalImages.map((img: string, index: number) => (
            <button
              key={index}
              onClick={() => handleImageClick(index)}
              className={`flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden transition-all duration-300 ${
                selectedImage === index
                  ? 'ring-4 ring-white/90 shadow-2xl scale-110 opacity-100'
                  : 'opacity-70 hover:opacity-90 hover:scale-105'
              }`}
            >
              <Image
                src={img}
                alt=""
                width={160}
                height={224}
                loading="lazy"
                quality={85}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}