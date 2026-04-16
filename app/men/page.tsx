import ProductListClient from '../components/ProductListClient';

async function getInitialProducts(gender: string) {
  // 1. 优先使用 Vercel 提供的系统变量，这比手动填写的更准确
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  const url = `${baseUrl}/api/initial-products?gender=${gender}&limit=12`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
    });
    
    if (!res.ok) {
      console.error(`Men page pre-fetch failed with status: ${res.status}`);
      return [];
    }

    // 2. 关键修复：检查 Content-Type 确保它是 JSON
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Men page expected JSON but received HTML/Text. Check if API route is working.");
      return [];
    }

    return await res.json();
  } catch (error) {
    // 3. 增加 try-catch 捕获网络错误
    console.error('Men page fetch error:', error);
    return [];
  }
}

export default async function MenPage() {
  // 如果 API 报错，这里会拿到 []，页面依然能渲染出框架而不会崩溃
  const initialProducts = await getInitialProducts('men');

  return <ProductListClient initialProducts={initialProducts} mainCategory="men" />;
}