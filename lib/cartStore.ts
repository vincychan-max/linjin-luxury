import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;           // SKU 格式: product_id|encodedColor|encodedSize
  product_id: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
}

export type AddCartInput = Omit<CartItem, 'id' | 'quantity'>;

interface CartState {
  cart: CartItem[];
  loading: boolean;
  _hasHydrated: boolean;

  getTotalPrice: () => number;
  getTotalItems: () => number;

  fetchCart: (userId: string) => Promise<void>;
  addToCart: (input: AddCartInput, userId?: string) => Promise<void>;
  updateQuantity: (skuId: string, quantity: number, userId?: string) => Promise<void>;
  removeFromCart: (skuId: string, userId?: string) => Promise<void>;
  syncLocalCartWithServer: (userId: string) => Promise<void>;
  clearCart: (userId?: string) => Promise<void>;
  setHasHydrated: (state: boolean) => void;
  setServerCart: (serverCart: CartItem[]) => void;   // 新增：用于 SSR 注入
}

// ==================== 工具函数 ====================
const generateSku = (product_id: string, color: string, size: string): string => {
  return [
    product_id.trim(),
    encodeURIComponent(color.trim()),
    encodeURIComponent(size.trim()),
  ].join('|');
};

const cleanCartData = (data: any): CartItem[] => {
  if (!Array.isArray(data)) return [];
  return data.map((item: any) => ({
    ...item,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 0,
  }));
};

// ==================== Store 实现 ====================
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      loading: false,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      // 新增：专门用于 Server Component 注入初始购物车数据
      setServerCart: (serverCart: CartItem[]) => {
        if (!Array.isArray(serverCart) || serverCart.length === 0) return;
        
        set((state) => ({
          cart: state.cart.length === 0 ? cleanCartData(serverCart) : state.cart,
          _hasHydrated: true,
        }));
      },

      getTotalPrice: () => {
        const cart = get().cart;
        if (!Array.isArray(cart)) return 0;
        const total = cart.reduce((sum, item) => {
          return sum + (Number(item.price) || 0) * (Number(item.quantity) || 0);
        }, 0);
        return Math.round(total * 100) / 100;
      },

      getTotalItems: () => {
        const cart = get().cart;
        if (!Array.isArray(cart)) return 0;
        return cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      },

      fetchCart: async (userId: string) => {
        if (!userId || get().loading) return;
        set({ loading: true });
        try {
          const res = await fetch(`/api/cart?userId=${userId}`);
          if (res.ok) {
            const data = await res.json();
            set({ cart: cleanCartData(data) });
          }
        } catch (e) {
          console.error('Fetch cart failed:', e);
        } finally {
          set({ loading: false });
        }
      },

      addToCart: async (input: AddCartInput, userId?: string) => {
        const skuId = generateSku(input.product_id, input.color, input.size);

        set((state) => {
          const currentCart = Array.isArray(state.cart) ? [...state.cart] : [];
          const existingIndex = currentCart.findIndex((i) => i.id === skuId);

          if (existingIndex > -1) {
            const updatedCart = [...currentCart];
            updatedCart[existingIndex] = {
              ...updatedCart[existingIndex],
              quantity: updatedCart[existingIndex].quantity + 1
            };
            return { cart: updatedCart };
          }
          return { cart: [...currentCart, { ...input, id: skuId, quantity: 1 }] };
        });

        if (userId) {
          try {
            await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'add', item: { ...input, id: skuId }, userId }),
            });
          } catch (e) {
            console.error('Add sync failed:', e);
            await get().fetchCart(userId);
          }
        }
      },

      updateQuantity: async (skuId: string, quantity: number, userId?: string) => {
        if (quantity < 1) return;

        set((state) => ({
          cart: (Array.isArray(state.cart) ? state.cart : []).map((item) =>
            item.id === skuId ? { ...item, quantity } : item
          ),
        }));

        if (userId) {
          try {
            await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'update', id: skuId, quantity, userId }),
            });
          } catch (e) {
            await get().fetchCart(userId);
          }
        }
      },

      removeFromCart: async (skuId: string, userId?: string) => {
        set((state) => ({
          cart: (Array.isArray(state.cart) ? state.cart : []).filter((item) => item.id !== skuId),
        }));

        if (userId) {
          try {
            await fetch('/api/cart', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: skuId, userId }),
            });
          } catch (e) {
            await get().fetchCart(userId);
          }
        }
      },

      syncLocalCartWithServer: async (userId: string) => {
        if (!userId || get().loading) return;
        const currentLocalCart = get().cart;

        if (!Array.isArray(currentLocalCart) || currentLocalCart.length === 0) {
          return await get().fetchCart(userId);
        }

        set({ loading: true });
        try {
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'sync', cart: currentLocalCart, userId }),
          });

          if (res.ok) {
            const finalCart = await res.json();
            set({ cart: cleanCartData(finalCart) });
          } else {
            await get().fetchCart(userId);
          }
        } catch (e) {
          await get().fetchCart(userId);
        } finally {
          set({ loading: false });
        }
      },

      clearCart: async (userId?: string) => {
        const previousCart = [...(get().cart || [])];
        set({ cart: [] });

        if (!userId) return;

        try {
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'clear', userId }),
          });
          if (!res.ok) throw new Error();
        } catch (e) {
          set({ cart: previousCart });
        }
      },
    }),

    {
      name: 'shopping-cart-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cart: state.cart }),
      skipHydration: true,                    // ← 关键修复：跳过自动 hydration

      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          // 防止数据异常
          if (!Array.isArray(state.cart)) {
            state.cart = [];
          }
        }
      },
    }
  )
);