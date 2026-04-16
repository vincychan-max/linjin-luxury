import React from 'react';

export default function ReturnsPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 min-h-screen">
      {/* Header Section */}
      <header className="text-center mb-20 border-b border-black/5 pb-12">
        <h1 className="text-[14px] tracking-[8px] uppercase font-light text-black">
          Returns & Exchanges
        </h1>
        <p className="text-[10px] tracking-[2px] text-gray-400 uppercase mt-4">
          Our Commitment to Quality
        </p>
      </header>

      {/* Content Section */}
      <div className="space-y-12 text-[13px] leading-[1.8] font-light text-black tracking-wide">
        
        <section>
          <h2 className="text-[11px] tracking-[4px] uppercase font-medium mb-6">
            14-Day Return Policy
          </h2>
          <p>
            LINJIN LUXURY is dedicated to your satisfaction. If you are not entirely pleased with your selection, 
            you may request a return within 14 days of the delivery date. To be eligible, your creation must 
            be in its original condition: unworn, unused, and accompanied by all original tags, protective 
            packaging, and dust bags.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] tracking-[4px] uppercase font-medium mb-6">
            Return Shipping & Costs
          </h2>
          <p>
            Please be advised that for returns due to personal preference, **the cost of return shipping and 
            any associated import duties or taxes are the sole responsibility of the customer.** </p>
          <p className="mt-4">
            We strongly recommend utilizing a trackable and insured shipping service. LINJIN LUXURY cannot 
            be held liable for any items lost or damaged during the transit back to our designated facility.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] tracking-[4px] uppercase font-medium mb-6">
            Manufacturing Defects
          </h2>
          <p>
            In the rare instance of a manufacturing defect or an incorrect shipment, LINJIN LUXURY will 
            assume full responsibility for the return logistics and associated costs. Please contact our 
            concierge team immediately with photographic evidence to facilitate a priority resolution.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] tracking-[4px] uppercase font-medium mb-6">
            Exclusions
          </h2>
          <p>
            Please note that bespoke creations, personalized items (such as those with monograms), 
            and products showing signs of use or alteration are considered final sale and are 
            not eligible for return or exchange.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] tracking-[4px] uppercase font-medium mb-6">
            Refund Process
          </h2>
          <p>
            Once our artisans have inspected and approved the returned item, your refund will be 
            processed to the original payment method within 7-10 business days. Please note that 
            original shipping fees are non-refundable.
          </p>
        </section>

        <section className="pt-10 border-t border-black/5">
          <p className="text-[11px] text-gray-400 text-center italic">
            To initiate a return, please contact our concierge at 
            <span className="ml-2 font-medium text-black uppercase tracking-widest">linjinluxury@gmail.com</span>
          </p>
        </section>

      </div>
    </div>
  );
}