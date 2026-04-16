import { notFound } from "next/navigation";
import HeroSection from "./components/HeroSection";
import LimitedGallery from "./components/LimitedGallery";
import LimitedInfo from "./components/LimitedInfo";
import Script from "next/script"; // 用于 JSON-LD

async function getProduct(slug: string) {
  const endpoint = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT!;
  
  /**
   * 🌟 核心修正：
   * 1. 删除了根层级的 images 字段。
   * 2. 增加了 variants 查询，从变体中获取图片。
   */
  const query = `
    query GetProduct($slug: String!) {
      product(where: {slug: $slug}) {
        name
        price
        description { html, text }
        isLimited
        slug
        # 从变体中抓取图片
        variants(first: 1) {
          ... on ProductVariant {
            images {
              url
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { slug } }),
      next: { revalidate: 3600 }, 
    });
    const json = await res.json();
    const product = json.data?.product;

    if (!product) return null;

    /**
     * 🌟 数据适配：
     * 为了让下方的组件（HeroSection, LimitedGallery）不需要改动代码，
     * 我们在这里手动把第一个变体的图片“转换”回原来的 images 格式。
     */
    return {
      ...product,
      images: product.variants?.[0]?.images || []
    };
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
    "image": product.images?.map((img: any) => img.url) || [],
    "description": product.description?.text || "",
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

      {/* 1. 全屏头图 */}
      <section className="relative w-full">
        <HeroSection product={product} />
      </section>

      {/* 2. 沉浸式内容区 */}
      <div className="flex flex-col lg:flex-row relative">
        
        {/* 左侧画廊 */}
        <div className="w-full lg:w-[62%] border-b lg:border-b-0 lg:border-r border-white/5 order-2 lg:order-1">
          <LimitedGallery images={product.images?.map((img: any) => img.url) || []} />
        </div>

        {/* 右侧信息 */}
        <div className="w-full lg:w-[38%] relative order-1 lg:order-2">
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