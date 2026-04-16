import { Metadata } from 'next';
import { hygraph } from '@/lib/hygraph';
import Link from 'next/link';
import Script from 'next/script';
import ProductGrid from '../../components/ProductGrid';

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  isNew?: boolean;
};

type Props = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const revalidate = 3600;

// 1. 动态 Metadata 生成 (保持原逻辑，优化 SEO)
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSearch = await searchParams;
  
  const rawGender = slug?.[0] || 'all';
  const rawCategory = slug?.[1] || null;
  const page = (Array.isArray(resolvedSearch.page) ? resolvedSearch.page[0] : resolvedSearch.page) || '1';
  
  const baseUrl = 'https://www.linjinluxury.com';
  const genderTitle = rawGender === 'all' ? '' : `${rawGender.toUpperCase()} `;
  const categoryTitle = rawCategory ? `${rawCategory.replace('-', ' ').toUpperCase()} ` : '';
  const titlePrefix = `${genderTitle}${categoryTitle}`.trim();

  const canonicalPath = `/collection/${slug?.join('/') || 'all'}`;
  const canonicalUrl = new URL(canonicalPath, baseUrl);
  if (page !== '1') canonicalUrl.searchParams.set('page', page);

  return {
    title: `${titlePrefix ? titlePrefix + ' | ' : ''}COLLECTION | LINJIN LUXURY Artisanal`,
    description: `Explore the LINJIN LUXURY ${rawGender === 'all' ? 'Full' : rawGender} ${rawCategory ? rawCategory.replace('-', ' ') : ''} collection. Page ${page}.`,
    alternates: { canonical: canonicalUrl.toString() },
    openGraph: {
      title: `LINJIN LUXURY | ${titlePrefix || 'FULL'} Collection`,
      url: canonicalUrl.toString(),
      images: [{ url: `${baseUrl}/images/collection-og.jpg` }],
    },
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params; 
  const resolvedSearch = await searchParams;
  
  const rawGender = slug?.[0] || 'all';
  const gender = rawGender === 'all' ? null : rawGender;
  const categorySlug = slug?.[1] || null;
  
  const page = parseInt((Array.isArray(resolvedSearch.page) ? resolvedSearch.page[0] : resolvedSearch.page) || '1');
  const pageSize = 12;

  let initialProducts: Product[] = [];

  try {
    // 🌟 核心修正 1：适配最新的过滤条件
    const whereCondition: any = {};
    if (gender) whereCondition.gender = { slug: gender };
    if (categorySlug) whereCondition.categories_some = { slug: categorySlug };

    // 🌟 核心修正 2：更新 GraphQL 查询语句
    // 删除了根层级的 images，改为从第一个变体获取首张图片
    const data: any = await hygraph.request(`
      query GetCollectionProducts($where: ProductWhereInput, $first: Int, $skip: Int) {
        products(
          first: $first, 
          skip: $skip, 
          orderBy: publishedAt_DESC, 
          where: $where
        ) {
          id 
          name 
          slug 
          price 
          isNew
          # 从变体中获取预览图
          variants(first: 1) {
            ... on ProductVariant {
              images(first: 1) {
                url
              }
            }
          }
        }
      }
    `, { 
      where: whereCondition,
      first: pageSize,
      skip: (page - 1) * pageSize
    });

    // 🌟 核心修正 3：数据格式化
    initialProducts = (data.products || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      isNew: p.isNew,
      // 将变体中的图片提取到顶层数组，确保 ProductGrid 组件能正常读取
      images: p.variants?.[0]?.images?.map((img: any) => img.url) || ['/images/placeholder.jpg']
    }));
  } catch (e) { 
    console.error("Hygraph Fetch Error:", e); 
  }

  // 2. JSON-LD 结构化数据
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `LINJIN LUXURY ${gender || 'Full'} Collection`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": initialProducts.length,
      "itemListElement": initialProducts.map((p, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "item": {
          "@type": "Product",
          "name": p.name,
          "url": `https://www.linjinluxury.com/product/${p.slug}`,
          "image": p.images[0],
          "offers": {
            "@type": "Offer",
            "price": p.price,
            "priceCurrency": "USD"
          }
        }
      }))
    }
  };

  return (
    <main className="bg-white min-h-screen text-black selection:bg-black selection:text-white">
      <Script id="collection-jsonld" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-48 pb-20">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.6em] text-black/30 mb-10 font-medium">
            Atelier Direct Passage
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extralight tracking-[0.05em] uppercase mb-12 text-black leading-[1.1]">
            {gender || 'THE FULL'} <br className="md:hidden" /> 
            {categorySlug ? categorySlug.replace('-', ' ') : 'COLLECTION'}
          </h1>
          <div className="w-12 h-px bg-black/20 mx-auto mb-12"></div>
          <p className="max-w-xl mx-auto text-[11px] uppercase tracking-[0.3em] leading-[2.6] text-black/50 font-light px-4">
            Archival creations. Hand-attended materiality. <br />
            Untouched from the bench to your collection.
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex justify-center gap-12 mt-28">
          {['all', 'women', 'men'].map((t) => (
            <Link 
              key={t} 
              href={`/collection/${t}`} 
              className={`text-[10px] uppercase tracking-[0.5em] pb-1 border-b transition-all duration-700 
                ${rawGender === t 
                  ? 'border-black text-black opacity-100' 
                  : 'border-transparent text-black opacity-30 hover:opacity-100 hover:border-black/20'
                }`}
            >
              {t}
            </Link>
          ))}
        </nav>
      </section>

      {/* Grid Section */}
      <section className="max-w-[1600px] mx-auto px-8 pb-16">
        <ProductGrid 
          initialProducts={initialProducts} 
          category={categorySlug} 
          gender={gender} 
        />
        {initialProducts.length === 0 && (
          <div className="py-20 text-center text-[10px] uppercase tracking-widest text-black/40">
            No items found in this category.
          </div>
        )}
      </section>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-12 pb-40">
        {page > 1 ? (
          <Link 
            href={`/collection/${slug?.join('/') || 'all'}?page=${page - 1}`}
            className="text-[10px] uppercase tracking-[0.4em] px-10 py-4 border border-black/10 hover:bg-black hover:text-white transition-all duration-500"
          >
            Prev
          </Link>
        ) : (
          <span className="text-[10px] uppercase tracking-[0.4em] px-10 py-4 border border-black/5 text-black/5 cursor-not-allowed">Prev</span>
        )}
        <span className="text-[10px] tracking-[0.6em] text-black/20 font-light">{page}</span>
        {initialProducts.length === pageSize ? (
          <Link 
            href={`/collection/${slug?.join('/') || 'all'}?page=${page + 1}`}
            className="text-[10px] uppercase tracking-[0.4em] px-10 py-4 border border-black/10 hover:bg-black hover:text-white transition-all duration-500"
          >
            Next
          </Link>
        ) : (
          <span className="text-[10px] uppercase tracking-[0.4em] px-10 py-4 border border-black/5 text-black/5 cursor-not-allowed">Next</span>
        )}
      </div>
    </main>
  );
}