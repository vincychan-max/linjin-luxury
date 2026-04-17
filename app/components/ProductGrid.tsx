'use client';

import Image from 'next/image';
import Link from 'next/link';

// 定义产品类型
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  isNew?: boolean;
  material?: string; 
};

// Props 接口：增加 initialEndCursor 以解决报错
interface ProductGridProps {
  initialProducts: Product[];
  category: string | null;
  gender: string | null;
  page?: number | null;               // 改为可选，因为 Best Sellers 可能不传
  initialEndCursor?: string | null;    // 🌟 新增：支持游标分页，解决红线报错
}

export default function ProductGrid({
  initialProducts,
  category,
  gender,
  page = 1,                            // 设置默认值
  initialEndCursor,                    // 接收该属性
}: ProductGridProps) {
  
  // 如果当前分类没有产品
  if (initialProducts.length === 0) {
    return (
      <div className="text-center py-40 bg-white">
        <h2 className="text-[11px] font-bold tracking-[0.4em] uppercase text-black mb-4">
          Collection Coming Soon
        </h2>
        <p className="text-[10px] tracking-widest text-black/40 uppercase">
          Exclusive pieces arriving shortly from our studio.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* 产品网格 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-16 md:gap-y-24">
        {initialProducts.map((product, index) => (
          <article key={product.id} className="group">
            <Link href={`/product/${product.slug}`} className="block">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#FBFBFB] mb-8">
                <Image
                  src={product.images[0] || '/images/placeholder.jpg'}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                  // 只有在第一页且是前几个产品时开启优先加载
                  priority={page === 1 && index < 8}
                />
                {product.isNew && (
                  <span className="absolute top-4 left-4 text-[9px] font-bold tracking-tighter uppercase bg-black text-white px-2 py-1">
                    New
                  </span>
                )}
              </div>

              <div className="text-center px-4">
                <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-black mb-3 leading-tight">
                  {product.name}
                </h3>
                <p className="text-[12px] font-medium tracking-[0.1em] text-black">
                  ${Number(product.price).toLocaleString('en-US')}
                </p>
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* 分页状态展示 */}
      {(page && page > 1) && (
        <div className="mt-16 text-center">
          <p className="text-[10px] tracking-[0.5em] text-zinc-400">
            PAGE {page}
          </p>
        </div>
      )}
    </div>
  );
}