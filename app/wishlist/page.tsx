"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Heart, Trash2, ShoppingBag } from "lucide-react";
// 1. 引入 Store
import { useWishlistStore } from "@/lib/store/useWishlistStore";

interface Product {
  id: string;        // 🌟 此时 ID 已经是 Variant ID 了
  name: string;
  price: number;
  image: string;
  href: string;
  slug: string;
  color?: string;    // 🌟 增加颜色显示
}

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 2. 从 Store 获取同步方法
  // 注意：确保你的 useWishlistStore 内部逻辑也改成了处理 variantId
  const { toggleWishlist, fetchWishlistIds } = useWishlistStore();

  // 获取心愿单详情数据
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      // 请求你刚刚写好的 GET 接口（带上 full=true 参数获取详情）
      const response = await fetch("/api/wishlist?full=true");
      
      if (!response.ok) {
        if (response.status === 401) return; 
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch wishlist");
      }

      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Loading error:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  // 3. 处理删除逻辑
  const handleRemove = async (variantId: string) => {
    // 🌟 调用 Store：注意参数现在是 variantId
    await toggleWishlist(variantId);
    
    // 立即更新本地 UI
    setProducts((prev) => prev.filter((p) => p.id !== variantId));
    toast.success("Item removed");
  };

  useEffect(() => {
    fetchWishlist();
    // 更新 Store 里的 ID 列表
    fetchWishlistIds();
  }, [fetchWishlistIds]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-gray-200" />
        <p className="text-gray-400 font-light tracking-widest uppercase text-xs">Loading Selection...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-40 text-center bg-white">
        <div className="mb-6 flex justify-center">
          <Heart className="w-12 h-12 text-gray-100 font-light" />
        </div>
        <h2 className="text-xl font-serif mb-4 uppercase tracking-[0.2em]">Empty Wishlist</h2>
        <p className="text-gray-400 mb-8 font-light text-[10px] uppercase tracking-widest">Your curated collection is waiting.</p>
        <Link 
          href="/" 
          className="inline-block border border-black text-black px-12 py-3 uppercase text-[10px] tracking-[0.3em] hover:bg-black hover:text-white transition-all duration-500"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-6 py-20">
        <header className="mb-20 text-center">
          <h1 className="text-2xl font-serif mb-4 tracking-[0.3em] uppercase">My Wishlist</h1>
          <div className="w-10 h-[1px] bg-black mx-auto mb-4"></div>
          <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400">{products.length} Selected Items</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16">
          {products.map((product) => (
            <div key={product.id} className="group relative flex flex-col">
              {/* 商品图片 */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#fbfbfb] mb-6">
                <Link href={product.href}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </Link>
                {/* 删除按钮 */}
                <button 
                  onClick={() => handleRemove(product.id)}
                  className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5 stroke-[1.2px]" />
                </button>
              </div>

              {/* 商品信息 */}
              <div className="text-center flex flex-col flex-grow">
                <Link href={product.href}>
                  <h3 className="text-[10px] font-medium text-gray-900 mb-1 uppercase tracking-[0.2em] line-clamp-1 hover:text-gray-500 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                {/* 🌟 增加颜色展示，增加精致感 */}
                <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-2">{product.color}</p>
                
                <p className="text-[11px] text-gray-500 font-light mb-8 tracking-widest">
                  CNY {product.price?.toLocaleString() || '0'}
                </p>
                
                <button className="w-full flex items-center justify-center gap-3 py-3.5 bg-black text-white text-[9px] uppercase tracking-[0.3em] hover:bg-[#111] transition-all duration-500">
                  <ShoppingBag className="w-3 h-3 stroke-[1.5px]" />
                  Add To Bag
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}