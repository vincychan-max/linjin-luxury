'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCart } from '@/lib/cartStore';
import { supabase } from '@/lib/supabase';
import { Truck, Phone, Plus, ShieldCheck } from 'lucide-react'; 
import { toast } from 'sonner'; 
import { useRouter } from 'next/navigation';

import { useWishlistStore } from '@/lib/store/useWishlistStore';

import ProductGallery from './components/ProductGallery';
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
  
  // 1. 初始化选中的颜色和尺码
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || 'Default');
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'One Size');
  const [isAdding, setIsAdding] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState('Global shipping'); 
  
  // 从 Store 获取状态
  const { wishlistIds, toggleWishlist, fetchWishlistIds } = useWishlistStore();
  
  const [showContactModal, setShowContactModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const { addToCart, openCart } = useCart();

  // 监听登录状态并同步收藏夹
  useEffect(() => {
    const initData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      if (authUser) {
        await fetchWishlistIds(); // 只有登录后才拉取后端数据
      }
    };
    initData();
    setDeliveryInfo('Dispatched within 1-3 business days');
  }, [fetchWishlistIds]);

  /**
   * 🌟 定位当前变体 ID
   */
  const currentVariantId = useMemo(() => {
    const colorObj = product?.colors?.find((c: any) => c.name === selectedColor);
    return colorObj?.id || product?.id;
  }, [selectedColor, product]);

  /**
   * 🌟 收藏状态判断
   */
  const isLiked = useMemo(() => {
    return wishlistIds.includes(currentVariantId);
  }, [wishlistIds, currentVariantId]);

  /**
   * 🌟 动态图片逻辑
   */
  const currentImages = useMemo(() => {
    const currentColorObj = product?.colors?.find((c: any) => c.name === selectedColor);
    const rawImages = (currentColorObj?.images && currentColorObj.images.length > 0) 
      ? currentColorObj.images : (product?.images || []);

    return rawImages.map((img: any, index: number) => ({
      ...img,
      alt: product?.altText ? `${product.altText} - ${index + 1}` : `${product?.name} - ${index + 1}`
    }));
  }, [selectedColor, product]);

  const descriptionHtml = useMemo(() => {
    if (!product?.description) return '';
    return typeof product.description === 'object' ? product.description.html : product.description;
  }, [product?.description]);

  // 咨询处理
  const handleWhatsAppInquiry = useCallback(() => {
    const WHATSAPP_NUMBER = '17817026596'; 
    const message = `Hello LINJIN LUXURY, I am interested in ${product.name}.\nColor: ${selectedColor}\nSize: ${selectedSize}\nLink: ${window.location.href}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  }, [product.name, selectedColor, selectedSize]);

  const handleEmailInquiry = useCallback(() => {
    const recipient = "service@linjinluxury.com";
    const subject = `Inquiry: ${product.name}`;
    const body = `Interested in:\nProduct: ${product.name}\nColor: ${selectedColor}\nSize: ${selectedSize}\n\nLink: ${window.location.href}`;
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [product.name, selectedColor, selectedSize]);

  /**
   * 🌟 收藏切换逻辑
   */
  const handleToggleFavorite = useCallback(async () => {
    if (!user) { 
      toast.error('Please sign in to save your favorites', {
        style: { fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }
      }); 
      return; 
    }

    try {
      await toggleWishlist(currentVariantId);
      toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites', {
        style: { fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }
      });
    } catch (error) { 
      toast.error('Action failed, please try again'); 
    }
  }, [user, isLiked, currentVariantId, toggleWishlist]);

  /**
   * ✅ 关键修复：移除手动定义的 id，完全符合 AddCartInput 类型
   */
  const handleAddToBag = useCallback(async () => {
    if (!product) return;
    setIsAdding(true);
    try {
      const cartItem = {
        product_id: product.id, 
        name: product.name, 
        price: product.price,
        image: currentImages[0]?.url || '', 
        color: selectedColor, 
        size: selectedSize,
        // 如果你的 store 需要 material 字段，请确保它存在于 CartItem 定义中，否则请删除
      };
      await addToCart(cartItem, user?.id);
      toast.success('Added to bag', {
        style: { fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }
      });
      openCart(); 
    } catch (error) { 
      toast.error('Error adding to bag'); 
    } finally { 
      setIsAdding(false); 
    }
  }, [product, selectedColor, selectedSize, currentImages, addToCart, user?.id, openCart]);

  /**
   * ✅ 关键修复：移除手动定义的 id
   */
  const handleBuyNow = useCallback(async () => {
    if (!product) return;
    await addToCart({
      product_id: product.id, 
      name: product.name, 
      price: product.price,
      image: currentImages[0]?.url || '', 
      color: selectedColor, 
      size: selectedSize, 
    }, user?.id);
    router.push('/cart'); 
  }, [product, selectedColor, selectedSize, currentImages, addToCart, user?.id, router]);

  if (!product) return null;

  return (
    <main className="min-h-screen bg-white flex flex-col w-full">
      <section className="w-full min-h-[70vh] lg:h-screen bg-[#F9F9F9] overflow-hidden relative">
        <ProductGallery images={currentImages} key={selectedColor} altText={product.name} />
      </section>

      <section className="w-full bg-white px-6 pt-12 pb-16 lg:px-12 lg:pt-20 lg:pb-24">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-10 lg:gap-20">
          
          <div className="w-full lg:w-[60%] flex flex-col">
            <div className="mb-10 space-y-2">
              <h1 className="text-xl font-medium lowercase capitalize tracking-[0.1em] leading-tight text-zinc-900">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-lg font-light tracking-[0.05em] text-zinc-800">
                  USD {product.price?.toLocaleString()}
                </p>
                {product.stock > 0 && (
                  <span className="text-[10px] uppercase tracking-widest text-zinc-400">Available</span>
                )}
              </div>
            </div>

            <div className="space-y-6 mb-12">
              <ProductOptions 
                product={product}
                selectedColor={selectedColor}
                onColorChange={setSelectedColor}
                selectedSize={selectedSize}
                onSizeChange={setSelectedSize}
              />
              
              <div className="w-full flex items-center justify-between border border-zinc-200 p-4 text-[11px] uppercase tracking-widest hover:border-black cursor-pointer transition-colors text-black">
                <span>Complimentary Personalization</span>
                <Plus size={16} strokeWidth={1} />
              </div>
            </div>

            <div className="border-t border-zinc-200">
              <details className="group border-b border-zinc-200">
                <summary className="flex justify-between items-center py-6 cursor-pointer list-none text-[11px] font-medium uppercase tracking-widest text-black">
                  Description
                  <Plus size={18} strokeWidth={1} className="group-open:rotate-45 transition-transform" />
                </summary>
                <div className="pb-6 text-[13px] font-light text-zinc-500 leading-relaxed max-w-2xl prose prose-zinc">
                    <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                </div>
              </details>

              <details className="group border-b border-zinc-200" open>
                <summary className="flex justify-between items-center py-6 cursor-pointer list-none text-[11px] font-medium uppercase tracking-widest text-black">
                  Product Details
                  <Plus size={18} strokeWidth={1} className="group-open:rotate-45 transition-transform" />
                </summary>
                <div className="pb-6 text-sm font-light text-zinc-800 leading-relaxed">
                  {product.material && <p className="mb-2 italic">Material: {product.material}</p>}
                  {product.dimensions && <p className="mb-4">Dimensions: {product.dimensions}</p>}
                </div>
              </details>

              <details className="group border-b border-zinc-200">
                <summary className="flex justify-between items-center py-6 cursor-pointer list-none text-[11px] font-medium uppercase tracking-widest text-black">
                  Materials & Care
                  <Plus size={18} strokeWidth={1} className="group-open:rotate-45 transition-transform" />
                </summary>
                <div 
                  className="pb-6 text-sm font-light text-zinc-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.materialsCare || "Handle with care to maintain the luxury finish." }}
                />
              </details>

              <details className="group border-b border-zinc-200">
                <summary className="flex justify-between items-center py-6 cursor-pointer list-none text-[11px] font-medium uppercase tracking-widest text-black">
                  Atelier Commitment
                  <Plus size={18} strokeWidth={1} className="group-open:rotate-45 transition-transform" />
                </summary>
                <div className="pb-6 text-sm font-light text-zinc-800 leading-relaxed">
                  <p>Each piece is meticulously crafted in our private atelier. By bypassing traditional retail margins, we provide artisanal quality directly to you.</p>
                </div>
              </details>
            </div>
          </div>

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
                    <p className="uppercase tracking-tighter mb-1 font-medium text-black">Global Shipping</p>
                    <p>Secured delivery with real-time tracking:<br/><b>{deliveryInfo}</b></p>
                  </div>
                </div>

                <div className="flex gap-4 items-start text-[11px] font-light text-zinc-800">
                  <ShieldCheck size={18} strokeWidth={1} className="shrink-0 text-black" />
                  <div>
                    <p className="uppercase tracking-tighter mb-1 font-medium text-black">Quality Assurance</p>
                    <p>Every piece undergoes rigorous inspection before secure dispatch.</p>
                  </div>
                </div>

                <div 
                  onClick={() => setShowContactModal(true)}
                  className="flex gap-4 items-center text-[11px] uppercase tracking-widest cursor-pointer hover:underline text-black pt-4"
                >
                  <Phone size={18} strokeWidth={1} />
                  <span>Consult our Concierge</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Recommendations recommendedProducts={recommendedProducts} />
      <ContactModals 
        showContactModal={showContactModal} setShowContactModal={setShowContactModal}
        showWhatsAppModal={showWhatsAppModal} setShowWhatsAppModal={setShowWhatsAppModal}
        onWhatsAppClick={handleWhatsAppInquiry} onEmailClick={handleEmailInquiry} 
      />
    </main>
  );
}