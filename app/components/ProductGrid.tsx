'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, where, orderBy, startAfter, limit, getDocs } from "firebase/firestore";
import { db } from '@/lib/firebase';

type Product = {
  id: string;
  name: string;  
  price: number;
  images: string[];
  // 加你的其他字段，比如 description, category 等
};

interface Props {
  initialProducts: Product[];
  initialLastCreatedAt: any;
  category?: string;
  gender?: string;
}

export default function ProductGrid({ initialProducts, initialLastCreatedAt, category, gender }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [lastCreatedAt, setLastCreatedAt] = useState<any>(initialLastCreatedAt);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductRef = useRef<HTMLDivElement>(null);

  const loadMore = async () => {
    if (loading || !hasMore || !lastCreatedAt) return;
    setLoading(true);

    let q = query(
      collection(db, 'products'),
      orderBy('created_at', 'desc'),
      startAfter(lastCreatedAt),
      limit(12)
    );

    if (category) q = query(q, where('category', '==', category));
    if (gender) q = query(q, where('gender', '==', gender));

    try {
      const snapshot = await getDocs(q);
      const newProducts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Untitled',
          price: Number(data.price) || 0,
          images: data.images || [],
        } as Product;
      });

      setProducts(prev => [...prev, ...newProducts]);
      setLastCreatedAt(snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].data().created_at : null);
      setHasMore(snapshot.docs.length === 12);
    } catch (error) {
      console.error('Load more products error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore();
      }
    });

    if (lastProductRef.current) observer.current.observe(lastProductRef.current);

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [lastCreatedAt, hasMore, loading]);

  // 空状态处理（尤其是 men 分类目前无产品时友好提示）
  if (products.length === 0) {
    const isMen = gender === 'men';
    return (
      <div className="text-center py-32">
        <h2 className="text-5xl md:text-7xl font-bold tracking-widest uppercase mb-8 opacity-80">
          {isMen ? "Men's Collection Coming Soon" : "No Products Found"}
        </h2>
        <p className="text-xl md:text-2xl tracking-wider opacity-70 max-w-2xl mx-auto">
          {isMen 
            ? "Stay tuned for our premium men's accessories curated from Los Angeles. Exclusive pieces arriving soon."
            : "Try adjusting your filters or check back later for new arrivals."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pb-32">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-20 justify-items-center">
        {products.map((product, index) => {
          const priceValue = typeof product.price === 'number' ? product.price : Number(product.price) || 0;
          const displayImage = product.images?.[0] || '/images/placeholder.jpg';

          return (
            <div
              key={product.id}
              ref={index === products.length - 1 ? lastProductRef : null}
              className="group block max-w-sm w-full"
            >
              <Link href={`/product/${product.id}`}>
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 rounded-3xl shadow-2xl mb-10">
                  <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 45vw, 25vw"
                    placeholder="blur"
                    blurDataURL="/images/placeholder-blur.jpg"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold tracking-widest text-center">
                  {product.name}
                </h3>
                <p className="mt-4 text-3xl md:text-4xl font-bold text-center">
                  ${priceValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </p>
              </Link>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="text-center mt-24">
          <p className="text-2xl tracking-widest uppercase opacity-70">Loading more...</p>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="text-center mt-24">
          <p className="text-xl tracking-widest uppercase opacity-70">No more products</p>
        </div>
      )}
    </div>
  );
}