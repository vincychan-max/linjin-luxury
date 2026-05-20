import { Metadata } from 'next';
import FaqClient from './FaqClient';
import Script from 'next/script';

const SITE_URL = 'https://www.linjinluxury.com';

export const metadata: Metadata = {
  title: 'Client Services | Global Support | LINJIN LUXURY',
  description: 'LINJIN LUXURY Client Services: Access official studio protocols covering authenticity verification, global shipping, and bespoke atelier leather orders.',
  alternates: { canonical: `${SITE_URL}/faq` },
};

const faqData = [
  { id: "authenticity", title: "Provenance & Authenticity", items: [{ question: "How do you ensure item authenticity?", answer: "Each piece in our archive undergoes a rigorous multi-stage verification process at our atelier, ensuring 100% authenticity and material integrity before shipment." }, { question: "Are the products brand new?", answer: "We offer both newly crafted pieces from our M2C production line and curated limited-edition archive pieces. Condition details are specified on each product page." }] },
  { id: "logistics", title: "Logistics & Global Delivery", items: [{ question: "Which shipping methods are available?", answer: "We utilize premium white-glove couriers (DHL Express, FedEx Priority) specializing in high-value luxury transportation to ensure secure global delivery." }, { question: "How are customs and duties handled?", answer: "For major regions including the US, Singapore, and EU, we provide DDP (Delivered Duty Paid) options or full documentation support for seamless customs clearance." }] },
  { id: "bespoke", title: "Bespoke & Atelier Orders", items: [{ question: "Can I request a custom leather design?", answer: "Yes. Our atelier accepts private commissions for bespoke handbags and private label production. Please contact our concierge to discuss your specifications." }, { question: "What is the lead time for bespoke pieces?", answer: "Standard bespoke production typically requires 4–8 weeks, depending on leather sourcing and complexity of the craftsmanship." }] },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.flatMap((section) =>
      section.items.map((item) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": { "@type": "Answer", "text": item.answer },
      }))
    ),
  };

  return (
    <main className="min-h-screen bg-white pt-32 md:pt-48 pb-20 px-6 md:px-12 lg:px-24 selection:bg-black selection:text-white">
      {/* 统一 SEO 注入点 */}
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <header className="mb-24 border-b border-black/5 pb-16">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
          <div className="max-w-4xl">
            <p className="text-[10px] tracking-[0.6em] uppercase text-zinc-400 mb-6 font-medium">LJL Protocol // Support</p>
            <h1 className="text-[14vw] md:text-[90px] leading-[0.85] font-light tracking-tighter text-zinc-900 uppercase">
              Client<br /><span className="italic font-serif lowercase text-zinc-400">services</span>
            </h1>
          </div>
          <div className="max-w-[280px] pb-2">
            <p className="text-[11px] leading-[1.8] uppercase tracking-widest text-zinc-500 font-light border-l border-zinc-200 pl-6">
              Official atelier guidelines regarding authentication, global logistics and private bespoke acquisitions.
            </p>
          </div>
        </div>
      </header>

      <FaqClient faqData={faqData} />
    </main>
  );
}