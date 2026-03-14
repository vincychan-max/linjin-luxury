import { MetadataRoute } from 'next';

// 根据你的 Schema 设置的 API ID 进行定义
interface Product {
  slug: string;
  updatedAt: string;
  gender?: { slug: string } | null;
  category?: { slug: string } | null;
  subCategories?: Array<{ slug: string }> | null; // 注意图中 Product 模型里引用的是 subCategories
}

async function getHygraphProducts(): Promise<Product[]> {
  const HYGRAPH_ENDPOINT = process.env.HYGRAPH_ENDPOINT!;
  const HYGRAPH_TOKEN = process.env.HYGRAPH_TOKEN;

  // 严格匹配你截图中的 API ID: gender, category, subCategories
  const query = `
    query GetProductsForSitemap {
      products {
        slug
        updatedAt
        gender {
          slug
        }
        category {
          slug
        }
        subCategories(first: 1) { 
          slug
        }
      }
    }
  `;

  try {
    const response = await fetch(HYGRAPH_ENDPOINT, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(HYGRAPH_TOKEN && { Authorization: `Bearer ${HYGRAPH_TOKEN}` }),
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600 },
    });

    const json = await response.json();
    return json.data?.products || [];
  } catch (error) {
    console.error('Hygraph Fetch Error:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.linjinluxury.com';

  const products = await getHygraphProducts();
  
  // 匹配你的文件夹结构: /[gender]/[category]/[subCategory]/[slug]
  const productEntries = products.map((product) => {
    const g = product.gender?.slug || 'all';
    const c = product.category?.slug || 'items';
    const s = product.subCategories?.[0]?.slug || 'general';

    return {
      url: `${baseUrl}/${g}/${c}/${s}/${product.slug}`,
      lastModified: new Date(product.updatedAt).toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    };
  });

  const staticPages = [
    { path: '', priority: 1.0, freq: 'daily' as const },
    { path: '/collection', priority: 0.9, freq: 'daily' as const },
    { path: '/shop', priority: 0.7, freq: 'monthly' as const },
    { path: '/contact', priority: 0.7, freq: 'monthly' as const },
    { path: '/about', priority: 0.7, freq: 'monthly' as const },
  ];

  const staticEntries = staticPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: page.freq,
    priority: page.priority,
  }));

  return [...staticEntries, ...productEntries];
}