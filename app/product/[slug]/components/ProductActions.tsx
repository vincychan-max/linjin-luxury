'use client';

import { Heart, ShoppingBag } from 'lucide-react';

interface ProductActionsProps {
  product: any;
  selectedColor: string;
  selectedSize: string;
  isFavorited: boolean;
  isAdding: boolean;
  addToBag: () => void;
  // buyNow 留着作为 Props 没关系，只要下面不渲染它就行
  buyNow: () => void; 
  toggleFavorite: () => void;
}

export default function ProductActions({
  isAdding,
  addToBag,
  isFavorited,
  toggleFavorite
}: ProductActionsProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 🚀 关键修改：只保留一个按钮，且样式改为黑底白字 */}
      <button
        onClick={addToBag}
        disabled={isAdding}
        // Tailwind 修改：把原本的 border-black 换成 bg-black，text-black 换成 text-white
        className="group w-full bg-black text-white py-6 text-[11px] uppercase tracking-[4px] font-black hover:bg-zinc-800 transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {/* 🚀 样式修改：将图标颜色也设为白色 */}
        <ShoppingBag size={14} strokeWidth={1.5} className="text-white group-hover:scale-110 transition-transform" />
        {isAdding ? 'ADDING...' : 'ADD TO SHOPPING BAG'}
      </button>

      {/* 收藏按钮 (保持简约样式) */}
      <div className="pt-4 flex justify-center">
        <button
          onClick={toggleFavorite}
          className="flex items-center gap-3 group px-6 py-2"
        >
          <div className="relative">
            <Heart 
              size={18} 
              strokeWidth={1} 
              className={`transition-all duration-300 ${isFavorited ? 'fill-black text-black scale-110' : 'text-zinc-400 group-hover:text-black'}`} 
            />
          </div>
          <span className="text-[9px] uppercase tracking-[2px] font-bold text-zinc-400 group-hover:text-black transition-colors">
            {isFavorited ? 'IN YOUR WISHLIST' : 'ADD TO WISHLIST'}
          </span>
        </button>
      </div>

      {/* 底部小提示 */}
      <p className="text-center text-[8px] uppercase tracking-[2px] text-zinc-400 mt-2 font-medium">
        Secure checkout powered by PayPal
      </p>
    </div>
  );
}