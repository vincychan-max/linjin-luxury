'use client';

import Image from 'next/image';

interface ProductOptionsProps {
  product: any;
  selectedColor: string;
  onColorChange: (color: string) => void;
  selectedSize: string;
  onSizeChange: (size: string) => void;
}

export default function ProductOptions({
  product,
  selectedColor,
  onColorChange,
  selectedSize,
  onSizeChange,
}: ProductOptionsProps) {
  return (
    <div className="space-y-8">
      {/* 颜色选择区块 */}
      <div className="space-y-4">
        {/* 标题栏 */}
        <div className="flex justify-between items-end border-b border-zinc-100 pb-2">
          <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-medium">
            Color
          </p>
          <p className="text-[10px] text-zinc-900 font-light tracking-wide uppercase">
            {selectedColor}
          </p>
        </div>
        
        {/* 🚀 缩略图网格：一行 9 个 */}
        <div className="grid grid-cols-9 gap-1.5"> 
          {product.colors?.map((color: any) => {
            const isSelected = selectedColor === color.name;
            
            /**
             * 🌟 核心修复：Hygraph 图片转换
             * 1. width=120: 提供 3 倍像素密度，适配高清屏。
             * 2. auto=format: 自动使用 WebP 格式提高锐度。
             * 3. fit=crop: 确保在 3:4 的容器里不拉伸变形。
             */
            const rawImage = color.images?.[0]?.url || product.images?.[0]?.url;
            const optimizedPreview = rawImage 
              ? `${rawImage}?auto=format,compress&width=120&height=160&fit=crop`
              : '/placeholder.jpg';

            return (
              <button
                key={color.id}
                onClick={() => onColorChange(color.name)}
                className="relative w-full group outline-none"
              >
                {/* 内部容器：isSelected 时显示极细黑色边框 */}
                <div className={`relative w-full aspect-[3/4] overflow-hidden transition-all duration-300 ${
                  isSelected 
                    ? 'ring-[0.5px] ring-zinc-900 shadow-sm' 
                    : 'ring-[0.5px] ring-transparent group-hover:ring-zinc-200'
                }`}>
                  <Image
                    src={optimizedPreview}
                    alt={color.name}
                    fill
                    className="object-cover"
                    // 提升质量，确保皮革纹理清晰
                    quality={90}
                    sizes="(max-width: 768px) 15vw, 5vw"
                    priority={true} 
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 尺寸选择区块 */}
      <div className="space-y-4">
        <div className="border-b border-zinc-100 pb-2">
          <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-medium">
            Size
          </p>
        </div>
        <div className="flex flex-wrap gap-6 pt-1">
          {product.sizes?.map((size: string) => (
            <button
              key={size}
              onClick={() => onSizeChange(size)}
              className={`text-[10px] tracking-[0.1em] transition-all duration-300 ${
                selectedSize === size 
                  ? 'text-zinc-900 font-medium underline underline-offset-4 decoration-[0.5px]' 
                  : 'text-zinc-300 hover:text-zinc-900'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}