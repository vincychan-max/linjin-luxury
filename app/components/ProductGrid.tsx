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

    const snapshot = await getDocs(q);
    const newProducts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Product));

    setProducts(prev => [...prev, ...newProducts]);
    setLastCreatedAt(snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].data().created_at : null);
    setHasMore(snapshot.docs.length === 12);
    setLoading(false);
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

  if (products.length === 0) {
    return <p className="text-center text-3xl py-32">No products found</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pb-32">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
        {products.map((product, index) => {
          const priceValue = typeof product.price === 'number' ? product.price : Number(product.price);
          const displayPrice = Number.isFinite(priceValue) ? priceValue : 0;
          return (
          <div
            key={product.id}
            ref={index === products.length - 1 ? lastProductRef : null}
            className="group"
          >
            <Link href={`/product/${product.id}`}>
              <div className="aspect-square overflow-hidden rounded-2xl shadow-xl mb-6">
                <Image
                  src={product.images[0] || '/images/placeholder.jpg'}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  placeholder="blur"
                  blurDataURL="/images/placeholder-blur.jpg"
                />
              </div>
              <h3 className="text-2xl uppercase tracking-widest">{product.name}</h3>
              <p className="text-3xl mt-4">${displayPrice.toFixed(2)}</p>
            </Link>
          </div>
          );
        })}
      </div>

      {loading && (
        <p className="text-center text-2xl mt-16">Loading more...</p>
      )}

      {!hasMore && (
        <p className="text-center text-xl mt-16 opacity-70">No more products</p>
      )}
    </div>
  );
}