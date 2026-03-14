'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCart } from '@/lib/cartStore';
import { supabase } from '@/lib/supabase';
import { Truck, Phone, Plus } from 'lucide-react';
import { toast } from 'sonner'; 
import { useRouter } from 'next/navigation';

import { useWishlistStore } from '@/lib/store/useWishlistStore';

import ProductGallery from './components/ProductGallery';
import ProductInfo from './components/ProductInfo';
import ProductOptions from './components/ProductOptions';
import ProductActions from './components/ProductActions';
import { ContactModals } from './components/ContactModals';
import { Recommendations } from './components/Recommendations'; 

interface ProductClientProps {
  product: any;
  recommendedProducts?: any[]; 
}

export default function ProductClient({ product, recommendedProducts = [] }: ProductClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || 'Default');
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'One Size');
  const [isAdding, setIsAdding] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState('Arrives in 3-5 business days'); 
  
  const { wishlistIds, toggleWishlist, fetchWishlistIds } = useWishlistStore();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const { addToCart, openCart } = useCart();

  // --- 1. 所有的 useEffect (必须在 return 之前) ---
  useEffect(() => {
    const initData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      if (authUser) {
        fetchWishlistIds();
      }
      setDeliveryInfo('Arrives in 1-2 business days (Los Angeles)'); 
    };
    initData();
  }, [fetchWishlistIds]);

  // --- 2. 所有的 useMemo ---
  const isLiked = useMemo(() => {
    return wishlistIds.includes(product?.id);
  }, [wishlistIds, product?.id]);

  const currentImages = useMemo(() => {
    const currentColorObj = product?.colors?.find((c: any) => c.name === selectedColor);
    if (currentColorObj?.images && currentColorObj.images.length > 0) {
      return currentColorObj.images;
    }
    return product?.images || [];
  }, [selectedColor, product]);

  // --- 3. 所有的 useCallback ---
  const handleToggleFavorite = useCallback(async () => {
    if (!user) {
      toast.error('Please sign in to favorite items');
      return;
    }
    if (!product) return; 
    try {
      await toggleWishlist(product.id);
      toast.success(isLiked ? 'Removed from wishlist' : 'Added to wishlist');
      router.refresh();
    } catch (error: any) {
      toast.error('Operation failed');
    }
  }, [user, isLiked, product?.id, toggleWishlist, router]);

  const handleAddToBag = useCallback(async () => {
    if (!product) return;
    setIsAdding(true);
    try {
      const cartImage = currentImages[0]?.url || product.images?.[0]?.url || '';
      const cartItem = {
        id: `${product.id}-${selectedColor}-${selectedSize}`,
        product_id: product.id, 
        name: product.name, 
        price: product.price,
        image: cartImage, 
        color: selectedColor, 
        size: selectedSize,
        quantity: 1
      };

      await addToCart(cartItem, user?.id);
      toast.success(`${product.name} added to bag`);
      openCart(); 
    } catch (error) { 
      console.error('Add to bag error:', error);
      toast.error('Could not add to bag'); 
    } finally { 
      setIsAdding(false); 
    }
  }, [product, selectedColor, selectedSize, currentImages, addToCart, user?.id, openCart]);

  const handleBuyNow = useCallback(async () => {
    if (!product) return;
    setIsAdding(true);
    try {
      const cartImage = currentImages[0]?.url || product.images?.[0]?.url || '';
      const cartItem = {
        id: `${product.id}-${selectedColor}-${selectedSize}`,
        product_id: product.id, 
        name: product.name, 
        price: product.price,
        image: cartImage, 
        color: selectedColor, 
        size: selectedSize,
        quantity: 1
      };

      await addToCart(cartItem, user?.id);
      router.push('/cart'); 
    } catch (error) { 
      console.error('Buy now error:', error);
      toast.error('Redirect failed'); 
    } finally { 
      setIsAdding(false); 
    }
  }, [product, selectedColor, selectedSize, currentImages, addToCart, user?.id, router]);

  // --- 4. 安全检查：如果数据没加载完，显示 Loading ---
  if (!product) {
    return <div className="p-20 text-center uppercase text-xs tracking-[5px]">Loading...</div>;
  }

  // --- 5. 渲染页面 (保持原有极简大牌风样式) ---
  return (
    <main className="min-h-screen bg-white flex flex-col w-full">
      {/* 顶部主图区域 */}
      <section className="w-full min-h-[60vh] lg:h-screen bg-[#F9F9F9] overflow-hidden relative">
        <ProductGallery images={currentImages} key={selectedColor} />
      </section>

      {/* 产品详情交互区 */}
      <section className="w-full bg-white px-6 pt-12 pb-16 lg:px-12 lg:pt-20 lg:pb-24">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-10 lg:gap-20">
          
          <div className="w-full lg:w-[60%] flex flex-col">
            <ProductInfo product={product} />

            <div className="mt-8 space-y-6">
              <ProductOptions 
                product={product}
                selectedColor={selectedColor}
                onColorChange={(color: string) => setSelectedColor(color)}
                selectedSize={selectedSize}
                onSizeChange={setSelectedSize}
              />
              
              <div className="w-full flex items-center justify-between border border-zinc-200 p-4 text-[11px] uppercase tracking-widest hover:border-black cursor-pointer transition-colors text-black">
                <span>Complimentary Personalization</span>
                <Plus size={16} strokeWidth={1} />
              </div>
            </div>

            {/* 折叠详情区 */}
            <div className="mt-12 border-t border-zinc-200">
              {[
                { 
                  title: 'Product Details', 
                  content: `${product.dimensions ? `<p>Dimensions: ${product.dimensions}</p><br/>` : ''}${product.description || ''}` 
                },
                { 
                  title: 'Materials & Care', 
                  content: product.materialsCare 
                },
                { 
                  title: 'Our Commitment', 
                  content: "<p>Sustainability and craftsmanship are the pillars of our brand. Every piece is crafted in limited batches to ensure excellence.</p>" 
                }
              ].map((item, i) => (
                <details key={i} className="group border-b border-zinc-200" open={i === 0}>
                  <summary className="flex justify-between items-center py-6 cursor-pointer list-none text-[11px] font-medium uppercase tracking-widest text-black">
                    {item.title}
                    <Plus size={18} strokeWidth={1} className="group-open:rotate-45 transition-transform" />
                  </summary>
                  
                  <div 
                    className="pb-6 text-sm font-light text-zinc-800 leading-relaxed rich-text-wrapper prose prose-zinc max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.content || "Information currently unavailable." }}
                  />
                </details>
              ))}
            </div>
          </div>

          {/* 右侧固定操作区 */}
          <div className="w-full lg:w-[40%]">
            <div className="sticky top-24 space-y-10">
              <ProductActions 
                product={product} 
                selectedColor={selectedColor} 
                selectedSize={selectedSize}
                isFavorited={isLiked}
                isAdding={isAdding} 
                addToBag={handleAddToBag} 
                buyNow={handleBuyNow} 
                toggleFavorite={handleToggleFavorite}
              />

              <div className="space-y-6 pt-6 border-t border-zinc-100">
                <div className="flex gap-4 items-start text-[11px] font-light text-zinc-800">
                  <Truck size={18} strokeWidth={1} className="shrink-0 text-black" />
                  <div>
                    <p className="uppercase tracking-tighter mb-1 font-medium">Shipping</p>
                    <p>Estimated complimentary Express delivery:<br/><b>{deliveryInfo}</b></p>
                  </div>
                </div>

                <div 
                  onClick={() => setShowContactModal(true)}
                  className="flex gap-4 items-center text-[11px] uppercase tracking-widest cursor-pointer hover:underline text-black"
                >
                  <Phone size={18} strokeWidth={1} />
                  <span>Contact Us</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 底部推荐区 */}
      <Recommendations recommendedProducts={recommendedProducts} />

      {/* 弹窗组件 */}
      <ContactModals 
        showContactModal={showContactModal}
        setShowContactModal={setShowContactModal}
        showWhatsAppModal={showWhatsAppModal}
        setShowWhatsAppModal={setShowWhatsAppModal}
      />
    </main>
  );
}