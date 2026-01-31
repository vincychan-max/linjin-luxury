'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useWishlist } from '../../lib/wishlistStore';
import { useCart } from '../../lib/cartStore';
import { db } from '../../lib/firebase';
import { 
  getAuth, 
  onAuthStateChanged, 
  User, 
  signOut 
} from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  doc,
  writeBatch,
  increment
} from "firebase/firestore";

type SubItem = { label: string; href: string };
type SecondaryItem = { label: string; href?: string; sub?: SubItem[] };
type SecondaryMenu = { label: string; items: SecondaryItem[] };

export default function Header() {
  const pathname = usePathname() || '';
  
  const isListPage = pathname !== '/' && !pathname.startsWith('/product/');

  const [menuOpen, setMenuOpen] = useState(false);
  const [secondaryMenuOpen, setSecondaryMenuOpen] = useState(false);
  const [tertiaryMenuOpen, setTertiaryMenuOpen] = useState(false);
  const [currentSecondary, setCurrentSecondary] = useState<SecondaryMenu>({ label: '', items: [] });
  const [currentTertiary, setCurrentTertiary] = useState<{ label: string; items: SubItem[] }>({ label: '', items: [] });

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [contactMenuOpen, setContactMenuOpen] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { wishlist } = useWishlist();
  const { getTotalItems: getCartTotalItems } = useCart();

  const hasWishlistItems = wishlist.length > 0;

  const [clientCartCount, setClientCartCount] = useState(0);

  useEffect(() => {
    setClientCartCount(getCartTotalItems());
  }, [getCartTotalItems]);

  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth();

  const [headerSolid, setHeaderSolid] = useState(isListPage);

  // ==================== 登录后本地 cart → Firestore 合并 ====================
  const mergeLocalCartToFirestore = async (userId: string) => {
    const localItems = useCart.getState().items;
    if (localItems.length === 0) return;

    const batch = writeBatch(db);

    for (const item of localItems) {
      const docId = `${userId}_${item.id}_${item.color}_${item.size}`;
      const cartRef = doc(db, "cart_items", docId);

      batch.set(cartRef, {
        user_id: userId,
        product_id: item.id,
        name: item.name,
        price: item.price,
        color: item.color,
        size: item.size,
        image: item.image,
        quantity: increment(item.quantity),
        created_at: new Date(),
      }, { merge: true });
    }

    await batch.commit();
    useCart.getState().clearCart();
  };

  // ==================== Auth + Firestore 实时同步 (Cart + Wishlist) ====================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await mergeLocalCartToFirestore(currentUser.uid);

        // Cart 实时同步
        const cartQ = query(collection(db, "cart_items"), where("user_id", "==", currentUser.uid));
        const unsubscribeCart = onSnapshot(cartQ, (snapshot) => {
          const serverItems: any[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            serverItems.push({
              id: data.product_id,
              name: data.name,
              price: data.price,
              image: data.image,
              color: data.color,
              size: data.size || 'One Size',
              quantity: data.quantity,
            });
          });
          useCart.setState({ items: serverItems });
        });

        // Wishlist 实时同步到全局 store
        const wishlistQ = query(collection(db, "wishlist"), where("user_id", "==", currentUser.uid));
        const unsubscribeWishlist = onSnapshot(wishlistQ, (snapshot) => {
          const serverWishlist: any[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            serverWishlist.push({
              id: data.product_id || data.id,
              name: data.name,
              price: data.price,
              image: data.image,
              color: data.color,
              size: data.size,
            });
          });
          useWishlist.setState({ wishlist: serverWishlist });
        });

        return () => {
          unsubscribeCart();
          unsubscribeWishlist();
        };
      } else {
        // 未登录清空
        useCart.setState({ items: [] });
        useWishlist.setState({ wishlist: [] });
      }
    });

    return unsubscribe;
  }, [auth]);

  // ==================== 搜索相关 ====================
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
        setSuggestions([]);
      }
    };
    if (searchOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [searchOpen]);

  const customDebounce = <T extends (...args: any[]) => any>(func: T, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const fetchSuggestions = customDebounce(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query.trim())}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    fetchSuggestions(searchQuery);
  }, [searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch();
  };

  // ==================== Header 透明/实心切换 ====================
  useEffect(() => {
    const handleScroll = () => {
      setHeaderSolid(prev => prev || window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const effectiveSolid = headerSolid || isListPage;

  // ==================== 菜单数据 ====================
  const secondaryMenus: Record<string, SecondaryMenu> = {
    newIn: {
      label: 'New In',
      items: [
        {
          label: 'All New Arrivals',
          href: '/new-in',
        },
        {
          label: 'Women’s New Arrivals',
          sub: [
            { label: 'All Women’s New', href: '/new-in/women' },
            { label: 'Handbags', href: '/new-in/women/handbags' },
            { label: 'Shoes', href: '/new-in/women/shoes' },
            { label: 'Ready-to-Wear', href: '/new-in/women/ready-to-wear' },
            { label: 'Jewelry', href: '/new-in/women/jewelry' },
            { label: 'Accessories', href: '/new-in/women/accessories' },
            { label: 'Small Leather Goods', href: '/new-in/women/small-leather-goods' },
          ],
        },
        {
          label: 'Men’s New Arrivals',
          sub: [
            { label: 'All Men’s New', href: '/new-in/men' },
            { label: 'Bags', href: '/new-in/men/bags' },
            { label: 'Shoes', href: '/new-in/men/shoes' },
            { label: 'Suits & Tailoring', href: '/new-in/men/suits-tailoring' },
            { label: 'Accessories', href: '/new-in/men/accessories' },
            { label: 'Small Leather Goods', href: '/new-in/men/small-leather-goods' },
          ],
        },
        {
          label: 'Small Leather Goods',
          href: '/new-in/small-leather-goods',
        },
        {
          label: 'Travel',
          href: '/new-in/travel-lifestyle',
        },
        {
          label: 'Limited Editions',
          href: '/new-in/limited-editions',
        },
      ],
    },
    women: {
      label: 'Women',
      items: [
        {
          label: 'Handbags',
          sub: [
            { label: 'All Handbags', href: '/women/handbags' },
            { label: 'Crossbody', href: '/women/handbags/crossbody' },
            { label: 'Shoulder Bag', href: '/women/handbags/shoulder-bag' },
            { label: 'Mini Bags', href: '/women/handbags/mini-bags' },
            { label: 'Totes', href: '/women/handbags/totes' },
            { label: 'Clutches', href: '/women/handbags/clutches' },
            { label: 'Hobo Bag', href: '/women/handbags/hobo-bag' },
            { label: 'Bucket Bag', href: '/women/handbags/bucket-bag' },
            { label: 'Backpack', href: '/women/handbags/backpack' },
            { label: 'Top Handles', href: '/women/handbags/top-handles' },
            { label: 'Belt Bags', href: '/women/handbags/belt-bags' },
            { label: 'Trunk Inspired', href: '/women/handbags/trunk-inspired' },
          ],
        },
        {
          label: 'Shoes',
          sub: [
            { label: 'All Shoes', href: '/women/shoes' },
            { label: 'Heels', href: '/women/shoes/heels' },
            { label: 'Sneakers', href: '/women/shoes/sneakers' },
            { label: 'Boots', href: '/women/shoes/boots' },
            { label: 'Sandals', href: '/women/shoes/sandals' },
            { label: 'Flats', href: '/women/shoes/flats' },
          ],
        },
        {
          label: 'Ready-to-Wear',
          sub: [
            { label: 'All Ready-to-Wear', href: '/women/ready-to-wear' },
            { label: 'Dresses', href: '/women/ready-to-wear/dresses' },
            { label: 'Tops & Blouses', href: '/women/ready-to-wear/tops-blouses' },
            { label: 'Pants & Skirts', href: '/women/ready-to-wear/pants-skirts' },
            { label: 'Outerwear', href: '/women/ready-to-wear/outerwear' },
            { label: 'Knitwear', href: '/women/ready-to-wear/knitwear' },
          ],
        },
        {
          label: 'Jewelry',
          sub: [
            { label: 'All Jewelry', href: '/women/jewelry' },
            { label: 'Necklaces', href: '/women/jewelry/necklaces' },
            { label: 'Earrings', href: '/women/jewelry/earrings' },
            { label: 'Bracelets', href: '/women/jewelry/bracelets' },
            { label: 'Rings', href: '/women/jewelry/rings' },
            { label: 'Brooches', href: '/women/jewelry/brooches' },
          ],
        },
        {
          label: 'Accessories',
          sub: [
            { label: 'All Accessories', href: '/women/accessories' },
            { label: 'Sunglasses', href: '/women/accessories/sunglasses' },
            { label: 'Scarves & Shawls', href: '/women/accessories/scarves' },
            { label: 'Hats', href: '/women/accessories/hats' },
            { label: 'Belts', href: '/women/accessories/belts' },
            { label: 'Gloves', href: '/women/accessories/gloves' },
          ],
        },
      ],
    },
    men: {
      label: 'Men',
      items: [
        {
          label: 'Suits & Tailoring',
          sub: [
            { label: 'All Suits', href: '/men/suits-tailoring' },
            { label: 'Formal Suits', href: '/men/suits-tailoring/formal' },
            { label: 'Casual Suits', href: '/men/suits-tailoring/casual' },
            { label: 'Blazers', href: '/men/suits-tailoring/blazers' },
            { label: 'Trousers', href: '/men/suits-tailoring/trousers' },
            { label: 'Shirts', href: '/men/suits-tailoring/shirts' },
          ],
        },
        {
          label: 'Bags',
          sub: [
            { label: 'All Bags', href: '/men/bags' },
            { label: 'Briefcases', href: '/men/bags/briefcases' },
            { label: 'Backpacks', href: '/men/bags/backpacks' },
            { label: 'Messenger Bags', href: '/men/bags/messenger-bags' },
            { label: 'Totes', href: '/men/bags/totes' },
            { label: 'Crossbody Bags', href: '/men/bags/crossbody-bags' },
          ],
        },
        {
          label: 'Shoes',
          sub: [
            { label: 'All Shoes', href: '/men/shoes' },
            { label: 'Dress Shoes', href: '/men/shoes/dress' },
            { label: 'Sneakers', href: '/men/shoes/sneakers' },
            { label: 'Boots', href: '/men/shoes/boots' },
            { label: 'Loafers', href: '/men/shoes/loafers' },
            { label: 'Sandals', href: '/men/shoes/sandals' },
          ],
        },
        {
          label: 'Accessories',
          sub: [
            { label: 'All Accessories', href: '/men/accessories' },
            { label: 'Ties', href: '/men/accessories/ties' },
            { label: 'Belts', href: '/men/accessories/belts' },
            { label: 'Wallets', href: '/men/accessories/wallets' },
            { label: 'Sunglasses', href: '/men/accessories/sunglasses' },
            { label: 'Watches', href: '/men/accessories/watches' },
          ],
        },
      ],
    },
    smallLeatherGoods: {
      label: 'Small Leather Goods',
      items: [
        {
          label: 'Women',
          sub: [
            { label: 'All Women\'s SLG', href: '/small-leather-goods/women' },
            { label: 'Wallets', href: '/small-leather-goods/women/wallets' },
            { label: 'Card Holders', href: '/small-leather-goods/women/card-holders' },
            { label: 'Pouches', href: '/small-leather-goods/women/pouches' },
            { label: 'Key Holders', href: '/small-leather-goods/women/key-holders' },
            { label: 'Tech Accessories', href: '/small-leather-goods/women/tech-accessories' },
          ],
        },
        {
          label: 'Men',
          sub: [
            { label: 'All Men\'s SLG', href: '/small-leather-goods/men' },
            { label: 'Wallets', href: '/small-leather-goods/men/wallets' },
            { label: 'Card Holders', href: '/small-leather-goods/men/card-holders' },
            { label: 'Pouches', href: '/small-leather-goods/men/pouches' },
            { label: 'Key Holders', href: '/small-leather-goods/men/key-holders' },
            { label: 'Tech Accessories', href: '/small-leather-goods/men/tech-accessories' },
          ],
        },
      ],
    },
    travelLifestyle: {
      label: 'Travel & Lifestyle',
      items: [
        {
          label: 'Luggage',
          sub: [
            { label: 'All Luggage', href: '/travel-lifestyle/luggage' },
            { label: 'Hard Shell', href: '/travel-lifestyle/luggage/hard-shell' },
            { label: 'Soft Shell', href: '/travel-lifestyle/luggage/soft-shell' },
            { label: 'Carry-On', href: '/travel-lifestyle/luggage/carry-on' },
            { label: 'Checked', href: '/travel-lifestyle/luggage/checked' },
          ],
        },
        { label: 'Travel Bags', href: '/travel-lifestyle/travel-bags' },
        { label: 'Travel Accessories', href: '/travel-lifestyle/travel-accessories' },
        { label: 'Home & Living', href: '/travel-lifestyle/home-living' },
      ],
    },
    accessories: {
      label: 'Accessories',
      items: [
        {
          label: 'Women',
          sub: [
            { label: 'All Women’s Accessories', href: '/accessories/women' },
            { label: 'Belts', href: '/accessories/women/belts' },
            { label: 'Scarves & Shawls', href: '/accessories/women/scarves' },
            { label: 'Sunglasses', href: '/accessories/women/sunglasses' },
            { label: 'Hats & Hair Accessories', href: '/accessories/women/hats' },
            { label: 'Gloves', href: '/accessories/women/gloves' },
            { label: 'Fine Jewelry', href: '/accessories/women/jewelry' },
            { label: 'Tech Accessories', href: '/accessories/women/tech' },
          ],
        },
        {
          label: 'Men',
          sub: [
            { label: 'All Men’s Accessories', href: '/accessories/men' },
            { label: 'Belts', href: '/accessories/men/belts' },
            { label: 'Ties & Pocket Squares', href: '/accessories/men/ties' },
            { label: 'Sunglasses', href: '/accessories/men/sunglasses' },
            { label: 'Hats & Caps', href: '/accessories/men/hats' },
            { label: 'Wallets', href: '/accessories/men/wallets' },
            { label: 'Cufflinks', href: '/accessories/men/cufflinks' },
            { label: 'Gloves', href: '/accessories/men/gloves' },
          ],
        },
      ],
    },
    beauty: {
      label: 'Beauty',
      items: [
        {
          label: 'Makeup',
          sub: [
            { label: 'All Makeup', href: '/beauty/makeup' },
            { label: 'Lipstick', href: '/beauty/makeup/lipstick' },
            { label: 'Foundation & Concealer', href: '/beauty/makeup/foundation' },
            { label: 'Eyeshadow & Eyeliner', href: '/beauty/makeup/eyeshadow' },
            { label: 'Mascara', href: '/beauty/makeup/mascara' },
            { label: 'Blush & Highlighter', href: '/beauty/makeup/blush' },
            { label: 'Nails', href: '/beauty/makeup/nails' },
          ],
        },
        {
          label: 'Skincare',
          sub: [
            { label: 'All Skincare', href: '/beauty/skincare' },
            { label: 'Moisturizers & Creams', href: '/beauty/skincare/moisturizers' },
            { label: 'Serums & Treatments', href: '/beauty/skincare/serums' },
            { label: 'Cleansers & Toners', href: '/beauty/skincare/cleansers' },
            { label: 'Masks & Exfoliators', href: '/beauty/skincare/masks' },
            { label: 'Eye Care', href: '/beauty/skincare/eye-care' },
          ],
        },
        { label: 'Brushes & Tools', href: '/beauty/tools' },
        { label: 'New Arrivals', href: '/beauty/new-in' },
        { label: 'Best Sellers', href: '/beauty/best-sellers' },
      ],
    },
    fragrance: {
      label: 'Fragrance',
      items: [
        { label: 'All Fragrance', href: '/fragrance' },
        {
          label: 'Women’s Fragrance',
          sub: [
            { label: 'All Women’s', href: '/fragrance/women' },
            { label: 'Floral', href: '/fragrance/women/floral' },
            { label: 'Oriental', href: '/fragrance/women/oriental' },
            { label: 'Fresh', href: '/fragrance/women/fresh' },
            { label: 'New Arrivals', href: '/fragrance/women/new-in' },
          ],
        },
        {
          label: 'Men’s Fragrance',
          sub: [
            { label: 'All Men’s', href: '/fragrance/men' },
            { label: 'Woody', href: '/fragrance/men/woody' },
            { label: 'Citrus', href: '/fragrance/men/citrus' },
            { label: 'Spicy', href: '/fragrance/men/spicy' },
            { label: 'New Arrivals', href: '/fragrance/men/new-in' },
          ],
        },
        { label: 'Unisex Fragrance', href: '/fragrance/unisex' },
        { label: 'Home Fragrance', href: '/fragrance/home' },
        { label: 'Best Sellers', href: '/fragrance/best-sellers' },
      ],
    },
    limitedEditions: {
      label: 'Limited Editions',
      items: [
        { label: 'All Limited Editions', href: '/limited-editions' },
        {
          label: 'Capsule Collections',
          sub: [
            { label: 'View All Capsules', href: '/limited-editions/capsule' },
            { label: 'Spring/Summer 2025', href: '/limited-editions/capsule/ss25' },
            { label: 'Fall/Winter 2024', href: '/limited-editions/capsule/fw24' },
            { label: 'Holiday Collection', href: '/limited-editions/capsule/holiday' },
          ],
        },
        {
          label: 'Artist Collaborations',
          sub: [
            { label: 'View All Collaborations', href: '/limited-editions/collaborations' },
            { label: 'With Murakami', href: '/limited-editions/collaborations/murakami' },
            { label: 'With Yayoi Kusama', href: '/limited-editions/collaborations/kusama' },
            { label: 'With Jeff Koons', href: '/limited-editions/collaborations/koons' },
          ],
        },
        {
          label: 'Monogram Special Editions',
          sub: [
            { label: 'View All Special Editions', href: '/limited-editions/special' },
            { label: 'Multicolor Monogram', href: '/limited-editions/special/multicolor' },
            { label: 'Denim Editions', href: '/limited-editions/special/denim' },
            { label: 'Metallic & Exotic Leather', href: '/limited-editions/special/exotic' },
          ],
        },
        { label: 'New Arrivals', href: '/limited-editions/new-in' },
        { label: 'Coming Soon', href: '/limited-editions/coming-soon' },
      ],
    },
    giftsPersonalization: {
      label: 'Gifts & Personalization',
      items: [
        { label: 'Gift Ideas', href: '/gifts/gift-ideas' },
        { label: 'For Her', href: '/gifts/for-her' },
        { label: 'For Him', href: '/gifts/for-him' },
        { label: 'Monogramming', href: '/personalization/monogramming' },
        { label: 'Engraving', href: '/personalization/engraving' },
      ],
    },
  };

  const mainMenuItems = [
    { label: 'New In', key: 'newIn' },
    { label: 'Women', key: 'women' },
    { label: 'Men', key: 'men' },
    { label: 'Small Leather Goods', key: 'smallLeatherGoods' },
    { label: 'Travel & Lifestyle', key: 'travelLifestyle' },
    { label: 'Accessories', key: 'accessories' },
    { label: 'Beauty', key: 'beauty' },
    { label: 'Fragrance', key: 'fragrance' },
    { label: 'Gifts & Personalization', key: 'giftsPersonalization' },
    { label: 'Limited Editions', key: 'limitedEditions' },
    { label: 'World of LJL', href: '/world-of-ljl' },
  ];

  const openSecondary = (key: string) => {
    setCurrentSecondary(secondaryMenus[key]);
    setSecondaryMenuOpen(true);
    setTertiaryMenuOpen(false);
    setMenuOpen(false);
  };

  const openTertiary = (subItems: SubItem[], subLabel: string) => {
    setCurrentTertiary({ label: subLabel, items: subItems });
    setTertiaryMenuOpen(true);
    setSecondaryMenuOpen(false);
  };

  const backToSecondary = () => {
    setTertiaryMenuOpen(false);
    setSecondaryMenuOpen(true);
  };

  const backToMain = () => {
    setSecondaryMenuOpen(false);
    setTertiaryMenuOpen(false);
    setMenuOpen(true);
  };

  const closeAllMenus = () => {
    setMenuOpen(false);
    setSecondaryMenuOpen(false);
    setTertiaryMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          effectiveSolid ? 'bg-white/95 backdrop-blur-md border-b border-gray-200' : 'bg-transparent'
        }`}
        onMouseEnter={() => setHeaderSolid(true)}
        onMouseLeave={() => {
          if (window.scrollY <= 100 && !isListPage) {
            setHeaderSolid(false);
          }
        }}
      >
        <div className="px-6 lg:px-12 py-6 sm:py-8 md:py-9 lg:py-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
            <div className={`flex items-center gap-6 sm:gap-8 lg:gap-10 text-xl sm:text-2xl lg:text-3xl ${effectiveSolid ? 'text-black opacity-70' : 'text-white opacity-90'}`}>
              <button onClick={() => setSearchOpen(true)} className="hover:opacity-100 transition">
                <i className="fas fa-magnifying-glass"></i>
              </button>

              <button onClick={() => (menuOpen || secondaryMenuOpen || tertiaryMenuOpen) ? closeAllMenus() : setMenuOpen(true)} className="flex items-center hover:opacity-100 transition">
                <i className={(menuOpen || secondaryMenuOpen || tertiaryMenuOpen) ? "fas fa-times" : "fas fa-bars"}></i>
                <span className="hidden lg:inline ml-3 text-base lg:text-lg uppercase tracking-widest">
                  Menu
                </span>
              </button>
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link href="/">
                <h1 className={`text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-thin tracking-widest leading-none whitespace-nowrap ${effectiveSolid ? 'text-black' : 'text-white'}`}>
                  LINJIN LUXURY
                </h1>
              </Link>
            </div>

            <div className={`flex items-center gap-6 sm:gap-8 lg:gap-10 text-xl sm:text-2xl lg:text-3xl ${effectiveSolid ? 'text-black opacity-70' : 'text-white opacity-90'}`}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="hover:opacity-100 transition"
              >
                <i className="fas fa-user"></i>
              </button>

              <div className="relative">
                <Link href="/wishlist" className="hover:opacity-100 transition">
                  <i className="far fa-heart"></i>
                </Link>
                {hasWishlistItems && (
                  <span className={`absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-pulse ${effectiveSolid ? '' : 'ring-2 ring-black/50'}`} />
                )}
              </div>

              <Link href="/cart" className="relative hover:opacity-100 transition" suppressHydrationWarning>
                <i className="fas fa-shopping-bag"></i>
                {clientCartCount > 0 && (
                  <span className={`absolute -top-2 -right-2 text-sm rounded-full w-6 h-6 flex items-center justify-center font-medium ${effectiveSolid ? 'bg-black text-white' : 'bg-white text-black'}`}>
                    {clientCartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setContactMenuOpen(!contactMenuOpen)}
                className="hidden lg:flex items-center hover:opacity-100 transition"
              >
                <span className="text-base lg:text-lg uppercase tracking-widest">
                  Contact
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主菜单抽屉 */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300" onClick={closeAllMenus} />
      )}

      <div className={`fixed inset-y-0 right-0 w-full max-w-md md:max-w-lg lg:max-w-xl bg-white shadow-2xl transform ${menuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50 overflow-y-auto`}>
        <div className="flex justify-end p-6 sm:p-8 lg:p-12">
          <button onClick={closeAllMenus} className="text-3xl lg:text-4xl text-black opacity-70 hover:opacity-100">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="px-8 lg:px-16 pb-20">
          <div className="flex flex-col gap-6 text-xl lg:text-2xl xl:text-3xl uppercase tracking-widest text-black opacity-80">
            {mainMenuItems.map((item) => {
              if (item.href) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeAllMenus}
                    className="py-4 border-b border-gray-200"
                  >
                    {item.label}
                  </Link>
                );
              } else {
                return (
                  <button
                    key={item.label}
                    onClick={() => openSecondary(item.key!)}
                    className="w-full text-left flex justify-between items-center py-4 border-b border-gray-200"
                  >
                    <span>{item.label}</span>
                    <i className="fas fa-chevron-right text-base"></i>
                  </button>
                );
              }
            })}
          </div>
        </div>
      </div>

      {/* 二级抽屉 */}
      {secondaryMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300" onClick={backToMain} />
          <div className={`fixed inset-y-0 right-0 w-full max-w-md md:max-w-lg lg:max-w-xl bg-white shadow-2xl transform ${secondaryMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50 overflow-y-auto`}>
            <div className="flex items-center justify-between p-6 sm:p-8 lg:p-12 border-b border-gray-200">
              <button onClick={backToMain} className="flex items-center gap-3 text-black opacity-70 hover:opacity-100 transition text-lg uppercase tracking-widest">
                <i className="fas fa-chevron-left text-2xl"></i>
                Back
              </button>
              <h2 className="text-2xl uppercase tracking-widest text-black opacity-80">
                {currentSecondary?.label || 'Menu'}
              </h2>
              <button onClick={closeAllMenus} className="text-3xl text-black opacity-70 hover:opacity-100">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="px-8 lg:px-16 pb-20 pt-8">
              <div className="flex flex-col gap-6 text-xl lg:text-2xl uppercase tracking-widest text-black opacity-80">
                {currentSecondary.items.map((item) => (
                  item.sub ? (
                    <button
                      key={item.label}
                      onClick={() => openTertiary(item.sub!, item.label)}
                      className="w-full text-left flex justify-between items-center py-4 border-b border-gray-200"
                    >
                      <span>{item.label}</span>
                      <i className="fas fa-chevron-right text-base"></i>
                    </button>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href!}
                      onClick={closeAllMenus}
                      className="py-4 border-b border-gray-200"
                    >
                      {item.label}
                    </Link>
                  )
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 三级抽屉 */}
      {tertiaryMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300" onClick={closeAllMenus} />
          <div className={`fixed inset-y-0 right-0 w-full max-w-md md:max-w-lg lg:max-w-xl bg-white shadow-2xl transform ${tertiaryMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50 overflow-y-auto`}>
            <div className="flex items-center justify-between p-6 sm:p-8 lg:p-12 border-b border-gray-200">
              <button onClick={backToSecondary} className="flex items-center gap-3 text-black opacity-70 hover:opacity-100 transition text-lg uppercase tracking-widest">
                <i className="fas fa-chevron-left text-2xl"></i>
                Back
              </button>
              <h2 className="text-2xl uppercase tracking-widest text-black opacity-80">
                {currentTertiary.label}
              </h2>
              <button onClick={closeAllMenus} className="text-3xl text-black opacity-70 hover:opacity-100">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="px-8 lg:px-16 pb-20 pt-8">
              <div className="flex flex-col gap-6 text-xl lg:text-2xl uppercase tracking-widest text-black opacity-80">
                {currentTertiary.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeAllMenus}
                    className="py-4 border-b border-gray-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 用户抽屉 */}
      {userMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300" onClick={() => setUserMenuOpen(false)} />
      )}

      <div className={`fixed inset-y-0 right-0 w-full max-w-md md:max-w-lg lg:max-w-xl bg-white shadow-2xl transform ${userMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50 overflow-y-auto`}>
        <div className="flex justify-end p-6 sm:p-8 lg:p-12">
          <button onClick={() => setUserMenuOpen(false)} className="text-3xl lg:text-4xl text-black opacity-70 hover:opacity-100">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="px-8 lg:px-16 pb-20">
          <div className="flex flex-col gap-8 text-lg lg:text-xl">
            {user ? (
              <>
                <div className="flex items-center gap-6 pb-8 border-b border-gray-200">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="User avatar"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center text-white text-4xl font-thin">
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-2xl">{user.displayName || 'Welcome'}</p>
                    <p className="text-gray-600 mt-1">{user.email}</p>
                  </div>
                </div>

                <ul className="space-y-6">
                  <li><Link href="/my-orders" onClick={() => setUserMenuOpen(false)}>My Orders</Link></li>
                  <li><Link href="/account/settings" onClick={() => setUserMenuOpen(false)}>Account Settings</Link></li>
                  <li><Link href="/account/addresses" onClick={() => setUserMenuOpen(false)}>Address Book</Link></li>
                  <li><Link href="/wishlist" onClick={() => setUserMenuOpen(false)}>Saved Items</Link></li>
                  <li><Link href="/account/vip-services" onClick={() => setUserMenuOpen(false)}>VIP Services</Link></li>
                  <li className="pt-6 border-t border-gray-200">
                    <button
                      onClick={async () => {
                        await signOut(auth);
                        setUserMenuOpen(false);
                      }}
                      className="text-red-600 font-medium"
                    >
                      Sign Out
                    </button>
                  </li>
                </ul>
              </>
            ) : (
              <ul className="space-y-6">
                <li className="py-6 bg-gray-50 font-medium text-center rounded-xl">
                  <Link href="/auth/signin" onClick={() => setUserMenuOpen(false)}>Sign In</Link>
                </li>
                <li><Link href="/account/settings" onClick={() => setUserMenuOpen(false)}>Account Settings</Link></li>
                <li><Link href="/account/address-book" onClick={() => setUserMenuOpen(false)}>Address Book</Link></li>
                <li><Link href="/wishlist" onClick={() => setUserMenuOpen(false)}>Saved Items</Link></li>
                <li><Link href="/account/vip-services" onClick={() => setUserMenuOpen(false)}>VIP Services</Link></li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Contact 抽屉 */}
      {contactMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300" onClick={() => setContactMenuOpen(false)} />
      )}

      <div className={`fixed inset-y-0 right-0 w-full max-w-md md:max-w-lg lg:max-w-xl bg-white shadow-2xl transform ${contactMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50 overflow-y-auto`}>
        <div className="flex justify-end p-6 sm:p-8 lg:p-12">
          <button onClick={() => setContactMenuOpen(false)} className="text-3xl lg:text-4xl text-black opacity-70 hover:opacity-100">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="px-8 lg:px-16 pb-20 flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-4xl lg:text-5xl font-thin uppercase tracking-widest mb-16">
            Contact Us
          </h2>

          <div className="w-full max-w-md space-y-16 text-center">
            {/* Call Us */}
            <div>
              <div className="flex items-center justify-center mb-4">
                <i className="fas fa-phone text-2xl mr-3"></i>
                <a href="tel:+18774822430" className="text-2xl underline">
                  Call Us +1 (877) 482-2430
                </a>
              </div>
              <p className="text-lg opacity-80 leading-relaxed">
                Monday – Saturday from 10 AM to 10 PM (EST).<br />
                Sunday from 10 AM to 9 PM (EST).
              </p>
            </div>

            {/* Live Chat */}
            <div>
              <div className="flex items-center justify-center mb-4">
                <span className="inline-block w-4 h-4 bg-yellow-400 rounded-full mr-4"></span>
                <span className="text-2xl font-semibold uppercase tracking-wider">Live Chat</span>
              </div>
              <p className="text-lg opacity-80 leading-relaxed mb-6">
                Monday – Saturday from 10 AM to 10 PM (EST).<br />
                Sunday from 10 AM to 9 PM (EST).
              </p>
              <button
                onClick={() => {
                  if ((window as any).Tawk_API) {
                    (window as any).Tawk_API.showWidget();
                    (window as any).Tawk_API.maximize();
                  }
                }}
                className="px-16 py-6 bg-black text-white uppercase tracking-widest hover:opacity-90 transition font-semibold"
              >
                Start Live Chat
              </button>
            </div>

            {/* Message Us - 点击打开 WhatsApp 抽屉 */}
            <div>
              <div className="flex items-center justify-center mb-4">
                <i className="far fa-envelope text-2xl mr-3"></i>
                <button
                  onClick={() => setWhatsappOpen(true)}
                  className="text-2xl underline bg-transparent border-none cursor-pointer"
                >
                  Message Us
                </button>
              </div>
              <p className="text-lg opacity-80 leading-relaxed">
                Monday – Saturday from 10 AM to 10 PM (EST).<br />
                Sunday from 10 AM to 9 PM (EST).
              </p>
            </div>
          </div>

          {/* 底部文字 - 链接到 /contact 页面 */}
          <div className="mt-20 text-center">
            <p className="text-2xl mb-8">Do you need help?</p>
            <Link 
              href="/contact" 
              onClick={() => setContactMenuOpen(false)}
              className="text-3xl font-light underline hover:opacity-80 transition"
            >
              Get in Contact with Us
            </Link>
          </div>
        </div>
      </div>

      {/* WhatsApp 抽屉 */}
      {whatsappOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300" onClick={() => setWhatsappOpen(false)} />
      )}

      <div className={`fixed inset-y-0 right-0 w-full max-w-md md:max-w-lg lg:max-w-xl bg-white shadow-2xl transform ${whatsappOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out z-50 overflow-y-auto`}>
        <div className="flex justify-between items-center p-6 sm:p-8 lg:p-12 border-b border-gray-200">
          <button
            onClick={() => {
              setWhatsappOpen(false);
              setContactMenuOpen(true);
            }}
            className="flex items-center gap-3 text-black opacity-70 hover:opacity-100 transition text-lg uppercase tracking-widest"
          >
            <i className="fas fa-chevron-left text-2xl"></i>
            Back
          </button>
          <button onClick={() => setWhatsappOpen(false)} className="text-3xl lg:text-4xl text-black opacity-70 hover:opacity-100">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="px-8 lg:px-16 py-20 flex flex-col items-center justify-center min-h-screen text-center">
          <h2 className="text-4xl lg:text-5xl font-thin uppercase tracking-widest mb-8">
            Connect to WhatsApp
          </h2>
          <p className="text-lg opacity-80 leading-relaxed mb-12 max-w-md">
            Scan the QR code with your smartphone to connect with our Client Service by mobile
          </p>

          <div className="mb-12">
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://wa.me/8617817026596?text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20your%20products." 
              alt="WhatsApp QR Code"
              className="mx-auto"
            />
          </div>

          <p className="text-lg opacity-80">
            Click below to access{' '}
            <a 
              href="https://wa.me/8617817026596?text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20your%20products." 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline"
            >
              WhatsApp Web
            </a>
          </p>
        </div>
      </div>

      {/* 搜索模态 */}
      {searchOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="px-12 pt-8 pb-12 border-b border-gray-200">
            <div className="max-w-5xl mx-auto flex items-center gap-8">
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                  setSuggestions([]);
                }}
                className="text-4xl text-black opacity-80 hover:opacity-100 transition"
              >
                <i className="fas fa-times"></i>
              </button>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search for products, collections..."
                className="flex-1 bg-transparent border-b-2 border-black text-black text-4xl md:text-5xl font-thin tracking-widest placeholder-black/50 focus:outline-none"
              />
              <button onClick={handleSearch} className="text-4xl text-black opacity-80 hover:opacity-100 transition">
                <i className="fas fa-magnifying-glass"></i>
              </button>
            </div>
          </div>
          <div className="flex-1 px-12 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              {loading && <p className="text-black/60 text-2xl">Searching...</p>}
              {!loading && suggestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left text-black text-2xl hover:opacity-80 transition py-4 border-b border-black/20"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : (
                !loading && searchQuery && <p className="text-black/60 text-2xl">No results found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}