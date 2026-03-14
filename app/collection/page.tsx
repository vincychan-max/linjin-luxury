import { Metadata } from 'next';
import { hygraph } from '@/lib/hygraph';
import Link from 'next/link';
import ProductGrid from '../components/ProductGrid';

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  isNew?: boolean;
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// 开启 ISR：每小时自动生成一次静态页面，极致的加载速度有利于 Google 排名
export const revalidate = 3600;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolved = await searchParams;
  const gender = (Array.isArray(resolved.gender) ? resolved.gender[0] : resolved.gender)?.toLowerCase();
  return {
    title: `LINJIN LUXURY | ${gender ? gender.toUpperCase() : 'FULL'} COLLECTION`,
    description: "Curated premium designer handbags from our Los Angeles studio. Master quality craftsmanship at honest pricing.",
  };
}

export default async function CollectionPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const gender = (Array.isArray(resolved.gender) ? resolved.gender[0] : resolved.gender)?.toLowerCase() || null;
  const category = (Array.isArray(resolved.category) ? resolved.category[0] : resolved.category) || null;

  let initialProducts: Product[] = [];

  try {
    const whereConditions: any = { AND: [] };
    if (gender) whereConditions.AND.push({ gender: { slug: gender } });
    if (category) whereConditions.AND.push({ subCategories_some: { slug: category } });

    const GET_PRODUCTS = `
      query GetCollectionProducts($where: ProductWhereInput) {
        products(first: 40, orderBy: publishedAt_DESC, where: $where) {
          id
          name
          slug
          price
          images { url }
          isNew
        }
      }
    `;

    const data: any = await hygraph.request(GET_PRODUCTS, { 
      where: whereConditions.AND.length > 0 ? whereConditions : {} 
    });
    
    initialProducts = (data.products || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      images: p.images?.map((img: { url: string }) => img.url) || [],
      isNew: p.isNew
    }));
  } catch (e) {
    console.error('Hygraph fetch error:', e);
  }

  // 结构化数据：AI 能读到 FAQ，但用户在界面上看不到任何冗余文字
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "name": "Linjin Luxury Collection",
        "itemListElement": initialProducts.map((p, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "url": `https://yourdomain.com/product/${p.slug}`,
          "name": p.name
        }))
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Shipping time to USA?",
            "acceptedAnswer": { "@type": "Answer", "text": "Global Express shipping takes 5-7 business days." }
          },
          {
            "@type": "Question",
            "name": "Quality assurance?",
            "acceptedAnswer": { "@type": "Answer", "text": "All items are hand-selected and inspected in our Los Angeles studio." }
          }
        ]
      }
    ]
  };

  return (
    <main className="bg-white min-h-screen text-black">
      {/* 隐形 SEO/AI 注入 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 视觉页眉：极致留白风格 */}
      <section className="max-w-7xl mx-auto px-6 pt-48 pb-20">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.6em] text-black/40 mb-10 font-medium">
            LINJIN LUXURY | STUDIO DIRECT
          </p>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-[0.1em] uppercase mb-12 text-black">
            {gender ? gender : 'THE FULL'} COLLECTION
          </h1>
          
          <div className="w-12 h-px bg-black/20 mx-auto mb-12"></div>
          
          <p className="max-w-2xl mx-auto text-[11px] uppercase tracking-[0.3em] leading-[2.4] text-black/60">
            Curated premium leatherwork. <br className="hidden md:block" />
            Designed for longevity, sourced with integrity.
          </p>
        </div>

        {/* 筛选导航：极简线条风格 */}
        <nav className="flex justify-center gap-12 mt-24">
          {['all', 'women', 'men'].map((t) => {
            const isActive = (t === 'all' && !gender) || gender === t;
            return (
              <Link 
                key={t} 
                href={t === 'all' ? '/collection' : `/collection?gender=${t}`}
                className={`text-[11px] uppercase tracking-[0.4em] pb-1 border-b transition-all duration-500 ${
                  isActive ? 'border-black text-black' : 'border-transparent text-black/20 hover:text-black hover:border-black/20'
                }`}
              >
                {t}
              </Link>
            );
          })}
        </nav>
      </section>

      {/* 产品展示区域 */}
      <section className="max-w-[1500px] mx-auto px-8 pb-32">
        <ProductGrid 
          initialProducts={initialProducts} 
          category={category} 
          gender={gender} 
        />
      </section>

      {/* 底部信任条：用极简排版替代 FAQ，既满足信息传递又好看 */}
      <footer className="border-t border-black/5 py-32 bg-[#FFFFFF]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-y-20 text-center">
          <div>
            <h4 className="text-[11px] font-bold tracking-[0.4em] uppercase mb-4 text-black text-center">GLOBAL EXPRESS</h4>
            <p className="text-[9px] tracking-[0.25em] text-black/40 uppercase">5-7 Business Days</p>
          </div>
          <div>
            <h4 className="text-[11px] font-bold tracking-[0.4em] uppercase mb-4 text-black text-center">MASTER QUALITY</h4>
            <p className="text-[9px] tracking-[0.25em] text-black/40 uppercase">Hand-Selected in LA</p>
          </div>
          <div>
            <h4 className="text-[11px] font-bold tracking-[0.4em] uppercase mb-4 text-black text-center">DIRECT ACCESS</h4>
            <p className="text-[9px] tracking-[0.25em] text-black/40 uppercase">No Retail Markup</p>
          </div>
        </div>
      </footer>
    </main>
  );
}