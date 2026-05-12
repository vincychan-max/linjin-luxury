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

/** 
 * 1. 更加健壮的分页抓取产品逻辑 (使用 while 循环替代递归)
 * 解决 100 条限制问题，并防止 API 异常导致死循环
 */
async function getAllHygraphProducts(): Promise<HygraphProduct[]> {
  const endpoint = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT;
  const token = process.env.HYGRAPH_TOKEN;
  if (!endpoint) return [];

  const allProducts: HygraphProduct[] = []; // ✅ 已修复：使用 const 解决 ESLint 报错
  let skip = 0;
  let hasNextPage = true;

  const query = `
    query GetProductsForSitemap($skip: Int!) {
      productsConnection(first: 100, skip: $skip, stage: PUBLISHED) {
        edges {
          node {
            slug
            updatedAt
            isLimited
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `;

  try {
    while (hasNextPage) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ query, variables: { skip } }),
        next: { revalidate: 3600 },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const json = await response.json();
      const fetched = json?.data?.productsConnection?.edges?.map((e: any) => e.node) || [];
      
      allProducts.push(...fetched);

      hasNextPage = json?.data?.productsConnection?.pageInfo?.hasNextPage || false;
      skip += 100;

      // 安全锁：防止出现死循环，最多抓取 5000 个产品
      if (skip > 5000) break;
    }

    return allProducts;
  } catch (error) {
    console.error('🔥 Sitemap Products Pagination Error:', error);
    return allProducts; // 报错时返回已经抓取到的部分
  }
}

/** 2. 抓取 Journal 文章 */
async function getHygraphJournals(): Promise<HygraphJournal[]> {
  const endpoint = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT;
  const token = process.env.HYGRAPH_TOKEN;
  if (!endpoint) return [];

  const query = `
    query GetJournalsForSitemap {
      journals(first: 100, stage: PUBLISHED) {
        slug
        updatedAt
      }
    }
  `;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    return json?.data?.journals || [];
  } catch (error) {
    console.error('🔥 Sitemap Journals Error:', error);
    return [];
  }
}

// 辅助函数：确保日期格式正确，防止 new Date() 崩溃导致整个 sitemap 失败
function getSafeDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/** 3. 生成 Sitemap 主函数 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://www.linjinluxury.com';
  
  // ✅ 静态页面固定日期
  const STATIC_LAST_MOD = '2026-04-28T00:00:00.000Z';

  const [products, journals] = await Promise.all([
    getAllHygraphProducts(),
    getHygraphJournals(),
  ]);

  // A. 静态与核心分类页面
  const staticPages = [
    { path: '', priority: 1.0, freq: 'daily' as const },
    { path: '/limited', priority: 1.0, freq: 'always' as const },
    { path: '/collection', priority: 0.95, freq: 'daily' as const },
    { path: '/women', priority: 0.9, freq: 'daily' as const },
    { path: '/men', priority: 0.9, freq: 'daily' as const },
    { path: '/journal', priority: 0.8, freq: 'weekly' as const },
    { path: '/bespoke', priority: 0.85, freq: 'monthly' as const },
    { path: '/about', priority: 0.6, freq: 'monthly' as const },
    { path: '/contact', priority: 0.7, freq: 'monthly' as const },
  ];

  const staticEntries = staticPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: STATIC_LAST_MOD,
    changeFrequency: page.freq,
    priority: page.priority,
  }));

  // B. 产品详情页：完全匹配现有的文件路由体系
  const productEntries = products.map((product) => {
    const isLimited = product.isLimited;
    const urlPath = isLimited ? `/limited/${product.slug}` : `/product/${product.slug}`;
    const priority = isLimited ? 0.95 : 0.85;

    return {
      url: `${baseUrl}${urlPath}`,
      lastModified: getSafeDate(product.updatedAt),
      changeFrequency: 'daily' as const,
      priority: priority,
    };
  });

  // C. Journal 文章详情页
  const journalEntries = journals.map((post) => ({
    url: `${baseUrl}/journal/${post.slug}`,
    lastModified: getSafeDate(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 合并数组，并使用 Map 进行一次 URL 去重
  const allEntries = [...staticEntries, ...productEntries, ...journalEntries];
  const uniqueEntries = Array.from(new Map(allEntries.map(item => [item.url, item])).values());

  return uniqueEntries;
}