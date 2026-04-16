'use client';

import { create } from 'zustand';

/**
 * WishlistStore
 * 目标：实现点击爱心黑白切换（Toggle）的完美同步
 */

interface WishlistState {
  wishlistIds: string[]; 
  isLoading: boolean;
  isInitialFetched: boolean; 
  fetchWishlistIds: (force?: boolean) => Promise<string[]>; 
  toggleWishlist: (variantId: string) => Promise<void>;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistIds: [],
  isLoading: false,
  isInitialFetched: false,

  // 1. 获取并清洗 ID 列表
  fetchWishlistIds: async (force = false) => {
    if (get().isInitialFetched && !force) return get().wishlistIds;

    set({ isLoading: true });
    try {
      const res = await fetch('/api/wishlist?full=false', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json(); 
        
        // 🌟 核心点：统一提炼 ID 字符串，确保 includes() 判定 100% 准确
        const ids = Array.isArray(data) 
          ? data.map((item: any) => {
              if (typeof item === 'string') return item;
              return item.variant_id || item.id || "";
            }).filter(Boolean)
          : [];

        set({ wishlistIds: ids, isInitialFetched: true });
        return ids;
      }
      return [];
    } catch (error) {
      console.error("Fetch Error:", error);
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  // 2. 实现黑白切换的核心逻辑
  toggleWishlist: async (variantId: string) => {
    if (!variantId) return;

    const previousIds = get().wishlistIds;
    const targetId = String(variantId); // 强制转字符串，防止类型不匹配
    
    // 🌟 判断当前是否已在收藏夹中
    const isLiked = previousIds.includes(targetId);

    // --- 步骤 A: 乐观更新 (让 UI 瞬间变色) ---
    // 如果已收藏 -> 过滤掉它 (变白)
    // 如果未收藏 -> 加上它 (变黑)
    const newIds = isLiked 
      ? previousIds.filter(id => id !== targetId) 
      : [...previousIds, targetId];
    
    set({ wishlistIds: newIds });

    // --- 步骤 B: 后端同步 ---
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId: targetId }) 
      });

      if (!res.ok) {
        // 如果后端报错（比如没登录），把爱心颜色退回点击前的样子
        set({ wishlistIds: previousIds }); 
        if (res.status === 401) alert("Please sign in to save items.");
      }
    } catch (error) {
      set({ wishlistIds: previousIds }); // 网络错误回滚
      console.error("Toggle Error:", error);
    }
  },

  clearWishlist: () => set({ wishlistIds: [], isInitialFetched: false })
}));