'use client';

import Image from 'next/image';

interface ProductOptionsProps {
  product: any;
  selectedColor: string;
  onColorChange: (color: string) => void;
  // 注意：如果不再需要传入 selectedSize 和 onSizeChange，你也可以从这里移除它们
  selectedSize: string; 
  onSizeChange: (size: string) => void;
}

export default function ProductOptions({
  product,
  selectedColor,
  onColorChange,
  // selectedSize, 
  // onSizeChange,
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
        
        {/* 缩略图网格 */}
        <div className="grid grid-cols-9 gap-1.5"> 
          {product.colors?.map((color: any) => {
            const isSelected = selectedColor === color.name;
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
      {/* 尺寸区块已移除，这样就不会显示重复了 */}
    </div>
  );
}