import { Metadata } from 'next';
import { hygraph } from '@/lib/hygraph';
import Link from 'next/link';
import Script from 'next/script';
import ProductGrid from '../../components/ProductGrid';
import { gql } from 'graphql-request';

/** ====================== 类型定义 ====================== */
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  isNew?: boolean;
  material?: string;
  categorySlug?: string;
  isLimited?: boolean; // ✅ 新增：布尔值开关
};

type Props = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/** ====================== 常量 ====================== */
export const revalidate = 3600; // 1小时刷新一次
const BASE_URL = 'https://www.linjinluxury.com';
const PAGE_SIZE = 12;

/** ====================== GraphQL 查询（增加 isLimited 字段） ====================== */
const GET_COLLECTION_PRODUCTS = gql`
  query GetCollectionProducts(
    $where: ProductWhereInput
    $first: Int!
    $skip: Int!
  ) {
    productsConnection(
      where: $where
      first: $first
      skip: $skip
      orderBy: createdAt_DESC
      stage: PUBLISHED
    ) {
      aggregate {
        count
      }
      edges {
        node {
          id
          name
          slug
          price
          isNew
          material
          # ✅ 获取限量款布尔值开关
          isLimited
          category {
            slug
          }
          variants(first: 1) {
            ... on ProductVariant {
              images(first: 1) {
                url
              }
            }
          }
        }
      }
    }
  }
`;

/** ====================== 静态路径生成 ====================== */
export async function generateStaticParams() {
  return [
    { slug: ['all'] },
    { slug: ['women'] },
    { slug: ['men'] },
  ];
}

