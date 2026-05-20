"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Heart, Trash2, ShoppingBag } from "lucide-react";
import { useWishlistStore } from "@/lib/store/useWishlistStore";

export default function WishlistPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleWishlist, fetchWishlistIds } = useWishlistStore();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/wishlist?full=true");
      if (!response.ok) throw new Error("Failed to fetch wishlist");

      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Loading error:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (variantId: string) => {
    await toggleWishlist(variantId);
    setProducts((prev) => prev.filter((p) => p.id !== variantId));
    toast.success("Item removed");
  };

  useEffect(() => {
    fetchWishlist();
    fetchWishlistIds();
  }, [fetchWishlistIds]);

  /**
   * 💡 智能路由映射逻辑
   * 如果数据库原始路径包含 'limited'，则映射到 /limited/
   * 否则，默认映射到 /product/
   */
  const getSmartHref = (rawHref: string) => {
    if (!rawHref) return "#";
    
    // 1. 获取 Slug：取路径最后一段，并去掉查询参数
    const segments = rawHref.split('/');
    const slug = segments[segments.length - 1].split('?')[0];
    
    // 2. 智能判断：检测原始路径是否含有 'limited' 关键词
    if (rawHref.includes('/limited/')) {
        return `/limited/${slug}`;
    }
    
    // 3. 默认返回 product 路径
    return `/product/${slug}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-gray-200" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-6 py-20">
        <header className="mb-20 text-center">
          <h1 className="text-2xl font-serif mb-4 tracking-[0.3em] uppercase">My Wishlist</h1>
          <p className="text-[9px] uppercase tracking-[0.4em] text-gray-400">{products.length} Selected Items</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16">
          {products.map((p) => {
            const price = p.price || p.amount || 0;
            const imageUrl = p.image || p.imageUrl || p.image_url || "/images/placeholder.jpg";
            const name = p.name || "Untitled Product";
            
            // 使用智能路由逻辑
            const validHref = getSmartHref(p.href || p.slug || "");

            return (
              <div key={p.id} className="group relative flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#fbfbfb] mb-6">
                  <Link href={validHref}>
                    <Image
                      src={imageUrl}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                    />
                  </Link>
                  <button 
                    onClick={() => handleRemove(p.id)}
                    className="absolute top-4 right-4 p-2 bg-white/80 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-center">
                  <Link href={validHref}>
                    <h3 className="text-[10px] font-medium text-gray-900 mb-1 uppercase tracking-[0.2em] hover:text-gray-500 transition-colors">
                      {name}
                    </h3>
                  </Link>
                  <p className="text-[11px] text-gray-500 font-light mb-8 tracking-widest">
                    ${Number(price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <button className="w-full py-3.5 bg-black text-white text-[9px] uppercase tracking-[0.3em] hover:bg-[#111] transition-all duration-500">
                    <ShoppingBag className="w-3 h-3 inline mr-2" />
                    Add To Bag
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}