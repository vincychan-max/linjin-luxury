'use client';

import { create } from 'zustand';

/**
 * WishlistStore 核心大脑
 * 已适配最新的 Toggle POST 接口
 */

interface WishlistState {
  wishlistIds: string[];
  isLoading: boolean;
  fetchWishlistIds: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistIds: [],
  isLoading: false,

  // 1. 初始化：拉取收藏 ID 列表
  fetchWishlistIds: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const ids = await res.json(); 
        // 注意：新版接口直接返回 [id1, id2]，不再需要 .map(p => p.id)
        set({ wishlistIds: Array.isArray(ids) ? ids : [] });
      }
    } catch (error) {
      console.error("Failed to sync wishlist ids:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // 2. 核心交互：添加或删除
  toggleWishlist: async (productId: string) => {
    const { wishlistIds } = get();
    const isLiked = wishlistIds.includes(productId);

    // --- 步骤 A: 乐观更新 (Optimistic Update) ---
    // 立即让 UI 变色，给用户丝滑的操作感
    const newIds = isLiked 
      ? wishlistIds.filter(id => id !== productId) 
      : [...wishlistIds, productId];
    
    set({ wishlistIds: newIds });

    // --- 步骤 B: 后端同步 ---
    try {
      // 统一使用 POST 请求，让后端逻辑去处理 toggle
      const res = await fetch('/api/wishlist', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });

      if (!res.ok) {
        // 如果后端返回错误（比如 401），回滚 UI
        set({ wishlistIds }); 
        if (res.status === 401) {
          // 这里可以改成你的 toast 提示
          console.warn("User not logged in");
        }
      }
      // 成功则保持现状，不需要重新 fetch，减少网络请求
    } catch (error) {
      // 网络异常，回滚 UI
      set({ wishlistIds });
      console.error("Wishlist sync error:", error);
    }
  },

  clearWishlist: () => set({ wishlistIds: [] })
}));