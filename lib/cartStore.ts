// lib/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string;          // product_id (string 更灵活)
  name: string;
  price: number;       // 改为 number，避免解析错误
  image: string;
  color: string;
  size: string;        // 或 'One Size'
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (id: string, color: string, size: string, delta: number) => void; // 支持增减
  setQuantity: (id: string, color: string, size: string, quantity: number) => void;
  removeItem: (id: string, color: string, size: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.id === newItem.id &&
              i.color === newItem.color &&
              i.size === newItem.size
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === newItem.id && i.color === newItem.color && i.size === newItem.size
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }

          return { items: [...state.items, { ...newItem, quantity: 1 }] };
        }),

      updateQuantity: (id, color, size, delta) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.color === color && i.size === size
              ? { ...i, quantity: Math.max(1, i.quantity + delta) }
              : i
          ),
        })),

      setQuantity: (id, color, size, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter(
                (i) => !(i.id === id && i.color === color && i.size === size)
              )
            : state.items.map((i) =>
                i.id === id && i.color === color && i.size === size
                  ? { ...i, quantity }
                  : i
              ),
        })),

      removeItem: (id, color, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.id === id && i.color === color && i.size === size)
          ),
        })),

      clearCart: () => set({ items: [] }),

      getTotalPrice: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'cart-storage', // localStorage key
    }
  )
);