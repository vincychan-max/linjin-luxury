'use client';

import { useState, useRef, useMemo, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronDown, Search, Heart, Loader2 } from 'lucide-react';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'sonner';

// --- 类型定义 ---
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  defaultVariantId: string;
  images?: { url: string }[];
  variants?: { images: { url: string }[] }[];
}

interface SubCategory {
  name: string;
  slug: string;
}

interface ProductListProps {
  initialProducts: Product[];
  gender: string;
  category: string;
  subCategory: string; // ✨ 修复点 1：在这里添加 subCategory 定义
  collectionTitle?: string;
  collectionDescription?: string;
  collectionBackgroundImageUrl?: string;
  subCategoriesList?: SubCategory[];
}

// --- 子组件：ProductCard (性能优化核心) ---
const ProductCard = memo(({ 
  product, 
  isLiked, 
  isUpdating, 
  onToggle, 
  priority 
}: { 
  product: Product; 
  isLiked: boolean; 
  isUpdating: boolean; 
  onToggle: (e: React.MouseEvent, id: string) => void;
  priority: boolean;
}) => {
  const blurData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+ZNPQAIXQM497u7QwAAAABJRU5ErkJggg==";
  
  const mainImg = product.variants?.[0]?.images?.[0]?.url || product.images?.[0]?.url || '/placeholder.jpg';
  const hoverImg = product.variants?.[0]?.images?.[1]?.url || mainImg;

  return (
    <div className="group flex flex-col">
      <div className="relative aspect-[4/5] bg-[#F7F7F7] overflow-hidden">
        <Link href={`/product/${product.slug}`}>
          <div className="absolute inset-0">
            <Image 
              src={mainImg} 
              alt={product.name}
              fill
              className="object-cover transition-opacity duration-1000 group-hover:opacity-0"
              placeholder="blur"
              blurDataURL={blurData}
              priority={priority} 
            />
            <Image 
              src={hoverImg} 
              alt={product.name}
              fill
              loading="lazy"
              className="object-cover absolute inset-0 opacity-0 transition-all duration-1000 group-hover:opacity-100 group-hover:scale-105"
            />
          </div>
        </Link>

        <button 
          onClick={(e) => onToggle(e, product.defaultVariantId)} 
          disabled={isUpdating}
          className="absolute top-4 right-4 z-40 p-2 md:opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-wait"
        >
          {isUpdating ? (
            <Loader2 size={16} className="animate-spin text-zinc-400" />
          ) : (
            <Heart 
              fill={isLiked ? "#000" : "none"} 
              size={16} 
              strokeWidth={1} 
              className={isLiked ? "text-black" : "text-zinc-500 hover:text-black"} 
            />
          )}
        </button>
      </div>
      
      <div className="mt-6 flex flex-col items-center">
        <h3 className="text-[10px] uppercase tracking-[0.25em] mb-2 text-center group-hover:text-zinc-500 transition-colors">
          {product.name}
        </h3>
        <p className="text-[10px] text-zinc-400 font-light tracking-[0.15em]">
          ${product.price?.toLocaleString()}
        </p>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

// --- 主组件 ---
export default function ProductListClient({ 
  initialProducts, 
  gender, 
  category, 
  subCategory, // ✨ 修复点 2：在解构参数中接收 subCategory
  collectionTitle, 
  collectionDescription, 
  collectionBackgroundImageUrl, 
  subCategoriesList 
}: ProductListProps) {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});
  const [localWishlist, setLocalWishlist] = useState<string[]>([]);
  
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const { wishlistIds, toggleWishlist, fetchWishlistIds } = useWishlistStore(
    useShallow((state) => ({
      wishlistIds: state.wishlistIds,
      toggleWishlist: state.toggleWishlist,
      fetchWishlistIds: state.fetchWishlistIds,
    }))
  );

  // 同步 Store 到本地状态
  useEffect(() => {
    setLocalWishlist(wishlistIds);
  }, [wishlistIds]);

  // 初始化获取
  useEffect(() => {
    fetchWishlistIds();
  }, [fetchWishlistIds]);

  // 搜索防抖
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 修复全局点击：使用 ref 准确判断
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWishlistToggle = useCallback(async (e: React.MouseEvent, variantId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!variantId || updatingIds[variantId]) return;

    const isCurrentlyLiked = localWishlist.includes(variantId);

    setLocalWishlist(prev => 
      isCurrentlyLiked ? prev.filter(id => id !== variantId) : [...prev, variantId]
    );
    setUpdatingIds(prev => ({ ...prev, [variantId]: true }));

    try {
      await toggleWishlist(variantId);
      if (!isCurrentlyLiked) {
        toast.success("ADDED TO FAVORITES", {
          style: { fontSize: '10px', letterSpacing: '0.1em', borderRadius: '0' }
        });
      }
    } catch (error) {
      toast.error("ACTION FAILED");
      const freshIds = await fetchWishlistIds(); 
      if (freshIds) setLocalWishlist(freshIds);
    } finally {
      setUpdatingIds(prev => {
        const newState = { ...prev };
        delete newState[variantId];
        return newState;
      });
    }
  }, [localWishlist, updatingIds, toggleWishlist, fetchWishlistIds]);

  const finalProducts = useMemo(() => {
    if (!initialProducts) return [];
    let list = initialProducts.filter((p) => 
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    if (sortOrder === 'asc') {
      list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOrder === 'desc') {
      list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    return list;
  }, [initialProducts, debouncedSearch, sortOrder]);

  const scrollNav = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      scrollRef.current.scrollBy({ 
        left: direction === 'left' ? -clientWidth / 1.5 : clientWidth / 1.5, 
        behavior: 'smooth' 
      });
    }
  };

  const blurData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+ZNPQAIXQM497u7QwAAAABJRU5ErkJggg==";

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-light">
      
      {/* 1. Banner */}
      <div className="relative h-[65vh] w-full flex items-center justify-center bg-zinc-900 overflow-hidden">
        {collectionBackgroundImageUrl && (
          <Image 
            src={collectionBackgroundImageUrl} 
            alt={collectionTitle || "Collection"}
            fill
            priority
            className="object-cover opacity-50 scale-105"
            placeholder="blur"
            blurDataURL={blurData}
          />
        )}
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-3xl md:text-6xl font-extralight uppercase tracking-[0.6em] mb-6 animate-in fade-in duration-1000">
            {collectionTitle}
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-80 max-w-lg mx-auto leading-relaxed">
            {collectionDescription}
          </p>
        </div>
      </div>

      {/* 2. Sub-Category Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 flex items-center justify-center">
        <button onClick={() => scrollNav('left')} className="p-4 text-zinc-400 hover:text-black transition-colors"><ChevronLeft size={18}/></button>
        <div ref={scrollRef} className="flex gap-10 py-6 overflow-x-auto no-scrollbar scroll-smooth px-4">
          {subCategoriesList?.map((item) => {
            const href = `/${gender}/${category}/${item.slug}`.toLowerCase();
            const isActive = pathname === href;
            return (
              <Link key={item.slug} href={href} className={`text-[9px] uppercase tracking-[0.25em] relative py-1 ${isActive ? 'text-black font-medium' : 'text-zinc-400 hover:text-black'}`}>
                {item.name}
                {isActive && <span className="absolute bottom-0 left-0 w-full h-[1px] bg-black" />}
              </Link>
            );
          })}
        </div>
        <button onClick={() => scrollNav('right')} className="p-4 text-zinc-400 hover:text-black transition-colors"><ChevronRight size={18}/></button>
      </nav>

      {/* 3. Filter/Sort Bar */}
      <div className="max-w-[1600px] mx-auto px-8 md:px-16 py-8 flex justify-between items-center border-b border-zinc-50">
        <div className="relative group min-w-[200px]">
          <Search size={12} className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="FILTER BY NAME..." 
            className="w-full pl-6 py-2 bg-transparent text-[9px] uppercase tracking-[0.2em] outline-none" 
          />
        </div>

        <div className="flex items-center gap-12">
          <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-300 font-normal">{finalProducts.length} Results</span>
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)} 
              className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-medium"
            >
              Sort By <ChevronDown size={12} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 mt-4 w-44 bg-white border border-zinc-100 shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                <button onClick={() => {setSortOrder('asc'); setIsFilterOpen(false)}} className="w-full text-left px-5 py-3 text-[9px] uppercase tracking-widest hover:bg-zinc-50">Price: Low to High</button>
                <button onClick={() => {setSortOrder('desc'); setIsFilterOpen(false)}} className="w-full text-left px-5 py-3 text-[9px] uppercase tracking-widest hover:bg-zinc-50">Price: High to Low</button>
                <button onClick={() => {setSortOrder('default'); setIsFilterOpen(false)}} className="w-full text-left px-5 py-3 text-[9px] uppercase tracking-widest text-zinc-400 hover:bg-zinc-50 border-t border-zinc-50">Reset</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Product Grid */}
      <main className="max-w-[1600px] mx-auto px-8 md:px-16 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
          {finalProducts.map((p, index) => (
            <ProductCard 
              key={p.id}
              product={p}
              isLiked={localWishlist.includes(p.defaultVariantId)}
              isUpdating={!!updatingIds[p.defaultVariantId]}
              onToggle={handleWishlistToggle}
              priority={index < 2}
            />
          ))}
        </div>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}