'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';

const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function ProductClient({ productId }: { productId: string }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (!productDoc.exists()) {
          setLoading(false);
          return;
        }

        const data = productDoc.data();
        if (!data.isLimited) {
          setLoading(false);
          return;
        }

        const images = data.colorImages
          ? Object.values(data.colorImages).flat() as string[]
          : [data.mainImage || '/images/placeholder.jpg'];

        setProduct({
          ...data,
          id: productId,
          images,
        });
        setLoading(false);
      } catch (error) {
        console.error('Fetch error:', error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-3xl">Loading exclusive piece...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-6xl font-bold tracking-widest mb-8">Exclusive Not Found</h1>
        <p className="text-2xl opacity-80 mb-12">
          This limited edition piece is no longer available.
        </p>
        <Link
          href="/limited"
          className="px-12 py-6 bg-black text-white text-xl uppercase tracking-widest rounded-full hover:opacity-90 transition"
        >
          Explore All Limited Editions
        </Link>
      </div>
    );
  }

  const titleCaseName = toTitleCase(product.name || 'Exclusive Handbag');

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* 限量大标签 */}
        <div className="text-center mb-20">
          <span className="inline-block px-16 py-6 bg-red-600 text-white text-3xl uppercase tracking-widest font-bold rounded-full shadow-2xl">
            Limited Edition — One of a Kind
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* 左侧图片 */}
          <div className="space-y-12">
            <div className="relative aspect-square overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src={product.images[selectedImage] || '/images/placeholder.jpg'}
                alt={titleCaseName}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-6">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square overflow-hidden rounded-2xl shadow-lg transition-all ${
                      selectedImage === idx ? 'ring-4 ring-red-600' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${titleCaseName} - detail ${idx + 1}`}
                      fill
                      sizes="25vw"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 右侧信息 */}
          <div className="flex flex-col justify-center space-y-20">
            <h1 className="text-6xl md:text-8xl font-bold tracking-widest">
              {titleCaseName}
            </h1>

            <p className="text-5xl md:text-6xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
              }).format(product.price)}
            </p>

            <div className="space-y-10 text-xl leading-relaxed opacity-80">
              <p className="text-2xl font-semibold text-red-600">
                Privately curated exclusive — only one available worldwide
              </p>

              <p>
                {product.description || 'A rare treasure in pristine new condition, meticulously sourced for the discerning collector.'}
              </p>

              {product.material && (
                <p>
                  <span className="font-semibold">Material:</span> {product.material}
                </p>
              )}
              {product.color && (
                <p>
                  <span className="font-semibold">Color:</span> {product.color}
                </p>
              )}
              {product.dimensions && (
                <p>
                  <span className="font-semibold">Dimensions:</span> {product.dimensions}
                </p>
              )}
              <p>
                <span className="font-semibold">Condition:</span> {product.condition || 'Pristine New'}
              </p>
            </div>

            <div className="space-y-10">
              <Link
                href={`/contact?inquiry=limited&product=${product.id}`}
                className="block w-full text-center px-24 py-12 bg-black text-white hover:opacity-90 transition rounded-full text-3xl uppercase tracking-widest font-bold shadow-2xl"
              >
                Inquire for Acquisition
              </Link>

              <p className="text-center text-lg opacity-60">
                Discreet worldwide shipping from Los Angeles • Full authenticity documentation provided
              </p>
            </div>
          </div>
        </div>

        {/* 认证说明 */}
        <div className="mt-40 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-widest uppercase mb-12">
            Authentication & Provenance
          </h2>
          <p className="text-xl leading-relaxed opacity-80">
            This exclusive piece has been personally verified by our Los Angeles experts. Complete provenance and authenticity certificate available upon acquisition.
          </p>
        </div>
      </div>
    </div>
  );
}