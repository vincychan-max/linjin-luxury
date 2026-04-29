import { MetadataRoute } from 'next';

interface HygraphProduct {
  slug: string;
  updatedAt: string;
  isLimited: boolean;
  gender?: { slug: string } | null;
  category?: { slug: string } | null;
}

interface HygraphJournal {
  slug: string;
  updatedAt: string;
}

/** * 1. 递归分页抓取所有产品 
 * 解决 100 条限制问题，确保 Men/Women 所有产品都被索引
 */
async function getAllHygraphProducts(skip = 0, allProducts: HygraphProduct[] = []): Promise<HygraphProduct[]> {
  const endpoint = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT;
  const token = process.env.HYGRAPH_TOKEN;
  if (!endpoint) return allProducts;

  const query = `
    query GetProductsForSitemap($skip: Int!) {
      productsConnection(first: 100, skip: $skip, stage: PUBLISHED) {
        edges {
          node {
            slug
            updatedAt
            isLimited
            gender { slug }
            category { slug }
          }
        }
        pageInfo {
          hasNextPage
        }
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
      body: JSON.stringify({ query, variables: { skip } }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();
    const fetched = json?.data?.productsConnection?.edges?.map((e: any) => e.node) || [];
    const hasNextPage = json?.data?.productsConnection?.pageInfo?.hasNextPage || false;

    const updatedList = [...allProducts, ...fetched];

    return hasNextPage 
      ? getAllHygraphProducts(skip + 100, updatedList) 
      : updatedList;
  } catch (error) {
    console.error('🔥 Sitemap Products Pagination Error:', error);
    return allProducts;
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

/** 3. 生成 Sitemap 主函数 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://www.linjinluxury.com';
  
  // ✅ 解决问题：固定静态页面日期，避免无效的“假更新”信号
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

  // B. 产品详情页：应用严密的路径校验逻辑
  const productEntries = products.map((product) => {
    let urlPath: string;
    let currentPriority = 0.85;

    // 逻辑 1：优先检查是否为限量版
    if (product.isLimited) {
      urlPath = `/limited/${product.slug}`;
      currentPriority = 0.95; // 限量版权重最高
    } 
    // 逻辑 2：数据完整，生成标准层级路径 /[gender]/[category]/[slug]
    else if (product.gender?.slug && product.category?.slug) {
      urlPath = `/${product.gender.slug}/${product.category.slug}/${product.slug}`;
      currentPriority = 0.85;
    } 
    // 逻辑 3：安全降级策略（数据缺失时）
    else {
      // 避免错误的 SEO 归类，不强行填入 'women'，而是指向通用的 /product/
      urlPath = `/product/${product.slug}`; 
      currentPriority = 0.7; // 降级路径权重降低
    }

    return {
      url: `${baseUrl}${urlPath}`,
      lastModified: new Date(product.updatedAt).toISOString(),
      changeFrequency: 'daily' as const,
      priority: currentPriority,
    };
  });

  // C. Journal 文章详情页
  const journalEntries = journals.map((post) => ({
    url: `${baseUrl}/journal/${post.slug}`,
    lastModified: new Date(post.updatedAt).toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...productEntries, ...journalEntries];
}