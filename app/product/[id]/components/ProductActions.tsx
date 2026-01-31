// app/product/[id]/components/ProductActions.tsx
'use client';

interface ProductActionsProps {
  product: any;
  selectedColor: string;
  selectedSize: string;
  isFavorited: boolean;
  setIsFavorited: (value: boolean) => void;
  addToBag: () => Promise<void>;
  toggleFavorite: () => Promise<void>;
}

export default function ProductActions({
  product,
  selectedColor,
  selectedSize,
  isFavorited,
  setIsFavorited,
  addToBag,
  toggleFavorite,
}: ProductActionsProps) {
  return (
    <>
      {/* 心愿单按钮（右上角心形图标） */}
      <div className="flex justify-end mt-12 mb-8">
        <button
          onClick={toggleFavorite}
          className="transition transform hover:scale-110"
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="60" height="60" viewBox="0 0 24 24" fill={isFavorited ? '#dc2626' : 'none'} stroke={isFavorited ? '#dc2626' : '#1717174d'} strokeWidth="2" className="transition-colors duration-300">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      {/* Add to Bag 按钮 */}
      <button
        onClick={addToBag}
        className="w-full bg-black text-white text-xl md:text-2xl uppercase tracking-widest py-6 md:py-8 transition-transform hover:scale-105"
      >
        Add to Bag
      </button>
    </>
  );
}