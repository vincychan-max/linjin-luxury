'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function ProductListClient({ initialProducts, collectionTitle }: any) {
  return (
    <div className="bg-white min-h-screen pt-24">
      <div className="max-w-[1800px] mx-auto px-6 pb-24">
        <h1 className="text-3xl font-extralight tracking-[0.4em] uppercase text-center py-20">
          {collectionTitle || 'Collections'}
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {initialProducts?.map((product: any) => (
            <Link key={product.id} href={`/product/${product.slug}`} className="group">
              <div className="aspect-[3/4] relative bg-[#f7f7f7] mb-4">
                {product.images?.[0]?.url && (
                  <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                )}
              </div>
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-widest">{product.name}</p>
                <p className="text-xs text-gray-500">${product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}