/** ====================== 动态 Metadata ====================== */
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearch = await searchParams;

  const rawGender = slug?.[0] || 'all';
  const rawCategory = slug?.[1] || null;
  const page = parseInt(
    (Array.isArray(resolvedSearch.page) ? resolvedSearch.page[0] : resolvedSearch.page) || '1'
  );

  const genderLabel = rawGender === 'all' ? 'Luxury' : rawGender.toUpperCase();
  const categoryLabel = rawCategory
    ? rawCategory.replace('-', ' ').toUpperCase()
    : 'Collections';

  const title = `${genderLabel} ${categoryLabel} ${page > 1 ? `- Page ${page}` : ''} | LINJIN LUXURY`;
  const basePath = `/collection/${slug?.join('/') || 'all'}`;
  const canonicalUrl = `${BASE_URL}${basePath}${page > 1 ? `?page=${page}` : ''}`;

  return {
    title,
    description: `Shop LINJIN LUXURY ${genderLabel} ${categoryLabel}. Premium leather handbags, men bags & accessories. Factory-direct OEM & wholesale from Hong Kong.`,
    keywords: [
      'leather bags',
      `${rawGender} leather bags`,
      categoryLabel.toLowerCase(),
      'OEM leather goods',
      'wholesale handbags',
      'LINJIN LUXURY',
      'Hong Kong leather manufacturer',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description: `Shop LINJIN LUXURY ${genderLabel} ${categoryLabel}. Premium leather handbags, men bags & accessories.`,
      url: canonicalUrl,
      images: [{ url: `${BASE_URL}/images/collection-og.jpg`, width: 1200, height: 630 }],
      type: 'website',
      siteName: 'LINJIN LUXURY',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: `Shop LINJIN LUXURY ${genderLabel} ${categoryLabel}.`,
      images: [`${BASE_URL}/images/collection-og.jpg`],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/** ====================== 主页面组件 ====================== */
export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const resolvedSearch = await searchParams;

  const rawGender = slug?.[0] || 'all';
  const gender = rawGender === 'all' ? null : rawGender;
  const categorySlug = slug?.[1] || null;
  const page = parseInt(
    (Array.isArray(resolvedSearch.page) ? resolvedSearch.page[0] : resolvedSearch.page) || '1'
  );

  let initialProducts: Product[] = [];
  let totalCount = 0;
  let hasNextPage = false;

  try {
    const whereCondition: any = {};
    if (gender) whereCondition.gender = { slug: gender };
    if (categorySlug) whereCondition.categories_some = { slug: categorySlug };

    const data: any = await hygraph.request(GET_COLLECTION_PRODUCTS, {
      where: whereCondition,
      first: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    });

    const connection = data?.productsConnection;
    totalCount = connection?.aggregate?.count || 0;

    initialProducts = (connection?.edges || []).map((edge: any) => {
      const p = edge.node;
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        isNew: p.isNew,
        material: p.material,
        // ✅ 核心数据映射：优先使用 isLimited 开关
        isLimited: p.isLimited || false,
        categorySlug: p.category?.slug || '',
        images: p.variants?.[0]?.images?.map((img: any) => img.url) || [],
      };
    });

    hasNextPage = (page - 1) * PAGE_SIZE + initialProducts.length < totalCount;
  } catch (e) {
    console.error('🔥 Collection Page Data Fetch Error:', e);
  }

  /** ====================== 最强 JSON-LD（根据 isLimited 区分链接） ====================== */
  const canonicalUrl = `${BASE_URL}/collection/${slug?.join('/') || 'all'}${
    page > 1 ? `?page=${page}` : ''
  }`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: `LINJIN LUXURY ${gender || ''} ${categorySlug || 'Collection'}`,
        url: canonicalUrl,
        description:
          'Premium leather handbags, men bags and accessories. Factory-direct OEM & wholesale.',
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: BASE_URL,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Collection',
              item: `${BASE_URL}/collection/all`,
            },
            ...(gender
              ? [
                  {
                    '@type': 'ListItem',
                    position: 3,
                    name: gender.toUpperCase(),
                    item: `${BASE_URL}/collection/${gender}`,
                  },
                ]
              : []),
            ...(categorySlug
              ? [
                  {
                    '@type': 'ListItem',
                    position: gender ? 4 : 3,
                    name: categorySlug.replace('-', ' ').toUpperCase(),
                    item: `${BASE_URL}/collection/${slug?.join('/')}`,
                  },
                ]
              : []),
          ],
        },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: totalCount,
          itemListElement: initialProducts.map((p, i) => {
            // ✅ 逻辑：根据 isLimited 开关决定 JSON-LD 里的 URL
            const path = p.isLimited ? '/limited/' : '/product/';
            
            return {
              '@type': 'ListItem',
              position: (page - 1) * PAGE_SIZE + i + 1,
              url: `${BASE_URL}${path}${p.slug}`,
              name: p.name,
            };
          }),
        },
      },
    ],
  };

  return (
    <main className="bg-white min-h-screen text-black">
      {/* JSON-LD */}
      <Script
        id="collection-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-48 pb-20 text-center">
        <p className="text-[10px] uppercase tracking-[0.6em] text-black/30 mb-10 font-medium">
          Atelier Direct Passage
        </p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extralight tracking-[0.05em] uppercase mb-12 leading-[1.1]">
          {gender || 'THE FULL'} <br className="md:hidden" />
          {categorySlug ? categorySlug.replace('-', ' ') : 'COLLECTION'}
        </h1>

        <div className="max-w-xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.3em] leading-[2.6] text-black/50 font-light px-4">
            Restrained design language rooted in material quality. <br />
            Each piece is crafted with a focus on proportion, texture, and the tactile honesty of premium
            leather. Factory direct from Hong Kong.
          </p>
        </div>
      </header>

      {/* Gender Navigation */}
      <nav className="flex justify-center gap-12 mb-28">
        {['all', 'women', 'men'].map((t) => (
          <Link
            key={t}
            href={`/collection/${t}`}
            className={`text-[10px] uppercase tracking-[0.5em] pb-1 border-b transition-all duration-700
              ${
                rawGender === t
                  ? 'border-black opacity-100'
                  : 'border-transparent opacity-30 hover:opacity-100'
              }`}
          >
            {t}
          </Link>
        ))}
      </nav>

      {/* Product Grid */}
      <section className="max-w-[1600px] mx-auto px-8 pb-16">
        <ProductGrid
          initialProducts={initialProducts}
          category={categorySlug}
          gender={gender}
          page={page}
        />
      </section>

      {/* Pagination */}
      <footer className="flex justify-center items-center gap-12 pb-40">
        {page > 1 ? (
          <Link
            href={`/collection/${slug?.join('/') || 'all'}?page=${page - 1}`}
            className="text-[10px] uppercase tracking-[0.4em] px-10 py-4 border border-black/10 hover:bg-black hover:text-white transition-all"
          >
            Prev
          </Link>
        ) : (
          <span className="opacity-10 text-[10px] px-10 py-4 border border-black/5 uppercase tracking-[0.4em]">
            Prev
          </span>
        )}

        <span className="text-[10px] tracking-[0.6em] text-black/20 font-light">
          Page {page} of {Math.ceil(totalCount / PAGE_SIZE) || 1}
        </span>

        {hasNextPage ? (
          <Link
            href={`/collection/${slug?.join('/') || 'all'}?page=${page + 1}`}
            className="text-[10px] uppercase tracking-[0.4em] px-10 py-4 border border-black/10 hover:bg-black hover:text-white transition-all"
          >
            Next
          </Link>
        ) : (
          <span className="opacity-10 text-[10px] px-10 py-4 border border-black/5 uppercase tracking-[0.4em]">
            Next
          </span>
        )}
      </footer>
    </main>
  );
}