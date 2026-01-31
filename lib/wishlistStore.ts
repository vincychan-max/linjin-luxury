import { create } from 'zustand';

type Product = {
  id: number;          // 或 string，根据你的产品 ID 类型（如果 Firebase 用 string，改成 string）
  name: string;
  price: string;       // 或 number，根据实际
  image: string;
  color?: string;      // 可选：收藏时可能有颜色/尺寸
  size?: string;
  // 根据需要加其他字段（如 product_id 如果和 id 分开）
};

type WishlistStore = {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: number) => void;
  toggleWishlist: (product: Product) => void;
  setWishlist: (items: Product[]) => void;      // ← 新增：用于 Firebase 实时同步覆盖
  clearWishlist: () => void;                    // ← 新增：可选，登出时清空
};

export const useWishlist = create<WishlistStore>((set, get) => ({
  wishlist: [],
  addToWishlist: (product) =>
    set((state) => ({
      wishlist: [...state.wishlist, product],
    })),
  removeFromWishlist: (id) =>
    set((state) => ({
      wishlist: state.wishlist.filter((item) => item.id !== id),
    })),
  toggleWishlist: (product) => {
    const state = get();
    const exists = state.wishlist.some((item) => item.id === product.id);
    if (exists) {
      get().removeFromWishlist(product.id);
    } else {
      get().addToWishlist(product);
    }
  },
  setWishlist: (items) => set({ wishlist: items }),  // ← 直接覆盖 wishlist（用于实时同步）
  clearWishlist: () => set({ wishlist: [] }),
}));