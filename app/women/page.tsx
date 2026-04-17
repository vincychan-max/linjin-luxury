import { Metadata } from 'next';
import ProductListClient from '../components/ProductListClient';

/** ====================== SEO Metadata ====================== */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Women's Leather Handbags & Accessories | LINJIN LUXURY",
    description: "Discover premium women's leather handbags, tote bags, hobo bags, crossbody bags and accessories. Factory direct wholesale & OEM from LINJIN LUXURY.",
    keywords: [
      "women's leather handbags",
      "women handbags wholesale",
      "leather tote bag",
      "leather hobo bag",
      "crossbody bag women",
      "OEM handbags",
      "LINJIN LUXURY women collection",
    ],
    alternates: {
      canonical: "https://www.linjinluxury.com/women",
    },
    openGraph: {
      title: "Women's Collection | LINJIN LUXURY",
      description: "Premium leather handbags and accessories for the modern woman.",
      url: "https://www.linjinluxury.com/women",
      images: [{ url: "https://www.linjinluxury.com/images/women-og.jpg", width: 1200, height: 630 }],
    },
  };
}

/** ====================== 获取初始产品数据 ====================== */
async function getInitialProducts(gender: string) {
  const baseUrl = 
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  const url = `${baseUrl}/api/initial-products?gender=${gender}&limit=12`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },           // 建议从 60 秒改为 5 分钟
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`Women page fetch failed: ${res.status}`);
      return [];
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Women page expected JSON but received:", contentType);
      return [];
    }

    const data = await res.json();

    // 增加数据校验
    if (!Array.isArray(data)) {
      console.error("Women page API returned non-array data");
      return [];
    }

    return data;
  } catch (error) {
    console.error('Women page fetch error:', error);
    return [];
  }
}

/** ====================== Women 主页面 ====================== */
export default async function WomenPage() {
  const initialProducts = await getInitialProducts('women');

  return (
    <ProductListClient 
      initialProducts={initialProducts} 
      collectionTitle="Women's Collection"
    />
  );
}