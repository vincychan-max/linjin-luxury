import { notFound } from "next/navigation";
import { Metadata } from "next";
import Script from "next/script";
import { hygraph } from "@/lib/hygraph";   // 推荐统一使用这个

import HeroSection from "./components/HeroSection";
import LimitedGallery from "./components/LimitedGallery";
import LimitedInfo from "./components/LimitedInfo";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: { html: string; text: string } | null;
  isLimited: boolean;
  variants: {
    images: { url: string }[];
  }[];
}

interface Props {
  params: Promise<{ slug: string }>;
}

/** ====================== 动态 Metadata ====================== */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || !product.isLimited) {
    return {
      title: "Product Not Found | LINJIN LUXURY",
    };
  }

  return {
    title: `${product.name} | The Archive | LINJIN LUXURY`,
    description: product.description?.text?.slice(0, 160) || "Exclusive limited edition leather good from LINJIN LUXURY Archive.",
    alternates: {
      canonical: `https://www.linjinluxury.com/limited/${slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.description?.text?.slice(0, 160),
      images: [{ url: product.variants?.[0]?.images?.[0]?.url || "" }],
      type: "website",
    },
  };
}

/** ====================== 获取产品数据 ====================== */
async function getProduct(slug: string) {
  try {
    const { product } = await hygraph.request<{ product: Product | null }>(`
      query GetLimitedProduct($slug: String!) {
        product(where: { slug: $slug }, stage: PUBLISHED) {
          id
          name
          slug
          price
          description { html text }
          isLimited
          variants(first: 1) {
            ... on ProductVariant {
              images {
                url
              }
            }
          }
        }
      }
    `, { slug });

    if (!product) return null;

    // 数据适配：把 variants 中的图片拍平，方便组件使用
    return {
      ...product,
      images: product.variants?.[0]?.images || [],
    };
  } catch (error) {
    console.error("Failed to fetch limited product:", error);
    return null;
  }
}

/** ====================== 页面组件 ====================== */
export default async function LimitedProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || !product.isLimited) {
    notFound();
  }

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images.map((img: any) => img.url),
    "description": product.description?.text || "",
    "brand": {
      "@type": "Brand",
      "name": "LINJIN LUXURY"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/LimitedAvailability",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  return (
    <main className="bg-[#050505] min-h-screen text-white selection:bg-[#d4af37]/30 overflow-x-hidden">
      {/* JSON-LD */}
      <Script
        id="limited-product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* Hero Section */}
      <section className="relative w-full">
        <HeroSection product={product} />
      </section>

      {/* 内容区域 */}
      <div className="flex flex-col lg:flex-row relative">
        {/* 左侧画廊 */}
        <div className="w-full lg:w-[62%] border-b lg:border-b-0 lg:border-r border-white/5 order-2 lg:order-1">
          <LimitedGallery images={product.images.map((img: any) => img.url)} />
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