'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function ProductListClient({ initialProducts, collectionTitle }: any) {
  return (
    <div className="bg-white min-h-screen pt-24">
      <div className="max-w-[1800px] mx-auto px-6 pb-24">
        <h1 className="text-3xl font-extralight tracking-[0.4em] uppercase text-center py-20 text-zinc-900">
          {collectionTitle || 'Collections'}
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {initialProducts?.map((product: any, index: number) => {
            // 🌟 核心逻辑：从 variants 中安全地提取图片
            // 优先找第一个变体的第一张图
            const previewImage = product?.variants?.[0]?.images?.[0]?.url;

            return (
              <Link 
                key={product?.id?.toString() || `product-${index}`} 
                href={`/product/${product?.slug || ''}`} 
                className="group"
              >
                <div className="aspect-[3/4] relative bg-[#f7f7f7] mb-6 overflow-hidden">
                  {previewImage ? (
                    <Image 
                      src={previewImage} 
                      alt={product?.name || 'Product Image'} 
                      fill 
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-300 text-[10px] uppercase tracking-[0.3em]">
                      No Image
                    </div>
                  )}
                  
                  {/* 如果是新品，增加一个小标志 */}
                  {product?.isNew && (
                    <div className="absolute top-3 left-3 bg-black text-white text-[9px] px-2 py-0.5 uppercase tracking-tighter">
                      New
                    </div>
                  )}
                </div>

                <div className="text-center space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] font-medium text-zinc-900 line-clamp-1">
                    {product?.name || 'Unnamed Product'}
                  </p>
                  <p className="text-[12px] tracking-widest text-zinc-400 font-light">
                    ${Number(product?.price || 0).toLocaleString('en-US')}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}