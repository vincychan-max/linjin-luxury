'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { request, gql } from 'graphql-request';
import Image from 'next/image';

// 1. 定义 Hygraph API 配置
const HYGRAPH_ENDPOINT = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT || '';

// 2. 根据你的 Schema 修正 GraphQL 查询
const SEARCH_PRODUCTS_QUERY = gql`
  query SearchProducts($searchTerm: String!) {
    products(where: { name_contains: $searchTerm }) {
      id
      slug
      name
      price
      images {
        url
      }
      subCategories {
        name
      }
    }
  }
`;

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================== 解决滚动条消失导致的页面抖动 ====================
  useEffect(() => {
    // 当处于加载状态或没有搜索词时，我们可以锁定滚动条或保持间距
    const shouldFixScroll = loading || !q.trim();
    
    if (shouldFixScroll) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    } else {
      document.body.style.paddingRight = '0px';
    }

    return () => {
      document.body.style.paddingRight = '0px';
    };
  }, [loading, q]);

  // ==================== 获取 Hygraph 数据 ====================
  useEffect(() => {
    if (!q.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const fetchHygraphProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data: any = await request(HYGRAPH_ENDPOINT, SEARCH_PRODUCTS_QUERY, {
          searchTerm: q,
        });
        setProducts(data.products || []);
      } catch (err: any) {
        console.error('Hygraph 错误详情:', err);
        setError('无法加载搜索结果，请检查 API 配置或网络');
      } finally {
        setLoading(false);
      }
    };

    fetchHygraphProducts();
  }, [q]);

  if (!q.trim()) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-40 text-center">
        <h1 className="text-2xl font-light tracking-[10px] uppercase">Enter Search Keywords</h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      <div className="flex items-baseline justify-between mb-12 border-b border-gray-100 pb-8">
        <h1 className="text-2xl font-light tracking-widest uppercase">
          Results for: <span className="font-normal">“{q}”</span>
        </h1>
        <p className="text-[10px] tracking-[2px] uppercase text-gray-400">
          {loading ? 'Searching...' : `${products.length} Items Found`}
        </p>
      </div>

      {error && (
        <div className="bg-black text-white p-4 text-xs tracking-widest uppercase mb-8">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[3/4] bg-gray-50 animate-pulse rounded-sm" />
              <div className="h-4 w-2/3 bg-gray-50 animate-pulse" />
              <div className="h-4 w-1/3 bg-gray-50 animate-pulse" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.slug}`} className="group">
              <div className="aspect-[3/4] bg-[#f9f9f9] overflow-hidden relative mb-6">
                {product.images?.[0]?.url ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] tracking-widest uppercase text-gray-300">
                    No Image Available
                  </div>
                )}
              </div>
              
              <div className="space-y-2 text-center md:text-left">
                <p className="text-[9px] tracking-[3px] uppercase text-gray-400">
                  {product.subCategories?.[0]?.name || 'Collection'}
                </p>
                <h3 className="text-xs tracking-[1px] uppercase font-light line-clamp-1 group-hover:text-gray-500 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm font-light mt-2">
                  ${Number(product.price).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-40">
          <p className="text-sm tracking-[4px] uppercase text-gray-400">No results found for your search</p>
          <Link href="/" className="inline-block mt-8 text-[10px] tracking-[2px] uppercase border-b border-black pb-1">
            Back to Home
          </Link>
        </div>
      )}
    </div>
  );
}

// 封装 Suspense 以支持 useSearchParams
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SearchResultsContent />
    </Suspense>
  );
}