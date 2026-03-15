'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function ProductListClient({ initialProducts, collectionTitle }: any) {
  return (
    <div className="bg-white min-h-screen pt-24">
      <div className="max-w-[1800px] mx-auto px-6 pb-24">
        <h1 className="text-3xl font-extralight tracking-[0.4em] uppercase text-center py-20">
          {collectionTitle || 'Collections'}
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* 1. 使用 ?. 防止 initialProducts 为空时崩溃 */}
          {initialProducts?.map((product: any, index: number) => (
            /* 2. 核心修复：防止 product.id 为 undefined 时导致的 toString 报错 */
            /* 如果没有 id，回退使用 index 确保构建能通过 */
            <Link 
              key={product?.id?.toString() || `product-${index}`} 
              href={`/product/${product?.slug || ''}`} 
              className="group"
            >
              <div className="aspect-[3/4] relative bg-[#f7f7f7] mb-4">
                {/* 3. 增强图片加载保护 */}
                {product?.images?.[0]?.url ? (
                  <Image 
                    src={product.images[0].url} 
                    alt={product?.name || 'Product Image'} 
                    fill 
                    className="object-cover" 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-300 text-[10px] uppercase tracking-widest">
                    No Image
                  </div>
                )}
              </div>
              <div className="text-center">
                {/* 4. 增强文字保护，防止 null 数据 */}
                <p className="text-[11px] uppercase tracking-widest">
                  {product?.name || 'Unnamed Product'}
                </p>
                <p className="text-xs text-gray-500">
                  {/* 5. 确保价格能够被解析，即使它是 0 或 undefined */}
                  ${product?.price?.toString() || '0.00'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}