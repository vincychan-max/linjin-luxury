'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';

type Props = {
  params: { mainCategory: string; subCategory: string };
};

export default function ProductListClient({ params }: Props) {
  const pathname = usePathname();
  const { mainCategory, subCategory } = params;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null)

  const PAGE_SIZE = 12;

  const currentDisplay = subCategory.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const mainDisplay = mainCategory.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  // 动态配置（支持 women, men + 4 个新主类别）
  const config = mainCategory === 'women' ? {
    // women 原有配置（保持不变）
    categoryMap: {
      handbags: null,
      'crossbody-bags': 'Crossbody',
      'mini-bags': 'Mini',
      'shoulder-bags': 'Shoulder',
      'hobo-bags': 'Hobo',
      'bucket-bags': 'Bucket',
      'tote-bags': 'Tote',
      'backpacks-belt-bags': 'Backpack',
      'top-handle-bags': 'Top Handle',
      'clutches-evening-bags': 'Clutch',
      shoes: null,
      sneakers: 'Sneakers',
      heels: 'Heels',
      boots: 'Boots',
      sandals: 'Sandals',
      flats: 'Flats',
      jewelry: null,
      necklaces: 'Necklaces',
      rings: 'Rings',
      earrings: 'Earrings',
      bracelets: 'Bracelets',
      accessories: null,
      belts: 'Belts',
      scarves: 'Scarves',
      hats: 'Hats',
      sunglasses: 'Sunglasses',
      wallets: 'Wallets',
      gloves: 'Gloves',
      keychains: 'Keychains',
      'hair-accessories': 'Hair Accessories',
      'phone-cases': 'Phone Cases',
      umbrellas: 'Umbrellas',
    },
    currentMainGroup: 
      ['handbags', 'crossbody-bags', 'mini-bags', 'shoulder-bags', 'hobo-bags', 'bucket-bags', 'tote-bags', 'backpacks-belt-bags', 'top-handle-bags', 'clutches-evening-bags'].includes(subCategory) ? 'handbags' :
      ['shoes', 'sneakers', 'heels', 'boots', 'sandals', 'flats'].includes(subCategory) ? 'shoes' :
      ['jewelry', 'necklaces', 'rings', 'earrings', 'bracelets'].includes(subCategory) ? 'jewelry' :
      ['accessories', 'belts', 'scarves', 'hats', 'sunglasses', 'wallets', 'gloves', 'keychains', 'hair-accessories', 'phone-cases', 'umbrellas'].includes(subCategory) ? 'accessories' :
      'handbags',
    groups: [
      {
        title: 'Handbags',
        mainSlug: 'handbags',
        categories: [
          { label: 'All Handbags', href: `/${mainCategory}/handbags`, slug: 'handbags' },
          { label: 'Crossbody Bags', href: `/${mainCategory}/crossbody-bags`, slug: 'crossbody-bags' },
          { label: 'Mini Bags', href: `/${mainCategory}/mini-bags`, slug: 'mini-bags' },
          { label: 'Shoulder Bags', href: `/${mainCategory}/shoulder-bags`, slug: 'shoulder-bags' },
          { label: 'Hobo Bags', href: `/${mainCategory}/hobo-bags`, slug: 'hobo-bags' },
          { label: 'Bucket Bags', href: `/${mainCategory}/bucket-bags`, slug: 'bucket-bags' },
          { label: 'Tote Bags', href: `/${mainCategory}/tote-bags`, slug: 'tote-bags' },
          { label: 'Backpacks & Belt Bags', href: `/${mainCategory}/backpacks-belt-bags`, slug: 'backpacks-belt-bags' },
          { label: 'Top Handle Bags', href: `/${mainCategory}/top-handle-bags`, slug: 'top-handle-bags' },
          { label: 'Clutches & Evening Bags', href: `/${mainCategory}/clutches-evening-bags`, slug: 'clutches-evening-bags' },
        ],
      },
      {
        title: 'Shoes',
        mainSlug: 'shoes',
        categories: [
          { label: 'All Shoes', href: `/${mainCategory}/shoes`, slug: 'shoes' },
          { label: 'Sneakers', href: `/${mainCategory}/sneakers`, slug: 'sneakers' },
          { label: 'Heels', href: `/${mainCategory}/heels`, slug: 'heels' },
          { label: 'Boots', href: `/${mainCategory}/boots`, slug: 'boots' },
          { label: 'Sandals', href: `/${mainCategory}/sandals`, slug: 'sandals' },
          { label: 'Flats', href: `/${mainCategory}/flats`, slug: 'flats' },
        ],
      },
      {
        title: 'Jewelry',
        mainSlug: 'jewelry',
        categories: [
          { label: 'All Jewelry', href: `/${mainCategory}/jewelry`, slug: 'jewelry' },
          { label: 'Necklaces', href: `/${mainCategory}/necklaces`, slug: 'necklaces' },
          { label: 'Rings', href: `/${mainCategory}/rings`, slug: 'rings' },
          { label: 'Earrings', href: `/${mainCategory}/earrings`, slug: 'earrings' },
          { label: 'Bracelets', href: `/${mainCategory}/bracelets`, slug: 'bracelets' },
        ],
      },
      {
        title: 'Accessories',
        mainSlug: 'accessories',
        categories: [
          { label: 'All Accessories', href: `/${mainCategory}/accessories`, slug: 'accessories' },
          { label: 'Belts', href: `/${mainCategory}/belts`, slug: 'belts' },
          { label: 'Scarves', href: `/${mainCategory}/scarves`, slug: 'scarves' },
          { label: 'Hats', href: `/${mainCategory}/hats`, slug: 'hats' },
          { label: 'Sunglasses', href: `/${mainCategory}/sunglasses`, slug: 'sunglasses' },
          { label: 'Wallets', href: `/${mainCategory}/wallets`, slug: 'wallets' },
          { label: 'Gloves', href: `/${mainCategory}/gloves`, slug: 'gloves' },
          { label: 'Keychains', href: `/${mainCategory}/key  chains`, slug: 'keychains' },
          { label: 'Hair Accessories', href: `/${mainCategory}/hair-accessories`, slug: 'hair-accessories' },
          { label: 'Phone Cases', href: `/${mainCategory}/phone-cases`, slug: 'phone-cases' },
          { label: 'Umbrellas', href: `/${mainCategory}/umbrellas`, slug: 'umbrellas' },
        ],
      },
    ],
  } : mainCategory === 'men' ? {
    // men 原有配置（保持不变）
    categoryMap: {
      'mens-handbags': null,
      briefcases: 'Briefcase',
      'messenger-bags': 'Messenger',
      backpacks: 'Backpack',
      'belt-bags': 'Belt Bag',
      'mens-shoes': null,
      sneakers: 'Sneakers',
      loafers: 'Loafers',
      boots: 'Boots',
      oxfords: 'Oxfords',
      watches: null,
      'luxury-watches': 'Luxury',
      'sports-watches': 'Sports',
      'mens-accessories': null,
      ties: 'Ties',
      'pocket-squares': 'Pocket Squares',
      cufflinks: 'Cufflinks',
      wallets: 'Wallets',
      belts: 'Belts',
      sunglasses: 'Sunglasses',
    },
    currentMainGroup: 
      ['mens-handbags', 'briefcases', 'messenger-bags', 'backpacks', 'belt-bags'].includes(subCategory) ? 'handbags' :
      ['mens-shoes', 'sneakers', 'loafers', 'boots', 'oxfords'].includes(subCategory) ? 'shoes' :
      ['watches', 'luxury-watches', 'sports-watches'].includes(subCategory) ? 'watches' :
      ['mens-accessories', 'ties', 'pocket-squares', 'cufflinks', 'wallets', 'belts', 'sunglasses'].includes(subCategory) ? 'accessories' :
      'handbags',
    groups: [
      // men 原有 groups（保持不变）
      {
        title: 'Handbags',
        mainSlug: 'mens-handbags',
        categories: [
          { label: 'All Handbags', href: `/${mainCategory}/mens-handbags`, slug: 'mens-handbags' },
          { label: 'Briefcases', href: `/${mainCategory}/briefcases`, slug: 'briefcases' },
          { label: 'Messenger Bags', href: `/${mainCategory}/messenger-bags`, slug: 'messenger-bags' },
          { label: 'Backpacks', href: `/${mainCategory}/backpacks`, slug: 'backpacks' },
          { label: 'Belt Bags', href: `/${mainCategory}/belt-bags`, slug: 'belt-bags' },
        ],
      },
      {
        title: 'Shoes',
        mainSlug: 'mens-shoes',
        categories: [
          { label: 'All Shoes', href: `/${mainCategory}/mens-shoes`, slug: 'mens-shoes' },
          { label: 'Sneakers', href: `/${mainCategory}/sneakers`, slug: 'sneakers' },
          { label: 'Loafers', href: `/${mainCategory}/loafers`, slug: 'loafers' },
          { label: 'Boots', href: `/${mainCategory}/boots`, slug: 'boots' },
          { label: 'Oxfords', href: `/${mainCategory}/oxfords`, slug: 'oxfords' },
        ],
      },
      {
        title: 'Watches',
        mainSlug: 'watches',
        categories: [
          { label: 'All Watches', href: `/${mainCategory}/watches`, slug: 'watches' },
          { label: 'Luxury Watches', href: `/${mainCategory}/luxury-watches`, slug: 'luxury-watches' },
          { label: 'Sports Watches', href: `/${mainCategory}/sports-watches`, slug: 'sports-watches' },
        ],
      },
      {
        title: 'Accessories',
        mainSlug: 'mens-accessories',
        categories: [
          { label: 'All Accessories', href: `/${mainCategory}/mens-accessories`, slug: 'mens-accessories' },
          { label: 'Ties', href: `/${mainCategory}/ties`, slug: 'ties' },
          { label: 'Pocket Squares', href: `/${mainCategory}/pocket-squares`, slug: 'pocket-squares' },
          { label: 'Cufflinks', href: `/${mainCategory}/cufflinks`, slug: 'cufflinks' },
          { label: 'Wallets', href: `/${mainCategory}/wallets`, slug: 'wallets' },
          { label: 'Belts', href: `/${mainCategory}/belts`, slug: 'belts' },
          { label: 'Sunglasses', href: `/${mainCategory}/sunglasses`, slug: 'sunglasses' },
        ],
      },
    ],
  } : mainCategory === 'small-leather-goods' ? {
    categoryMap: {
      'small-leather-goods': null,
      briefcases: 'Briefcase',
      'messenger-bags': 'Messenger',
      backpacks: 'Backpack',
      'belt-bags': 'Belt Bag',
      'mens-shoes': null,
      sneakers: 'Sneakers',
      loafers: 'Loafers',
      boots: 'Boots',
      oxfords: 'Oxfords'
      // 如需子类后期添加
    },
    currentMainGroup: 'small-leather-goods',
    groups: [
      {
        title: 'Small Leather Goods',
        mainSlug: 'small-leather-goods',
        categories: [
          { label: 'All Small Leather Goods', href: `/${mainCategory}/small-leather-goods`, slug: 'small-leather-goods' },
          // 子类示例：{ label: 'Wallets', href: `/${mainCategory}/wallets`, slug: 'wallets' },
        ],
      },
    ],
  } : mainCategory === 'travel-lifestyle' ? {
    categoryMap: {
      'travel-lifestyle': null,
    },
    currentMainGroup: 'travel-lifestyle',
    groups: [
      {
        title: 'Travel & Lifestyle',
        mainSlug: 'travel-lifestyle',
        categories: [
          { label: 'All Travel & Lifestyle', href: `/${mainCategory}/travel-lifestyle`, slug: 'travel-lifestyle' },
        ],
      },
    ],
  } : mainCategory === 'accessories' ? {
    categoryMap: {
      'accessories': null,
    },
    currentMainGroup: 'accessories',
    groups: [
      {
        title: 'Accessories',
        mainSlug: 'accessories',
        categories: [
          { label: 'All Accessories', href: `/${mainCategory}/accessories`, slug: 'accessories' },
        ],
      },
    ],
  } : mainCategory === 'gifts-personalization' ? {
    categoryMap: {
      'gifts-personalization': null,
    },
    currentMainGroup: 'gifts-personalization',
    groups: [
      {
        title: 'Gifts & Personalization',
        mainSlug: 'gifts-personalization',
        categories: [
          { label: 'All Gifts & Personalization', href: `/${mainCategory}/gifts-personalization`, slug: 'gifts-personalization' },
        ],
      },
    ],
  } : {
    categoryMap: {},
    currentMainGroup: 'handbags',
    groups: [],
  };

  const filterCategory = config.categoryMap[subCategory] ?? null;
  const currentMainGroup = config.currentMainGroup;

  const fetchProducts = async (isInitial = false) => {
    if (loading || (!isInitial && !hasMore)) return;
    setLoading(true);
    setError(null);

    try {
      let q = query(
        collection(db, 'products'),
        where('subCategory', '==', currentMainGroup),
        where('mainCategory', '==', mainCategory),
        orderBy('__name__'),
        limit(PAGE_SIZE)
      );

      if (filterCategory) {
        q = query(q, where('category', '==', filterCategory));
      }

      if (!isInitial && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const newProducts = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const id = doc.id;

        let mainImage = '';
        let hoverImage = '';

        if (data.colorImages && typeof data.colorImages === 'object') {
          let colorArray = data.colorImages.black || Object.values(data.colorImages)[0] || [];
          
          if (Array.isArray(colorArray) && colorArray.length > 0) {
            mainImage = colorArray[0];
            hoverImage = colorArray[1] || colorArray[0];
          }
        }

        const productName = data.name?.trim() || 'Unnamed Product';

        return {
          id,
          name: productName,
          price: parseFloat(data.price) || 0,
          images: [mainImage, hoverImage],
        };
      });

      if (sortBy === 'price-low') newProducts.sort((a, b) => a.price - b.price);
      if (sortBy === 'price-high') newProducts.sort((a, b) => b.price - a.price);

      if (isInitial) {
        setProducts(newProducts);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
      }

      setHasMore(newProducts.length === PAGE_SIZE);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error: any) {
      console.error('Firestore 读取错误:', error);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setProducts([]);
    setLastDoc(null);
    setError(null);
    fetchProducts(true);
  }, [sortBy, pathname]);

  useEffect(() => {
    fetchProducts(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchProducts();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [lastDoc, hasMore, loading]);

  const currentGroup = config.groups.find((group) =>
    group.categories.some((cat) => cat.slug === subCategory)
  ) || config.groups[0] || { categories: [], title: '', mainSlug: '' };

  const activeHref = currentGroup.categories.find((cat) => cat.slug === subCategory)?.href || `/${mainCategory}/${subCategory}`;

  return (
    <>
      <div className="sticky top-32 z-10 bg-white border-b border-gray-100">
        <div className="px-4 lg:px-8 py-10">
          <nav className="text-sm uppercase tracking-widest text-gray-600 mb-8 text-center lg:text-left">
            <Link href={`/${mainCategory}`} className="hover:text-black transition-colors">
              {mainDisplay}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-black font-medium">{currentDisplay}</span>
          </nav>

          <div className="flex justify-end mb-8">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full lg:w-auto border border-gray-300 px-6 py-4 text-sm uppercase tracking-widest bg-white"
            >
              <option value="newest">Sort by Newest</option>
              <option value="price-low">Price Low to High</option>
              <option value="price-high">Price High to Low</option>
            </select>
          </div>

          <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
            <div className="inline-flex gap-6 lg:gap-12 text-gray-600 tracking-widest text-base lg:text-lg">
              {currentGroup.categories.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className={`pb-2 border-b-2 transition-colors ${
                    cat.href === activeHref ? 'text-black border-black font-medium' : 'hover:text-black hover:border-black border-transparent'
                  }`}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>

          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
        </div>
      </div>

      <div className="bg-white">
        <div className="px-4 lg:px-8 py-16">
          {error ? (
            <p className="text-center text-red-600 text-xl py-20">{error}</p>
          ) : loading && products.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-12">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square mb-6 rounded" />
                  <div className="h-6 bg-gray-200 rounded mb-2 mx-auto w-48" />
                  <div className="h-6 bg-gray-200 rounded w-32 mx-auto" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-2xl text-gray-500 mb-8">No products found in this category.</p>
              <Link href={`/${mainCategory}/${currentGroup.mainSlug}`} className="text-black underline uppercase tracking-widest">
                Explore All {currentGroup.title} →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4 lg:gap-12">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group block transition-all duration-300 hover:translate-y-[-8px] hover:shadow-2xl"
                >
                  <div className="relative overflow-hidden bg-gray-50 aspect-square mb-6 rounded-lg">
                    {product.images[0] ? (
                      <>
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          unoptimized={true}
                        />
                        <Image
                          src={product.images[1]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                          unoptimized={true}
                        />
                      </>
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                        No Image
                      </div>
                    )}
                  </div>

                  <h3 className="text-base lg:text-lg font-light text-center tracking-wide">{product.name}</h3>

                  <p className="text-lg lg:text-xl mt-2 text-center font-medium">
                    US${product.price ? product.price.toLocaleString() : 'N/A'}
                  </p>
                </Link>
              ))}
            </div>
          )}

          <div ref={observerTarget} className="py-20 text-center">
            {loading && products.length > 0 && <p className="text-gray-500 uppercase tracking-widest animate-pulse">Loading more products...</p>}
            {!hasMore && products.length > 0 && <p className="text-gray-500 uppercase tracking-widest">You've reached the end of the collection</p>}
          </div>
        </div>
      </div>
    </>
  );
}