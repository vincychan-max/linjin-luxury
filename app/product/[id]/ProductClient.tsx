'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getAuth } from "firebase/auth";
import { db } from '../../../lib/firebase';
import { 
  collection, 
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment
} from "firebase/firestore";

import ProductGallery from './components/ProductGallery';
import ProductOptions from './components/ProductOptions';
import ProductInfo from './components/ProductInfo';
import ProductActions from './components/ProductActions';
import ContactModals from './components/ContactModals';
import Recommendations from './components/Recommendations';

export default function ProductClient({ 
  product, 
  recommendedProducts: initialRecommendations 
}: { 
  product: any; 
  recommendedProducts: any[] 
}) {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [isFavorited, setIsFavorited] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const auth = getAuth();

  // 收藏状态同步（保持不变）
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const favId = `${currentUser.uid}_${product.id}`;
          const favSnap = await getDoc(doc(db, "wishlist", favId));
          setIsFavorited(favSnap.exists());
        } catch (error) {
          console.error("Load wishlist error:", error);
        }
      } else {
        const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setIsFavorited(localWishlist.some((item: any) => item.id === product.id));
      }
    };

    loadFavoriteStatus();

    const syncFromLocal = () => loadFavoriteStatus();
    window.addEventListener('storage', syncFromLocal);
    window.addEventListener('wishlistUpdated', syncFromLocal);

    return () => {
      window.removeEventListener('storage', syncFromLocal);
      window.removeEventListener('wishlistUpdated', syncFromLocal);
    };
  }, [product.id, auth.currentUser]);

  // Add to Bag 函数 - 彻底修复重复问题（固定 docId + getDoc 检查）
  const addToBag = async () => {
    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }

    const currentUser = auth.currentUser;
    const fallbackImage = product.images?.[0] || '/images/placeholder.jpg';

    // 标准化 size（避免 'One Size' vs 'OneSize' 不匹配）
    const normalizedSize = selectedSize || 'OneSize';

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      color: selectedColor,
      size: normalizedSize,
      image: fallbackImage,
      quantity: 1,
    };

    if (currentUser) {
      try {
        // 固定 docId：user_uid + product_id + color + size
        const docId = `${currentUser.uid}_${product.id}_${selectedColor}_${normalizedSize}`;
        const cartRef = doc(db, "cart_items", docId);

        const snap = await getDoc(cartRef);

        if (snap.exists()) {
          // 已存在 → 只 +1 数量
          await updateDoc(cartRef, {
            quantity: increment(1),
            updated_at: new Date(),
          });
          toast.success(`Updated quantity: ${product.name} (${selectedColor})`);
        } else {
          // 不存在 → 新建
          await setDoc(cartRef, {
            user_id: currentUser.uid,
            product_id: product.id,
            ...cartItem,
            created_at: new Date(),
          });
          toast.success(`Added to bag: ${product.name} (${selectedColor})`);
        }
      } catch (error) {
        console.error("Error adding to Firestore cart:", error);
        toast.error('Failed to add to bag. Please try again.');
      }
    } else {
      // 未登录：本地存储（也去重）
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingIndex = cart.findIndex((item: any) => 
        item.id === cartItem.id && 
        item.color === cartItem.color && 
        item.size === cartItem.size
      );

      if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
        toast.success(`Updated quantity: ${product.name} (${selectedColor})`);
      } else {
        cart.push({ ...cartItem, quantity: 1 });
        toast.success(`Added to bag: ${product.name} (${selectedColor})`);
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  // Toggle Favorite 函数（保持不变）
  const toggleFavorite = async () => {
    const newFavorited = !isFavorited;
    setIsFavorited(newFavorited);

    const fallbackImage = product.images?.[0] || '/images/placeholder.jpg';

    let localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (newFavorited) {
      if (!localWishlist.some((item: any) => item.id === product.id)) {
        localWishlist.push({
          id: product.id,
          name: product.name,
          price: product.price,
          color: selectedColor,
          size: selectedSize || 'One Size',
          image: fallbackImage,
        });
        toast.success('Added to wishlist ❤️');
      }
    } else {
      localWishlist = localWishlist.filter((item: any) => item.id !== product.id);
      toast.success('Removed from wishlist');
    }
    localStorage.setItem('wishlist', JSON.stringify(localWishlist));
    window.dispatchEvent(new Event('wishlistUpdated'));

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const favId = `${currentUser.uid}_${product.id}`;
        const favRef = doc(db, "wishlist", favId);
        if (newFavorited) {
          await setDoc(favRef, {
            user_id: currentUser.uid,
            product_id: product.id,
            name: product.name,
            price: product.price,
            color: selectedColor,
            size: selectedSize || 'One Size',
            image: fallbackImage,
            added_at: new Date(),
          });
        } else {
          await deleteDoc(favRef);
        }
      } catch (error) {
        console.error("Wishlist sync error:", error);
        toast.error('Sync failed. Local saved.');
      }
    }
  };

  // 价格和库存计算（已修复：删除 / 100，直接用美元金额）
  const formattedPrice = product.price
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(product.price)  // ← 已删除 / 100
    : 'Price on request';

  const isOutOfStock = product.stock === 0 || product.stock == null;
  const stockText = isOutOfStock
    ? 'Sold Out'
    : product.stock < 5
      ? `Only ${product.stock} left in stock`
      : 'In Stock';

  const stockClass = isOutOfStock
    ? 'text-gray-600 italic'               // 售罄：灰色 + 斜体（高端低调，不用红色）
    : product.stock < 5
      ? 'text-orange-600 font-semibold'     // 低库存：橙色催单
      : 'text-gray-600';                     // 有货：灰色（或可隐藏）

  return (
    <div className="min-h-screen bg-white">
      <ProductGallery 
        product={product} 
        selectedColor={selectedColor} 
        setSelectedColor={setSelectedColor} 
      />

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* 左侧：选项 */}
          <div className="space-y-16">
            <ProductOptions 
              product={product}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              openContactModal={() => setShowContactModal(true)}
            />
          </div>

          {/* 右侧：标题 + 价格 + 库存 + 描述 + 操作 */}
          <div className="space-y-12">
            {/* 标题 + 价格 + 库存 */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-widest uppercase">
                {product.name}
              </h1>

              {product.code && (
                <p className="text-xl uppercase tracking-widest opacity-80">
                  Style {product.code}
                </p>
              )}

              {/* 价格：已修复 + 优化为更高端字体 */}
              <p className="text-5xl md:text-7xl font-thin tracking-widest">
                {formattedPrice}
              </p>

              {/* 库存：字体缩小，售罄用灰色斜体 */}
              <p className={`text-xl md:text-2xl ${stockClass}`}>
                {stockText}
              </p>
            </div>

            {/* 描述和折叠详情 */}
            <ProductInfo product={product} />

            {/* 操作按钮 */}
            <ProductActions 
              product={product}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              isFavorited={isFavorited}
              setIsFavorited={setIsFavorited}
              addToBag={addToBag}
              toggleFavorite={toggleFavorite}
            />
          </div>
        </div>
      </div>

      <ContactModals 
        showContactModal={showContactModal}
        setShowContactModal={setShowContactModal}
        showWhatsAppModal={showWhatsAppModal}
        setShowWhatsAppModal={setShowWhatsAppModal}
      />

      <Recommendations recommendedProducts={initialRecommendations} />
    </div>
  );
}