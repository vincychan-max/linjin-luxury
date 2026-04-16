'use client';

import { useCart } from '@/lib/cartStore';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// ✅ 关键：使用 export default 确保 layout.tsx 能正确引入
export default function CartDrawer() {
  const { cart, isOpen, closeCart, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const router = useRouter();

  // 控制身体滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={closeCart}
      />
      
      {/* 侧边内容 */}
      <div className="relative h-full w-full max-w-[450px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        
        {/* 头部 */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} strokeWidth={1.5} className="text-black" />
            <h2 className="text-[13px] uppercase tracking-[0.3em] font-medium text-black">Shopping Bag</h2>
          </div>
          <button 
            onClick={closeCart} 
            className="p-2 -mr-2 text-black hover:rotate-90 transition-transform duration-300"
          >
            <X size={24} strokeWidth={1} />
          </button>
        </div>

        {/* 商品列表 */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar bg-white text-black">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Your bag is empty</p>
              <button 
                onClick={closeCart}
                className="text-[10px] uppercase tracking-[0.2em] underline underline-offset-8 decoration-gray-200 hover:decoration-black transition-all"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="h-32 w-24 flex-shrink-0 bg-gray-50 overflow-hidden border border-gray-100">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                  
                  <div className="flex flex-1 flex-col py-1">
                    <div className="flex justify-between items-start">
                      <div className="max-w-[180px]">
                        <h3 className="text-[12px] font-medium uppercase tracking-wider mb-1 leading-tight">{item.name}</h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                          {item.color} / {item.size}
                        </p>
                      </div>
                      <p className="text-[12px] font-medium">USD {item.price}</p>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center border border-gray-200">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-50 text-black"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-[11px] min-w-[30px] text-center font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-50 text-black"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-[10px] text-gray-400 hover:text-black uppercase tracking-widest underline underline-offset-4 decoration-gray-200 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部结算 */}
        {cart.length > 0 && (
          <div className="px-8 py-8 border-t border-gray-100 bg-white space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-medium">Subtotal</span>
              <span className="text-xl font-light tracking-wider text-black">
                USD {getTotalPrice().toLocaleString()}
              </span>
            </div>
            
            <p className="text-[10px] text-gray-400 italic text-center leading-relaxed">
              Shipping and taxes calculated at checkout. <br/>
              Complimentary signature packaging included.
            </p>

            <button 
              onClick={() => {
                closeCart();
                router.push('/cart');
              }}
              className="w-full bg-black text-white py-5 text-[12px] uppercase tracking-[0.3em] font-medium hover:bg-zinc-800 transition-all duration-300 active:scale-[0.98]"
            >
              Continue to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}