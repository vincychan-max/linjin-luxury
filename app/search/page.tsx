'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

// 内部组件：处理搜索逻辑和展示
function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]); // 存放真实的推荐商品
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. 获取搜索结果
  useEffect(() => {
    if (!q.trim()) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProducts(data.results || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError('UNABLE TO RETRIEVE RESULTS AT THIS TIME.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [q]);

  // 2. 自动获取“猜你喜欢”（抓取数据库里前4个商品）
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        // 这里借用你的搜索接口，传一个空字符串或者特定关键词来获取初始商品
        const res = await fetch(`/api/search?q=`); 
        const data = await res.json();
        // 取前4个作为推荐
        setRecommended(data.results?.slice(0, 4) || []);
      } catch (err) {
        console.error("Failed to load recommendations");
      }
    };
    fetchRecommended();
  }, []);

  // “猜你喜欢” UI 模块
  const Recommendations = () => (
    recommended.length > 0 ? (
      <div className="mt-32 border-t border-gray-100 pt-20">
        <h2 className="text-[11px] tracking-[6px] uppercase text-center mb-16 font-light">Recommended For You</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
          {recommended.map((product) => (
            <Link key={product.id} href={`/product/${product.slug}`} className="group block">
              <div className="aspect-[3/4] relative overflow-hidden bg-[#FBFBFB] mb-4">
                <Image
                  src={product.image || '/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                  sizes="25vw"
                />
              </div>
              <p className="text-[9px] tracking-[2px] uppercase text-gray-400 mb-1">{product.category}</p>
              <h3 className="text-[10px] tracking-[1px] uppercase font-light line-clamp-1">{product.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    ) : null
  );

  // 如果没有输入搜索词
  if (!q.trim()) {
    return (
      <div className="max-w-[1440px] mx-auto px-8 py-20 min-h-[80vh]">
        <div className="text-center mb-20">
          <p className="text-[10px] tracking-[8px] uppercase text-gray-400 font-light">Enter search query</p>
        </div>
        <Recommendations />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-12 min-h-screen">
      {/* 极简返回按钮 */}
      <button 
        onClick={() => router.back()}
        className="mb-12 flex items-center gap-2 group text-gray-400 hover:text-black transition-colors"
      >
        <span className="text-lg">←</span>
        <span className="text-[10px] tracking-[3px] uppercase font-light">Back</span>
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-4 border-b border-gray-100 pb-10">
        <div>
          <p className="text-[10px] tracking-[4px] uppercase text-gray-400 mb-2">Search results for</p>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight italic">“{q}”</h1>
        </div>
        <p className="text-[10px] tracking-[2px] uppercase text-gray-500">
          {loading ? 'Discovering...' : `${total} Pieces Found`}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4 animate-pulse">
              <div className="aspect-[3/4] bg-gray-50" />
              <div className="h-2 w-1/3 bg-gray-50" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-20">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="group block">
                <div className="aspect-[3/4] relative overflow-hidden bg-[#FBFBFB] mb-6">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[9px] tracking-[3px] uppercase text-gray-400 mb-2 font-medium">{product.category}</p>
                  <h3 className="text-[11px] md:text-xs tracking-[1px] uppercase font-light line-clamp-1 mb-2">{product.name}</h3>
                  <p className="text-sm font-light text-gray-900">
                     {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <Recommendations />
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-[11px] tracking-[3px] uppercase text-gray-400 italic mb-20">No matching items found.</p>
          <Recommendations />
        </div>
      )}
    </div>
  );
}

// 核心修复：必须有一个 default export 
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SearchResults />
    </Suspense>
  );
}