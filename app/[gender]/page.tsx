import { fetchFromHygraph } from '@/lib/hygraph';
import { GET_PRODUCTS_BY_GENDER } from '@/lib/queries';
import ProductGrid from '../components/ProductGrid';
import Pagination from '../components/Pagination';
import FilterBar from '../components/FilterBar';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

const PAGE_SIZE = 12;
const DOMAIN = 'https://linjinluxury.com';

// 1. 完整的 SEO 元数据配置
export async function generateMetadata({ params }: { params: Promise<{ gender: string }> }): Promise<Metadata> {
  const { gender } = await params;
  const capitalizedGender = gender.charAt(0).toUpperCase() + gender.slice(1);
  const title = `${capitalizedGender} Collection | LINJIN`;
  const description = `Shop the latest ${gender} collection at LINJIN. Discover high-quality luxury fashion items.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'LINJIN',
      url: `${DOMAIN}/${gender}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    // 自动配置 Canonical URL，防止 SEO 重复索引
    alternates: {
      canonical: `${DOMAIN}/${gender}`,
    },
  };
}

export default async function GenderPage({
  params,
  searchParams,
}: {
  params: Promise<{ gender: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { gender } = await params;
  const resolvedSearchParams = await searchParams;
  
  const page = Number(resolvedSearchParams.page) || 1;
  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : '';
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'createdAt_DESC';
  
  const skip = (page - 1) * PAGE_SIZE;

  // 获取数据 - 添加了 <any> 来解决 TypeScript 报错
  const data = await fetchFromHygraph<any>(GET_PRODUCTS_BY_GENDER, {
    slug: gender,
    first: PAGE_SIZE,
    skip: skip,
    search: search,
    orderBy: sort,
  });

  if (!data || !data.products) notFound();

  // 2. 注入 JSON-LD 结构化数据 (帮助搜索引擎理解页面内容)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': `${gender} Collection`,
    'description': `Discover our latest ${gender} collection at LINJIN.`,
    'url': `${DOMAIN}/${gender}`,
  };

  const formattedProducts = data.products.map((product: any) => ({
    ...product,
    images: product.variants?.[0]?.images?.map((img: any) => img.url) || [],
  }));

  const totalCount = data.productsConnection?.aggregate?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const heroImage = data.gender?.heroImage?.url;
  const categories = data.gender?.categories || [];

  return (
    <main className="w-full min-h-screen bg-white">
      {/* 结构化数据脚本 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero 部分 */}
      <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden bg-gray-100">
        {heroImage && (
          <Image src={heroImage} alt={`${gender} Collection`} fill priority className="object-cover brightness-75" sizes="100vw" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
          <h1 className="text-3xl md:text-6xl font-light tracking-[0.3em] uppercase mb-4 drop-shadow-md">
            {gender} Collection
          </h1>
        </div>
      </section>

      {/* 导航栏 */}
      <nav className="w-full border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto">
          <ul className="flex items-center justify-start md:justify-center overflow-x-auto no-scrollbar py-8 px-6 gap-8 md:gap-12 text-[10px] tracking-[0.2em] font-medium uppercase text-gray-400">
            <li className="flex-shrink-0">
              <Link href={`/${gender}`} className="text-black border-b border-black pb-1">All Items</Link>
            </li>
            {categories.map((cat: any) => (
              <li key={cat.slug} className="flex-shrink-0 hover:text-black transition-colors duration-300">
                <Link href={`/${gender}/${cat.slug}`}>{cat.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* 动态过滤组件 */}
      <FilterBar />

      {/* 产品展示 */}
      <section className="max-w-7xl mx-auto px-6 py-12 pb-20">
        <ProductGrid initialProducts={formattedProducts} gender={gender} page={page} category={null} />
        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} baseUrl={`/${gender}`} />
        )}
      </section>
    </main>
  );
}