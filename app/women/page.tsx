import ProductListClient from '../components/ProductListClient';

async function getInitialProducts(gender: string) {
  // 自动适配本地和 Vercel 环境
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  const url = `${baseUrl}/api/initial-products?gender=${gender}&limit=12`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) return [];

    return await res.json();
  } catch (error) {
    console.error('Women page fetch error:', error);
    return [];
  }
}

export default async function WomenPage() {
  const initialProducts = await getInitialProducts('women');
  // 渲染产品列表，如果没有数据则显示优雅的空状态
  return <ProductListClient initialProducts={initialProducts} mainCategory="women" />;
}