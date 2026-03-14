'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// 定义产品类型，与 API 返回的 nodes 结构保持一致
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  stock?: number;
  isNew?: boolean;
  isLimited?: boolean;
  gender?: string;
  subCategory?: string;
};

interface ProductGridProps {
  initialProducts: Product[];
  initialEndCursor?: string | null;
  category: string | null; // 对应 API 的 category (slug)
  gender: string | null;   // 对应 API 的 mainCategory (slug)
}

const PAGE_SIZE = 12;

export default function ProductGrid({ 
  initialProducts, 
  initialEndCursor = null, 
  category, 
  gender 
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cursor, setCursor] = useState<string | null>(initialEndCursor);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialProducts.length >= PAGE_SIZE);
  const [error, setError] = useState<string | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);

  // 核心逻辑：调用 API 路由进行分页
  const loadMore = async () => {
    if (loading || !hasMore || !cursor) return;
    setLoading(true);
    setError(null);

    try {
      // 对齐 API Route 的参数名：mainCategory 和 category
      const queryParams = new URLSearchParams({
        after: cursor,
        mainCategory: gender || '',
        category: category || '',
        limit: PAGE_SIZE.toString(),
      });

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      
      if (!res.ok) throw new Error('Failed to fetch from API');
      
      const data = await res.json();

      if (data.nodes && data.nodes.length > 0) {
        const newProducts = data.nodes.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          // 处理 Hygraph 返回的 images 对象数组
          images: p.images?.map((img: { url: string }) => img.url) || [],
          isNew: p.isNew,
          isLimited: p.isLimited,
        }));

        setProducts(prev => [...prev, ...newProducts]);
        setHasMore(data.pageInfo.hasNextPage);
        setCursor(data.pageInfo.endCursor);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Infinite scroll error:', err);
      setError('Could not load more products.');
    } finally {
      setLoading(false);
    }
  };

  // 监听滚动
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '400px' } // 提前 400px 开始加载，体验更顺滑
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [cursor, hasMore, loading]);

  // 空状态展示
  if (products.length === 0) {
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
      {/* 产品展示网格 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-16 md:gap-y-24">
        {products.map((product, index) => (
          <article 
            key={product.id}
            className="group"
          >
            <Link href={`/product/${product.slug}`} className="block">
              {/* 图片容器：无灰色遮罩，极简白/浅灰背景 */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#FBFBFB] mb-8">
                <Image
                  src={product.images?.[0] || '/images/placeholder.jpg'}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                />
                {/* 标签：如有需要可开启 */}
                {product.isNew && (
                  <span className="absolute top-4 left-4 text-[9px] font-bold tracking-tighter uppercase bg-black text-white px-2 py-1">
                    New
                  </span>
                )}
              </div>
              
              {/* 文字详情：纯黑、放大 [11px] */}
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

      {/* 底部加载触发点 & 状态提示 */}
      <div ref={observerTarget} className="mt-32 py-12 text-center border-t border-black/5">
        {loading && (
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-black animate-pulse">
            Loading...
          </p>
        )}
        {!hasMore && products.length > 0 && (
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-black/20">
            End of Line
          </p>
        )}
        {error && (
          <button 
            onClick={() => loadMore()}
            className="text-[10px] font-bold uppercase tracking-widest border-b border-black pb-1"
          >
            Retry Loading
          </button>
        )}
      </div>
    </div>
  );
}