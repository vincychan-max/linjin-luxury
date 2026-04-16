import React from 'react';

export const metadata = {
  title: "Product Care | Linjin Luxury",
  description:
    "Learn how to care for your Linjin Luxury handbags and leather goods to preserve their beauty and longevity.",
};

export default function ProductCare() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 min-h-screen">
      <header className="text-center mb-20 border-b border-black/5 pb-12">
        <h1 className="text-[14px] tracking-[8px] uppercase font-light text-black">Product Care</h1>
        <p className="text-[10px] tracking-[2px] text-gray-400 uppercase mt-4">Enduring Elegance</p>
      </header>
      <div className="space-y-12 text-[13px] leading-[1.8] font-light text-black tracking-wide">
        <section>
          <h2 className="text-[11px] tracking-[4px] uppercase font-medium mb-6">Preservation</h2>
          <p>Our creations are crafted from premium natural leathers. To maintain the leather&apos;s beauty, avoid prolonged exposure to direct light, heat, or humidity. Should the leather come into contact with water, wipe it immediately with a soft, lint-free cloth.</p>
        </section>
        <section>
          <h2 className="text-[11px] tracking-[4px] uppercase font-medium mb-6">Storage</h2>
          <p>When not in use, we recommend stuffing the bag with tissue paper to maintain its shape and storing it in the provided protective dust bag.</p>
        </section>
        <section className="pt-10 border-t border-black/5">
  <h2 className="text-[11px] tracking-[4px] uppercase font-medium mb-6">Expert Consultation</h2>
  <p>
    A LINJIN LUXURY creation is designed to be a long-standing companion. 
    To assist in preserving the character of your leather piece, our team remains 
    available to provide professional care guidance and maintenance advice 
    throughout your journey with our brand.
  </p>
</section>
      </div>
    </div>
  );
}