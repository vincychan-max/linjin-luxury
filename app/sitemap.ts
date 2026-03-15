import { MetadataRoute } from 'next';

// 1. 定义数据结构
interface HygraphProduct {
  slug: string;
  updatedAt: string;
  gender?: { slug: string } | null;
  category?: { slug: string } | null;
  subCategories?: Array<{ slug: string }> | null;
}

interface HygraphJournal {
  slug: string;
  updatedAt: string;
}

// 2. 抓取函数：产品
async function getHygraphProducts(): Promise<HygraphProduct[]> {
  const HYGRAPH_ENDPOINT = process.env.HYGRAPH_ENDPOINT!;
  const HYGRAPH_TOKEN = process.env.HYGRAPH_TOKEN;

  const query = `
    query GetProductsForSitemap {
      products {
        slug
        updatedAt
        gender { slug }
        category { slug }
        subCategories(first: 1) { slug }
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
    console.error('Sitemap Fetch Error (Products):', error);
    return [];
  }
}

// 3. 抓取函数：Journal 文章
async function getHygraphJournals(): Promise<HygraphJournal[]> {
  const HYGRAPH_ENDPOINT = process.env.HYGRAPH_ENDPOINT!;
  const HYGRAPH_TOKEN = process.env.HYGRAPH_TOKEN;

  const query = `
    query GetJournalsForSitemap {
      journals {
        slug
        updatedAt
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
    return json.data?.journals || [];
  } catch (error) {
    console.error('Sitemap Fetch Error (Journals):', error);
    return [];
  }
}

// 4. 主函数
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.linjinluxury.com';

  // 并行执行所有请求，提高效率
  const [products, journals] = await Promise.all([
    getHygraphProducts(),
    getHygraphJournals(),
  ]);

  // A. 静态核心页面
  const staticPages = [
    { path: '', priority: 1.0, freq: 'daily' as const },
    { path: '/collection', priority: 0.9, freq: 'daily' as const },
    { path: '/world-of-ljl', priority: 0.9, freq: 'weekly' as const },
    { path: '/journal', priority: 0.8, freq: 'daily' as const },
    { path: '/bespoke', priority: 0.9, freq: 'monthly' as const },
    { path: '/about', priority: 0.8, freq: 'monthly' as const },
    { path: '/sustainability', priority: 0.7, freq: 'monthly' as const },
    { path: '/shipping-returns', priority: 0.5, freq: 'monthly' as const },
    { path: '/sitemap', priority: 0.3, freq: 'monthly' as const },
    { path: '/contact', priority: 0.7, freq: 'monthly' as const },
  ];

  const staticEntries = staticPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: page.freq,
    priority: page.priority,
  }));

  // B. 产品详情页 (动态路径: /[gender]/[category]/[subCategory]/[slug])
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

  // C. Journal 文章页 (动态路径: /journal/[slug])
  const journalEntries = journals.map((post) => ({
    url: `${baseUrl}/journal/${post.slug}`,
    lastModified: new Date(post.updatedAt).toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 合并所有结果
  return [...staticEntries, ...productEntries, ...journalEntries];
}