import { Metadata } from 'next';
import ProductListClient from '../components/ProductListClient';

/** ====================== 动态 Metadata ====================== */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Men's Leather Bags & Accessories | LINJIN LUXURY",
    description: "Discover premium men's leather briefcases, messenger bags, wallets and accessories. Factory direct wholesale & OEM from LINJIN LUXURY.",
    keywords: [
      "men's leather bags",
      "men leather briefcase",
      "men's messenger bag",
      "men leather wallet",
      "men's accessories wholesale",
      "OEM men bags",
      "LINJIN LUXURY men collection",
    ],
    alternates: {
      canonical: "https://www.linjinluxury.com/men",
    },
    openGraph: {
      title: "Men's Collection | LINJIN LUXURY",
      description: "Premium leather bags and accessories designed for the modern man.",
      url: "https://www.linjinluxury.com/men",
      images: [{ url: "https://www.linjinluxury.com/images/men-og.jpg", width: 1200, height: 630 }],
    },
  };
}

/** ====================== 获取初始产品数据 ====================== */
async function getInitialProducts(gender: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  const url = `${baseUrl}/api/initial-products?gender=${gender}&limit=12`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },        // 建议改成 5 分钟，平衡新鲜度和性能
      headers: {
        'Accept': 'application/json',   // 明确要求 JSON
      },
    });

    if (!res.ok) {
      console.error(`Failed to fetch men products: ${res.status} ${res.statusText}`);
      return [];
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Expected JSON response but got:", contentType);
      return [];
    }

    const data = await res.json();
    
    // 增加数据校验
    if (!Array.isArray(data)) {
      console.error("API returned non-array data");
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error fetching initial men products:', error);
    return [];
  }
}

/** ====================== Men 主页面 ====================== */
export default async function MenPage() {
  const initialProducts = await getInitialProducts('men');

  return (
    <ProductListClient 
      initialProducts={initialProducts} 
      collectionTitle="Men's Collection"
    />
  );
}