import { Metadata } from 'next';
import FaqClient from './FaqClient';
import Script from 'next/script';

const SITE_URL = 'https://www.linjinluxury.com';

/** ====================== Metadata ====================== */
export const metadata: Metadata = {
  title: 'Client Services | Global Support | LINJIN LUXURY',
  description:
    'Access studio protocols covering authenticity verification, international logistics, and bespoke atelier orders.',
  keywords: [
    'luxury authentication',
    'LINJIN LUXURY support',
    'bespoke leather orders',
    'global shipping luxury goods',
    'M2C luxury services',
  ],
  alternates: {
    canonical: `${SITE_URL}/faq`,
  },
  openGraph: {
    title: 'Client Services | LINJIN LUXURY',
    description: 'Professional protocols for authentication and logistics.',
    url: `${SITE_URL}/faq`,
    type: 'website',
  },
};

/** ====================== FAQ DATA (修正：已添加 ID) ====================== */
const faqData = [
  {
    id: "authenticity", // 🌟 必须添加 ID 字段以匹配 FaqClient 的 FaqSection 接口
    title: "Provenance & Authenticity",
    items: [
      {
        question: "How do you ensure item authenticity?",
        answer:
          "Each piece in our archive undergoes a rigorous multi-stage verification process at our atelier, ensuring 100% authenticity and material integrity before shipment.",
      },
      {
        question: "Are the products brand new?",
        answer:
          "We offer both newly crafted pieces from our M2C production line and curated limited-edition archive pieces. Condition details are specified on each product page.",
      },
    ],
  },
  {
    id: "logistics", // 🌟 必须添加 ID 字段
    title: "Logistics & Global Delivery",
    items: [
      {
        question: "Which shipping methods are available?",
        answer:
          "We utilize premium white-glove couriers (DHL Express, FedEx Priority) specializing in high-value luxury transportation to ensure secure global delivery.",
      },
      {
        question: "How are customs and duties handled?",
        answer:
          "For major regions including the US, Singapore, and EU, we provide DDP (Delivered Duty Paid) options or full documentation support for seamless customs clearance.",
      },
    ],
  },
  {
    id: "bespoke", // 🌟 必须添加 ID 字段
    title: "Bespoke & Atelier Orders",
    items: [
      {
        question: "Can I request a custom leather design?",
        answer:
          "Yes. Our atelier accepts private commissions for bespoke handbags and private label production. Please contact our concierge to discuss your specifications.",
      },
      {
        question: "What is the lead time for bespoke pieces?",
        answer:
          "Standard bespoke production typically requires 4–8 weeks, depending on leather sourcing and complexity of the craftsmanship.",
      },
    ],
  },
];

/** ====================== PAGE ====================== */
export default function FaqPage() {
  // 生成 FAQ 结构化数据
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.flatMap((section) =>
      section.items.map((item) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer,
        },
      }))
    ),
  };

  return (
    <main className="min-h-screen bg-white pt-32 md:pt-48 pb-20 px-6 md:px-12 lg:px-24 selection:bg-black selection:text-white">
      
      {/* 结构化数据 */}
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* HEADER SECTION */}
      <header className="mb-24 border-b border-black/5 pb-16">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
          <div className="max-w-4xl">
            <p className="text-[10px] tracking-[0.6em] uppercase text-zinc-400 mb-6 font-medium">
              LJL Protocol // Support
            </p>

            <h1 className="text-[14vw] md:text-[90px] leading-[0.85] font-light tracking-tighter text-zinc-900 uppercase">
              Client<br />
              <span className="italic font-serif lowercase text-zinc-400">services</span>
            </h1>
          </div>

          <div className="max-w-[280px] pb-2">
            <p className="text-[11px] leading-relaxed uppercase tracking-widest text-zinc-500 font-light border-l border-zinc-200 pl-6">
              Official atelier guidelines regarding authentication, global logistics and private bespoke acquisitions.
            </p>
          </div>
        </div>
      </header>

      {/* CLIENT INTERACTION SECTION */}
      <div className="max-w-7xl mx-auto">
        <FaqClient faqData={faqData} />
      </div>

      {/* FOOTER CONTACT BRIDGE */}
      <footer className="mt-40 pt-20 border-t border-zinc-50 text-center">
        <p className="text-[10px] tracking-[0.4em] text-zinc-300 uppercase mb-8">
          Further Inquiries
        </p>
        <a 
          href="mailto:concierge@linjinluxury.com" 
          className="text-[13px] tracking-[0.2em] text-zinc-900 hover:text-zinc-400 transition-colors duration-500 underline underline-offset-8"
        >
          Contact Our Concierge
        </a>
      </footer>

    </main>
  );
}