import { MetadataRoute } from 'next';

// 1. 定义数据结构
interface HygraphProduct {
  slug: string;
  updatedAt: string;
  isLimited: boolean; // 🌟 新增：判断是否为限量版
  gender?: { slug: string } | null;
  category?: { slug: string } | null;
  subCategories?: Array<{ slug: string }> | null;
}

interface HygraphJournal {
  slug: string;
  updatedAt: string;
}

// 2. 抓取函数：产品 (增加了 isLimited 字段)
async function getHygraphProducts(): Promise<HygraphProduct[]> {
  const endpoint = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT;
  const token = process.env.HYGRAPH_TOKEN;

  if (!endpoint) {
    console.error("Sitemap: NEXT_PUBLIC_HYGRAPH_ENDPOINT is undefined");
    return [];
  }

  const query = `
    query GetProductsForSitemap {
      products(first: 100) {
        slug
        updatedAt
        isLimited
        gender { slug }
        category { slug }
        subCategories(first: 1) { slug }
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

    const json = await response.json();
    return json?.data?.products || [];
  } catch (error) {
    console.error('Sitemap Fetch Error (Products):', error);
    return [];
  }
}

// 3. 抓取函数：Journal 文章
async function getHygraphJournals(): Promise<HygraphJournal[]> {
  const endpoint = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT;
  const token = process.env.HYGRAPH_TOKEN;

  if (!endpoint) return [];

  const query = `
    query GetJournalsForSitemap {
      journals(first: 50) {
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

    const json = await response.json();
    return json?.data?.journals || [];
  } catch (error) {
    console.error('Sitemap Fetch Error (Journals):', error);
    return [];
  }
}

// 4. 生成 Sitemap 主函数
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.linjinluxury.com';

  // 并行获取动态数据
  const [products, journals] = await Promise.all([
    getHygraphProducts(),
    getHygraphJournals(),
  ]);

  // A. 静态与分类页面
  const staticPages = [
    { path: '', priority: 1.0, freq: 'daily' as const },
    { path: '/collection', priority: 0.9, freq: 'daily' as const },
    { path: '/shop', priority: 0.9, freq: 'daily' as const },
    
    // 🌟 重点优化：Limited Archive 页面权重提升，更新频率设为每小时
    { path: '/limited', priority: 1.0, freq: 'always' as const }, 

    { path: '/women', priority: 0.9, freq: 'daily' as const },
    { path: '/men', priority: 0.9, freq: 'daily' as const },

    // 品牌与内容
    { path: '/world-of-ljl', priority: 0.8, freq: 'weekly' as const },
    { path: '/journal', priority: 0.8, freq: 'daily' as const },
    { path: '/bespoke', priority: 0.9, freq: 'monthly' as const },
    { path: '/about', priority: 0.8, freq: 'monthly' as const },
    { path: '/care', priority: 0.7, freq: 'monthly' as const },
    { path: '/contact', priority: 0.9, freq: 'monthly' as const }, // 转化点，权重提高
    { path: '/faq', priority: 0.6, freq: 'monthly' as const },

    // 政策与法律页面
    { path: '/policies/privacy', priority: 0.3, freq: 'monthly' as const },
    { path: '/policies/returns', priority: 0.3, freq: 'monthly' as const },
    { path: '/terms', priority: 0.3, freq: 'monthly' as const },
    { path: '/shipping', priority: 0.3, freq: 'monthly' as const },
    { path: '/sustainability', priority: 0.7, freq: 'monthly' as const },
  ];

  const staticEntries = staticPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: page.freq,
    priority: page.priority,
  }));

  // B. 处理产品详情页 (区分普通产品与限量版)
  const productEntries = products.map((product) => {
    // 🌟 逻辑区分：如果是限量版，使用 /limited/[slug]，否则使用分类路径
    const urlPath = product.isLimited 
      ? `/limited/${product.slug}`
      : `/${product.gender?.slug || 'all'}/${product.category?.slug || 'items'}/${product.subCategories?.[0]?.slug || 'general'}/${product.slug}`;

    return {
      url: `${baseUrl}${urlPath}`,
      lastModified: new Date(product.updatedAt).toISOString(),
      changeFrequency: 'daily' as const,
      // 限量版给予更高的搜索权重
      priority: product.isLimited ? 0.9 : 0.8, 
    };
  });

  // C. 处理 Journal 文章详情页
  const journalEntries = journals.map((post) => ({
    url: `${baseUrl}/journal/${post.slug}`,
    lastModified: new Date(post.updatedAt).toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...productEntries, ...journalEntries];
}