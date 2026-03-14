import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  loading: boolean;
  isOpen: boolean; // 控制购物车侧边栏显示/隐藏

  // UI 方法
  openCart: () => void;
  closeCart: () => void;

  // 数据方法
  fetchCart: (userId: string) => Promise<void>;
  addToCart: (item: CartItem, userId?: string) => Promise<void>;
  removeFromCart: (id: string, userId?: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number, userId?: string) => Promise<void>;
  syncLocalCartWithServer: (userId: string) => Promise<void>;
  
  // 辅助计算
  getTotalPrice: () => number;
  getTotalItems: () => number;
  clearCart: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      loading: false,
      isOpen: false, // 默认关闭

      // 1. UI 控制方法
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      // 2. 从服务器获取购物车
      fetchCart: async (userId: string) => {
        set({ loading: true });
        try {
          const res = await fetch(`/api/cart?userId=${userId}`);
          if (res.ok) {
            const data = await res.json();
            set({ cart: data });
          }
        } catch (error) {
          console.error('Fetch cart error:', error);
        } finally {
          set({ loading: false });
        }
      },

      // 3. 添加到购物车
      addToCart: async (item: CartItem, userId?: string) => {
        const currentCart = get().cart;
        const existingItem = currentCart.find((i) => i.id === item.id);
        
        let newCart;
        if (existingItem) {
          newCart = currentCart.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          newCart = [...currentCart, { ...item, quantity: 1 }];
        }
        
        set({ cart: newCart });

        // 如果已登录，同步到数据库
        if (userId) {
          try {
            await fetch('/api/cart', {
              method: 'POST',
              body: JSON.stringify({ action: 'add', item, userId }),
            });
          } catch (error) {
            console.error('Database sync error:', error);
          }
        }
      },

      // 4. 更新数量
      updateQuantity: async (id: string, quantity: number, userId?: string) => {
        if (quantity < 1) return;
        
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));

        if (userId) {
          await fetch('/api/cart', {
            method: 'POST',
            body: JSON.stringify({ action: 'update', id, quantity, userId }),
          });
        }
      },

      // 5. 删除商品
      removeFromCart: async (id: string, userId?: string) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        }));

        if (userId) {
          await fetch('/api/cart', {
            method: 'DELETE',
            body: JSON.stringify({ id, userId }),
          });
        }
      },

      // 6. 登录后同步本地数据
      syncLocalCartWithServer: async (userId: string) => {
        const localCart = get().cart;
        if (localCart.length === 0) {
          await get().fetchCart(userId);
          return;
        }

        try {
          const res = await fetch('/api/cart', {
            method: 'POST',
            body: JSON.stringify({ action: 'sync', cart: localCart, userId }),
          });

          if (res.ok) {
            await get().fetchCart(userId);
          }
        } catch (error) {
          console.error('Sync error:', error);
        }
      },

      // 辅助计算
      getTotalPrice: () => get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getTotalItems: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'shopping-cart-storage',
      // 🚀 关键：只持久化 cart 数组，不持久化 isOpen 和 loading
      partialize: (state) => ({ cart: state.cart }), 
    }
  )
);