// app/sitemap.ts
import { MetadataRoute } from 'next';

interface HygraphProduct {
  slug: string;
  updatedAt: string;
  isLimited: boolean;
}

interface HygraphJournal {
  slug: string;
  updatedAt: string;
}

interface HygraphFaq {
  slug: string;
  updatedAt: string;
}

/** 辅助函数：安全日期格式化 */
function getSafeDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/** 通用 GraphQL 请求函数 */
async function hygraphFetch(query: string, variables: any = {}) {
  const endpoint = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT;
  const token = process.env.HYGRAPH_TOKEN;
  if (!endpoint) return null;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 },
  });

  if (!response.ok) throw new Error(`Hygraph HTTP Error: ${response.status}`);
  return response.json();
}

/** 1. 抓取产品 (分页) */
async function getAllHygraphProducts(): Promise<HygraphProduct[]> {
  const allProducts: HygraphProduct[] = [];
  let skip = 0;
  let hasNextPage = true;

  const query = `
    query GetProductsForSitemap($skip: Int!) {
      productsConnection(first: 100, skip: $skip, stage: PUBLISHED) {
        edges { node { slug updatedAt isLimited } }
        pageInfo { hasNextPage }
      }
    }
  `;

  try {
    while (hasNextPage) {
      const json = await hygraphFetch(query, { skip });
      const fetched = json?.data?.productsConnection?.edges?.map((e: any) => e.node) || [];
      allProducts.push(...fetched);
      hasNextPage = json?.data?.productsConnection?.pageInfo?.hasNextPage || false;
      skip += 100;
      if (skip > 5000) break;
    }
    return allProducts;
  } catch (error) {
    console.error('🔥 Products Sitemap Error:', error);
    return allProducts;
  }
}

/** 2. 抓取 Journal 文章 */
async function getHygraphJournals(): Promise<HygraphJournal[]> {
  const query = `query GetJournalsForSitemap { journals(first: 200, stage: PUBLISHED) { slug updatedAt } }`;
  try {
    const json = await hygraphFetch(query);
    return json?.data?.journals || [];
  } catch (error) {
    console.error('🔥 Journal Sitemap Error:', error);
    return [];
  }
}

/** 3. 抓取动态 FAQ 条目 */
async function getHygraphFaqs(): Promise<HygraphFaq[]> {
  const query = `query GetFaqsForSitemap { faqs(first: 200, stage: PUBLISHED) { slug updatedAt } }`;
  try {
    const json = await hygraphFetch(query);
    return json?.data?.faqs || [];
  } catch (error) {
    console.error('🔥 FAQ Sitemap Error:', error);
    return [];
  }
}

/** 主函数：生成完整 Sitemap */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://www.linjinluxury.com';
  const STATIC_LAST_MOD = '2026-05-01T00:00:00.000Z';

  // 同时并行请求三个数据源
  const [products, journals, faqs] = await Promise.all([
    getAllHygraphProducts(),
    getHygraphJournals(),
    getHygraphFaqs(),
  ]);

  // A. 静态页面
  const staticPages = [
    { path: '', priority: 1.0, freq: 'daily' as const },
    { path: '/limited', priority: 1.0, freq: 'hourly' as const },
    { path: '/collection', priority: 0.95, freq: 'daily' as const },
    { path: '/women', priority: 0.9, freq: 'daily' as const },
    { path: '/men', priority: 0.9, freq: 'daily' as const },
    { path: '/journal', priority: 0.85, freq: 'weekly' as const },
    { path: '/bespoke', priority: 0.85, freq: 'monthly' as const },
    { path: '/faq', priority: 0.8, freq: 'monthly' as const },
    { path: '/about', priority: 0.65, freq: 'monthly' as const },
    { path: '/contact', priority: 0.7, freq: 'monthly' as const },
  ];

  const staticEntries = staticPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: STATIC_LAST_MOD,
    changeFrequency: page.freq,
    priority: page.priority,
  }));

  // B. 产品详情页
  const productEntries = products.map((p) => ({
    url: `${baseUrl}${p.isLimited ? '/limited/' : '/product/'}${p.slug}`,
    lastModified: getSafeDate(p.updatedAt),
    changeFrequency: 'daily' as const,
    priority: p.isLimited ? 0.95 : 0.85,
  }));

  // C. Journal 文章详情页
  const journalEntries = journals.map((p) => ({
    url: `${baseUrl}/journal/${p.slug}`,
    lastModified: getSafeDate(p.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  // D. 动态 FAQ 详情页
  const faqEntries = faqs.map((f) => ({
    url: `${baseUrl}/faq/${f.slug}`,
    lastModified: getSafeDate(f.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  }));

  // 合并所有数组，使用 Map 进行 URL 去重
  const allEntries = [...staticEntries, ...productEntries, ...journalEntries, ...faqEntries];
  return Array.from(new Map(allEntries.map((item) => [item.url, item])).values());
}