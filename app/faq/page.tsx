import { Metadata } from 'next';
import FaqClient from './FaqClient';

// 1. 动态生成元数据 (SEO & GEO 核心)
export async function generateMetadata(): Promise<Metadata> {
  const siteTitle = "Client Services | LINJIN LUXURY ARCHIVE";
  const siteDescription = "Refining the standards of luxury acquisition. Access our Studio Protocols regarding provenance, global logistics, and bespoke inquiries.";

  return {
    title: siteTitle,
    description: siteDescription,
    keywords: [
      "Luxury Acquisition", 
      "Studio Protocols", 
      "Authenticity Provenance", 
      "Global Logistics", 
      "Bespoke Inquiries", 
      "LINJIN LUXURY FAQ"
    ],
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      type: 'website',
      // images: ['/path-to-your-brand-image.jpg'], // 建议加入品牌图片链接
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: siteDescription,
    },
    // 告知搜索引擎和 AI 这是一个正式的存档/支持页面
    alternates: {
      canonical: 'https://yourdomain.com/faq', 
    }
  };
}

export default function FaqPage() {
  // 这里是您的 FAQ 数据
  const faqData = [
    {
      title: "Product & Authenticity",
      id: "authenticity",
      items: [
        { 
          question: "Are the items authentic?", 
          answer: "Every acquisition undergoes a rigorous multi-step provenance verification protocol to ensure absolute authenticity before entering the archive." 
        },
        { 
          question: "Do you sell pre-owned items?", 
          answer: "Our archive specializes in both new-season acquisitions and rare, pre-vetted archival pieces from private collections." 
        }
      ]
    },
    {
      title: "Shipping & Logistics",
      id: "shipping",
      items: [
        { 
          question: "Which carriers do you use?", 
          answer: "We utilize specialized white-glove logistics partners for all global shipments, ensuring secured transit for high-value items." 
        },
        { 
          question: "Do you ship internationally?", 
          answer: "Yes, our global logistics network covers major regions with full insurance and customs management." 
        }
      ]
    },
    {
      title: "Orders & Payment",
      id: "orders",
      items: [
        { 
          question: "How do I place a private order?", 
          answer: "For bespoke inquiries and private acquisitions, please contact our concierge via the secure messaging protocol." 
        }
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-white pt-32 pb-20 px-6 md:px-12 lg:px-24">
      {/* 顶部标题区 - 保持与品牌图例一致的风格 */}
      <div className="mb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <p className="text-[10px] tracking-[0.5em] uppercase font-bold text-black/40 mb-4">Support Archive</p>
            <h1 className="text-[60px] md:text-[90px] leading-[0.8] font-light tracking-tighter text-black">
              CLIENT<br />
              <span className="italic font-serif low-case ml-2">services</span>
            </h1>
          </div>
          <div className="max-w-[300px]">
            <p className="text-[12px] leading-relaxed tracking-wide text-black font-medium uppercase">
              REFINING THE STANDARDS OF LUXURY ACQUISITION AND STUDIO PROTOCOLS.
            </p>
          </div>
        </div>
        <div className="w-full h-[1px] bg-black mt-16 opacity-10"></div>
      </div>

      {/* 渲染已优化搜索、全黑字体和行距的客户端组件 */}
      <FaqClient faqData={faqData} />
    </main>
  );
}