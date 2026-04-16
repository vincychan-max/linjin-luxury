import React from 'react';
import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Shipping & Delivery | LINJIN LUXURY',
  description: 'Global delivery protocols and artisanal handling information for LINJIN LUXURY creations.',
};

export default function ShippingPolicy() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "LINJIN LUXURY Global Delivery",
    "provider": { "@type": "Brand", "name": "LINJIN LUXURY" },
    "description": "Premium international shipping via DHL, FedEx, and UPS with bespoke artisanal packaging."
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-48 min-h-screen selection:bg-black selection:text-white">
      <Script id="shipping-jsonld" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>

      {/* Header Section - 稍微提升视觉冲击力 */}
      <header className="text-center mb-32">
        <h1 className="text-[16px] md:text-[20px] tracking-[10px] uppercase font-extralight text-black">
          Shipping & Passage
        </h1>
        <div className="w-8 h-px bg-black mx-auto mt-8 mb-4 opacity-20"></div>
        <p className="text-[10px] tracking-[3px] text-gray-400 uppercase">
          From Atelier to Your Collection
        </p>
      </header>

      {/* Content Section */}
      <div className="space-y-20 text-[13px] leading-[2] font-light text-black/80 tracking-wide uppercase">
        
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <h2 className="text-[11px] tracking-[4px] font-medium text-black">
            Atelier Finishing
          </h2>
          <div className="md:col-span-2 space-y-6">
            <p>
              Every LINJIN LUXURY creation undergoes a meticulous quality inspection within our private atelier. 
              To ensure each piece arrives in its pristine original tension, please allow 1–3 business days for final conditioning and artisanal finishing prior to dispatch.
            </p>
            <p className="text-gray-400">
              For bespoke orders or archival limited series, this preparation ensures every detail aligns with our heritage standards of craft.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <h2 className="text-[11px] tracking-[4px] font-medium text-black">
            The Presentation
          </h2>
          <div className="md:col-span-2">
            <p>
              We honor each creation with a specific packaging protocol. Most archival handbags are presented in our 
              <strong> signature rigid box and a 100% heavy-gauge cotton dust bag</strong>. 
            </p>
            <p className="mt-4 text-gray-400">
              Smaller leather goods or essential collections are dispatched in archival-grade soft protective pouches. 
              Please refer to individual product descriptions for specific packaging inclusions.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <h2 className="text-[11px] tracking-[4px] font-medium text-black">
            Global Passage
          </h2>
          <div className="md:col-span-2 space-y-6">
            <p>
              We utilize premier global carriers including **DHL, FedEx, and UPS** to ensure maximum security. 
              By leveraging our strategic logistics nodes in **Singapore, Thailand, and Los Angeles**, we optimize global transit routes for seamless customs clearance.
            </p>
            <div className="pt-4">
              <p className="italic text-gray-400">
                Estimated Delivery: 5-10 business days worldwide.
              </p>
              <p className="mt-2 text-[10px] text-gray-400 italic">
                * Real-time tracking is provided via email once the creation has departed our atelier.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <h2 className="text-[11px] tracking-[4px] font-medium text-black">
            Duties & Taxes
          </h2>
          <div className="md:col-span-2">
            <p>
              International shipments may be subject to import duties and local taxes. 
              These remains the responsibility of the recipient. LINJIN LUXURY operates on a DDU (Delivery Duty Unpaid) basis for all global direct orders.
            </p>
          </div>
        </section>

        {/* Footer Contact */}
        <section className="pt-20 border-t border-black/5 text-center">
          <p className="text-[10px] text-gray-400 tracking-[2px]">
            FOR LOGISTICS INQUIRIES
          </p>
          <p className="mt-4 font-medium text-black tracking-[1px]">
            linjinluxury@gmail.com
          </p>
        </section>

      </div>
    </div>
  );
}