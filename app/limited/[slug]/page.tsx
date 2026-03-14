import { notFound } from "next/navigation";
import HeroSection from "./components/HeroSection";
import LimitedGallery from "./components/LimitedGallery";
import LimitedInfo from "./components/LimitedInfo";
import Script from "next/script"; // 用于 JSON-LD

async function getProduct(slug: string) {
  const endpoint = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT!;
  const query = `
    query GetProduct($slug: String!) {
      product(where: {slug: $slug}) {
        name
        price
        description { html, text }
        isLimited
        slug
        images { url }
      }
    }
  `;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { slug } }),
      // --- ISR 核心设置：每 1 小时后台静默更新一次数据 ---
      next: { revalidate: 3600 }, 
    });
    const json = await res.json();
    return json.data?.product;
  } catch (error) {
    return null;
  }
}

export default async function LimitedProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || !product.isLimited) notFound();

  // --- 生成 Google 识别的 JSON-LD 数据 ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images.map((img: any) => img.url),
    "description": product.description.text,
    "brand": {
      "@type": "Brand",
      "name": "Privé Archive"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/LimitedAvailability"
    }
  };

  return (
    <main className="bg-[#050505] min-h-screen text-white selection:bg-[#d4af37]/30 overflow-x-hidden">
      {/* 结构化数据注入 */}
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. 全屏头图：手机端适配高度 (h-[80vh] vs lg:h-screen) */}
      <section className="relative w-full">
        <HeroSection product={product} />
      </section>

      {/* 2. 沉浸式内容区：手机端 flex-col，大屏 flex-row */}
      <div className="flex flex-col lg:flex-row relative">
        
        {/* 左侧画廊：在手机上移除右边框，增加垂直间距 */}
        <div className="w-full lg:w-[62%] border-b lg:border-b-0 lg:border-r border-white/5 order-2 lg:order-1">
          <LimitedGallery images={product.images.map((img: any) => img.url)} />
        </div>

        {/* 右侧信息：手机端位于图片下方，增加 Px 间距 */}
        <div className="w-full lg:w-[38%] relative order-1 lg:order-2">
          {/* Sticky 逻辑：
              - 手机端 (默认): 相对定位，随页面滚动
              - 电脑端 (lg): 固定悬停在屏幕右侧
          */}
          <div className="relative lg:sticky lg:top-0 lg:h-screen p-6 sm:p-10 md:p-16 xl:p-24 flex flex-col justify-center bg-[#050505]">
            <LimitedInfo product={product} />
          </div>
        </div>
      </div>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-[9px] tracking-[1.2em] uppercase opacity-20 italic">
          Privé Archive // All Rights Reserved
        </p>
      </footer>
    </main>
  );
}