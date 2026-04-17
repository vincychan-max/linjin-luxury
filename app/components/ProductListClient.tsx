'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

/** ====================== 类型 ====================== */
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  isNew?: boolean;
  displayImages?: string[];
}

interface NormalizedProduct extends Product {
  images: string[];
}

interface Props {
  initialProducts: Product[];
  collectionTitle?: string;
}

const FALLBACK_IMAGE = '/images/placeholder.jpg';

/** ====================== Price Formatter（避免重复创建） ====================== */
const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/** ====================== Component ====================== */
export default function ProductListClient({
  initialProducts,
  collectionTitle = 'Collections',
}: Props) {
  /** ====================== 数据规范化 ====================== */
  const products: NormalizedProduct[] = useMemo(() => {
    return (initialProducts || []).map((p) => {
      const images =
        Array.isArray(p.displayImages) && p.displayImages.length > 0
          ? p.displayImages
          : [FALLBACK_IMAGE];

      return {
        ...p,
        images,
      };
    });
  }, [initialProducts]);

  if (!products.length) {
    return (
      <div className="bg-white min-h-[60vh] flex items-center justify-center">
        <p className="text-zinc-400 text-[10px] uppercase tracking-[0.5em] animate-pulse">
          No pieces found.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-[1800px] mx-auto px-6 pb-24">
        {/* Header */}
        <header className="py-24">
          <h2 className="text-3xl md:text-4xl font-extralight tracking-[0.4em] uppercase text-center text-zinc-900">
            {collectionTitle}
          </h2>
        </header>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
          {products.map((product, index) => {
            const mainImage = product.images[0];
            const hoverImage = product.images.length > 1 ? product.images[1] : null;

            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group block"
                prefetch
              >
                {/* Image container */}
                <div className="aspect-[3/4] relative bg-[#f9f9f9] mb-6 overflow-hidden">
                  {/* Main image */}
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className={`object-cover transition-all duration-700 ease-out
                      ${hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
                    priority={index < 4}
                    quality={85}
                  />

                  {/* Hover image */}
                  {hoverImage && (
                    <Image
                      src={hoverImage}
                      alt={`${product.name} alternate view`}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105"
                      quality={85}
                    />
                  )}

                  {/* Badge */}
                  {product.isNew && (
                    <div className="absolute top-4 left-4 bg-black text-white text-[9px] px-2.5 py-1 uppercase tracking-[0.1em] font-medium">
                      New
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="text-center space-y-2.5 px-2">
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-medium text-zinc-900 px-4 min-h-[2.5em] flex items-center justify-center leading-relaxed group-hover:text-zinc-500 transition-colors duration-300">
                    {product.name}
                  </h3>

                  <p className="text-[13px] tracking-widest text-zinc-400 font-light">
                    {priceFormatter.format(product.price)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}