// app/product/[id]/components/ProductOptions.tsx
'use client';

import { useMemo } from 'react';
import Image from 'next/image';

interface ProductOptionsProps {
  product: any;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  openContactModal: () => void;
}

export default function ProductOptions({
  product,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  openContactModal,
}: ProductOptionsProps) {
  const isValidUrl = (str: any): str is string => {
    if (typeof str !== 'string' || str.trim() === '') return false;
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const fallbackImages = useMemo<string[]>(() => {
    return Array.isArray(product.images)
      ? product.images.filter((url: any) => isValidUrl(url))
      : [];
  }, [product.images]);

  return (
    <>
      {/* Available Colors */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <p className="text-2xl uppercase tracking-widest mb-8">Available Colors</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-8 md:gap-12 justify-center">
            {product.colors.map((color: string) => {
              const colorKey = color.toLowerCase();
              const colorCandidate = product.colorImages?.[colorKey]?.[0];
              const colorPreview = isValidUrl(colorCandidate)
                ? colorCandidate
                : fallbackImages[0] || '/images/placeholder.jpg';

              return (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                  }}
                  className="group relative"
                >
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl aspect-[3/4] transition-all duration-300">
                    <Image
                      src={colorPreview}
                      alt={color}
                      fill
                      sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 25vw"
                      loading="lazy"
                      quality={95}
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <p
                    className={`text-center mt-6 uppercase tracking-widest text-lg transition-all ${
                      selectedColor === color ? 'font-bold text-black' : 'text-gray-600'
                    }`}
                  >
                    {color}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Sizes */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <p className="text-2xl uppercase tracking-widest mb-8">Available Sizes</p>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {product.sizes.map((size: string) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-8 py-6 md:px-12 md:py-8 border-2 uppercase tracking-widest text-lg md:text-xl transition ${
                  selectedSize === size
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:border-black'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Service Information */}
      <div className="space-y-12 text-xl pt-16 border-t border-gray-300">
        <div>
          <p className="font-semibold uppercase tracking-widest mb-2">
            Estimated Complimentary Express Delivery or Local Pickup in Los Angeles
          </p>
          <p>Next day delivery in Los Angeles area or complimentary in-store pickup.</p>
        </div>

        <div>
          <button
            onClick={openContactModal}
            className="font-semibold uppercase tracking-widest mb-2 flex items-center gap-4 transition"
          >
            <span className="text-2xl">☎</span> Contact Us
          </button>
          <p>Our Los Angeles client advisors are available to assist you with authentic luxury inquiries.</p>
        </div>

        <div>
          <p className="font-semibold uppercase tracking-widest mb-2 flex items-center gap-4">
            <span className="text-2xl">📍</span> Book an Appointment in Los Angeles
          </p>
          <p>Complimentary in-store viewing and pickup at our Los Angeles location.</p>
        </div>

        <details className="group">
          <summary className="flex justify-between items-center cursor-pointer py-4">
            <p className="font-semibold uppercase tracking-widest text-xl flex items-center gap-4">
              <span className="text-3xl group-open:rotate-45 transition-transform">+</span> Linjin Luxury Services
            </p>
          </summary>
          <div className="pt-6 text-xl leading-relaxed">
            <p>
              Authenticity Guarantee for all new premium luxury handbags, Complimentary Express Shipping,
              Complimentary Exchanges & Returns, Secure Payments, Signature Packaging, and personalized service
              from Linjin Luxury in Los Angeles.
            </p>
          </div>
        </details>
      </div>
    </>
  );
}