'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronDown, Search, Heart } from 'lucide-react';
// 1. 引入全局 Store
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { toast } from 'sonner';

export default function ProductListClient({ 
  initialProducts, 
  gender, 
  category, 
  subCategory,
  collectionTitle, 
  collectionDescription, 
  collectionBackgroundImageUrl, 
  subCategoriesList 
}: any) {
  
  // --- 状态管理 ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');
  const [productImageIndexes, setProductImageIndexes] = useState<{[key: string]: number}>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // 2. 从 Store 获取状态和方法
  const { wishlistIds, toggleWishlist, fetchWishlistIds } = useWishlistStore();

  // 3. 页面挂载时同步数据库状态
  useEffect(() => {
    fetchWishlistIds();
  }, [fetchWishlistIds]); 

  // --- 处理收藏点击 ---
  const handleWishlistToggle = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wasLiked = wishlistIds.includes(productId);

    try {
      await toggleWishlist(productId);
      
      if (!wasLiked) {
        toast.success("Added to favorites", {
          style: { fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }
        });
      }
    } catch (error) {
      console.error("Wishlist toggle failed:", error);
      toast.error("Action failed, please try again");
    }
  };

  // --- 实时搜索与排序逻辑 ---
  const finalProducts = useMemo(() => {
    if (!initialProducts) return [];
    
    // ✅ 【修正点】：这里改为 const，修复 Vercel 编译报错
    const list = [...initialProducts].filter((p: any) => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortOrder === 'asc') {
      list.sort((a: any, b: any) => a.price - b.price);
    } else if (sortOrder === 'desc') {
      list.sort((a: any, b: any) => b.price - a.price);
    }

    return list;
  }, [initialProducts, searchTerm, sortOrder]);

  // --- 交互辅助函数 ---
  const handleImgStep = (e: React.MouseEvent, productId: string, dir: 'prev' | 'next', max: number) => {
    e.preventDefault();
    e.stopPropagation();
    setProductImageIndexes(prev => {
      const curr = prev[productId] || 0;
      let next = dir === 'next' ? curr + 1 : curr - 1;
      if (next >= max) next = 0;
      if (next < 0) next = max - 1;
      return { ...prev, [productId]: next };
    });
  };

  const scrollNav = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      scrollRef.current.scrollBy({ 
        left: direction === 'left' ? -clientWidth / 1.5 : clientWidth / 1.5, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-light">
      {/* 英雄背景 */}
      <div className="relative h-[65vh] w-full flex items-center justify-center bg-zinc-900 overflow-hidden">
        {collectionBackgroundImageUrl && (
          <img 
            src={collectionBackgroundImageUrl} 
            className="absolute inset-0 w-full h-full object-cover opacity-60" 
            alt="" 
          />
        )}
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-4xl md:text-7xl font-extralight uppercase tracking-[0.5em]">{collectionTitle}</h1>
          <p className="mt-8 text-[10px] uppercase tracking-[0.3em] opacity-80 max-w-xl mx-auto leading-loose">{collectionDescription}</p>
        </div>
      </div>

      {/* 导航条 */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-zinc-100 flex items-center justify-center">
        <button onClick={() => scrollNav('left')} className="p-4 text-zinc-400 hover:text-black"><ChevronLeft size={20}/></button>
        <div ref={scrollRef} className="flex gap-10 py-7 overflow-x-auto no-scrollbar scroll-smooth px-4 snap-x snap-mandatory">
          {subCategoriesList?.map((item: any) => (
            <Link 
              key={item.slug} 
              href={`/${gender}/${category}/${item.slug}`} 
              className={`text-[10px] uppercase tracking-[0.2em] whitespace-nowrap transition-all snap-center ${
                subCategory === item.slug ? 'text-black font-bold border-b border-black pb-1' : 'text-zinc-400 hover:text-black'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <button onClick={() => scrollNav('right')} className="p-4 text-zinc-400 hover:text-black"><ChevronRight size={20}/></button>
      </nav>

      {/* 搜索控制区 */}
      <div className="max-w-[1536px] mx-auto px-12 py-10 flex flex-wrap md:flex-nowrap justify-between items-center border-b border-zinc-50 gap-6">
        <div className="relative flex-1 max-w-sm group">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-black" />
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="SEARCH SELECTION..." 
            className="w-full pl-8 py-2 bg-transparent text-[10px] uppercase tracking-[0.2em] outline-none border-b border-transparent focus:border-zinc-200" 
          />
        </div>

        <div className="flex items-center gap-10">
          <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 italic">{finalProducts.length} Items</span>
          <div className="relative">
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
              SORT <ChevronDown size={12} className={isFilterOpen ? 'rotate-180' : ''} />
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 mt-5 w-48 bg-white border border-zinc-100 shadow-2xl z-50 py-2">
                <button onClick={() => {setSortOrder('asc'); setIsFilterOpen(false)}} className="w-full text-left px-6 py-3 text-[10px] uppercase tracking-widest hover:bg-zinc-50">Price: Low to High</button>
                <button onClick={() => {setSortOrder('desc'); setIsFilterOpen(false)}} className="w-full text-left px-6 py-3 text-[10px] uppercase tracking-widest hover:bg-zinc-50">Price: High to Low</button>
                <button onClick={() => {setSortOrder('default'); setIsFilterOpen(false)}} className="w-full text-left px-6 py-3 text-[10px] uppercase tracking-widest text-zinc-300 hover:bg-zinc-50">Reset</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 产品网格 */}
      <main className="max-w-[1536px] mx-auto px-12 py-20" onClick={() => setIsFilterOpen(false)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-24">
          {finalProducts.map((p: any) => {
            const currentIdx = productImageIndexes[p.id] || 0;
            const isLiked = wishlistIds.includes(p.id);

            return (
              <div key={p.id} className="group relative flex flex-col">
                <div className="relative aspect-[3/4] bg-[#fcfcfc] overflow-hidden">
                  <Link href={`/${gender}/${category}/${subCategory}/${p.slug}`}>
                    <img 
                      src={p.images[currentIdx]?.url || '/placeholder.jpg'} 
                      className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105" 
                      alt={p.name} 
                    />
                  </Link>

                  {/* 收藏按钮 */}
                  <button 
                    onClick={(e) => handleWishlistToggle(e, p.id)} 
                    className={`absolute top-5 right-5 z-40 p-3 transition-all duration-500 hover:scale-110 ${
                      isLiked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Heart 
                      fill={isLiked ? "#000" : "none"} 
                      size={18} 
                      strokeWidth={isLiked ? 0 : 0.8} 
                      className={isLiked ? "text-black" : "text-zinc-400"} 
                    />
                  </button>

                  {p.images.length > 1 && (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => handleImgStep(e, p.id, 'prev', p.images.length)} className="p-2 bg-white/90 rounded-full shadow-sm"><ChevronLeft size={14}/></button>
                      <button onClick={(e) => handleImgStep(e, p.id, 'next', p.images.length)} className="p-2 bg-white/90 rounded-full shadow-sm"><ChevronRight size={14}/></button>
                    </div>
                  )}
                </div>
                
                <div className="mt-8 text-center px-4">
                  <h3 className="text-[10px] uppercase tracking-[0.25em] text-zinc-800 truncate leading-relaxed">{p.name}</h3>
                  <p className="text-[11px] text-zinc-500 font-light tracking-[0.2em] mt-3">
                    USD {p.price?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}