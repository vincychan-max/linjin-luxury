import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  variantId: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  isOpen: boolean; // ✨ 添加 UI 状态
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  // ✨ 添加控制函数
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      isOpen: false, // ✨ 默认关闭

      addToCart: (item) => {
        const currentCart = get().cart;
        const existingItem = currentCart.find((i) => i.id === item.id);

        if (existingItem) {
          set({
            cart: currentCart.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({ cart: [...currentCart, item] });
        }
      },

      removeFromCart: (id) => {
        set({ cart: get().cart.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set({
          cart: get().cart.map((i) => (i.id === id ? { ...i, quantity } : i)),
        });
      },

      clearCart: () => set({ cart: [] }),

      getTotalPrice: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      // ✨ UI 控制逻辑实现
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
    }),
    {
      name: 'cart-storage',
      // 这里的关键：不要持久化 isOpen，否则用户刷新页面后抽屉可能还会弹出来
      partialize: (state) => ({ cart: state.cart }), 
    }
  )
);