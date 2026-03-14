import ProductListClient from '../components/ProductListClient';

async function getInitialProducts(gender: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  const url = `${baseUrl}/api/initial-products?gender=${gender}&limit=12`;

  const res = await fetch(url, {
    next: { revalidate: 60 }, // 可选：60秒后台缓存，提高性能
  });
  
  if (!res.ok) {
    console.error('Men page pre-fetch failed:', res.status);
    return [];
  }
  return res.json();
}

export default async function MenPage() {
  const initialProducts = await getInitialProducts('men');

  return <ProductListClient initialProducts={initialProducts} mainCategory="men" />;
}