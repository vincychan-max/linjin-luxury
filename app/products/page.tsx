import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { hygraph } from '@/lib/hygraph';

/** ====================== ISR ====================== */
export const revalidate = 3600;
export const dynamicParams = true;

/** ====================== Types ====================== */
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  variants: { images: { url: string }[] }[];
}

/** ====================== SEO ====================== */
const BASE_URL = 'https://www.linjinluxury.com';

/** ====================== Metadata ====================== */
export const metadata: Metadata = {
  title: 'The Archive | Limited Leather Editions | LINJIN LUXURY',
  description:
    'Exclusive limited production leather goods and private label manufacturing archive from LINJIN LUXURY Atelier.',
  alternates: {
    canonical: `${BASE_URL}/limited`,
  },
  openGraph: {
    title: 'The Archive | LINJIN LUXURY',
    description:
      'Luxury leather manufacturing archive & limited editions.',
    url: `${BASE_URL}/limited`,
    siteName: 'LINJIN LUXURY',
    images: [
      {
        url: `${BASE_URL}/og-archive.jpg`,
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
};

/** ====================== Page ====================== */
export default async function LimitedArchivePage() {
  const formatCurrency = (price: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);

  /** ====================== Data ====================== */
  const data = await hygraph.request<{
    products: Product[];
  }>(`
    query GetArchiveProducts {
      products(where: { isLimited: true }, orderBy: createdAt_DESC) {
        id
        name
        slug
        price
        variants(first: 1) {
          ... on ProductVariant {
            images(first: 1) {
              url
            }
          }
        }
      }
    }
  `);

  const products =
    data.products?.map((p) => ({
      ...p,
      previewImage:
        p.variants?.[0]?.images?.[0]?.url || '/placeholder.jpg',
    })) || [];

  /** ====================== JSON-LD (Archive 2.0 Core) ====================== */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${BASE_URL}/limited#archive`,
        name: 'The Archive - LINJIN LUXURY Limited Editions',
        url: `${BASE_URL}/limited`,
        description:
          'Luxury leather manufacturing archive and limited production system.',

        /** 🧠 AI ENTITY LAYER */
        about: {
          '@type': 'Thing',
          name: 'Luxury Leather Manufacturing Archive',
        },

        keywords: [
          'luxury leather bags',
          'limited edition handbags',
          'OEM leather manufacturer',
          'private label manufacturing',
          'Hong Kong leather atelier',
        ],

        mainEntity: {
          '@type': 'ItemList',
          name: 'Archive Product Cluster',
          numberOfItems: products.length,

          itemListElement: products.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,

            item: {
              '@type': 'Product',
              '@id': `${BASE_URL}/limited/${p.slug}#product`,
              name: p.name,
              url: `${BASE_URL}/limited/${p.slug}`,

              image: p.previewImage,

              brand: {
                '@type': 'Brand',
                name: 'LINJIN LUXURY',
              },

              offers: {
                '@type': 'Offer',
                price: p.price,
                priceCurrency: 'USD',
                availability:
                  'https://schema.org/InStock',
              },
            },
          })),
        },
      },
    ],
  };

  /** ====================== UI ====================== */
  return (
    <main
      id="archive-page"
      className="bg-black text-white min-h-screen pt-40 pb-32 px-6 md:px-20"
    >
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* ====================== AI ENTITY LAYER ====================== */}
      <section className="sr-only" aria-hidden="true">
        <h2>LINJIN LUXURY Manufacturing Archive</h2>
        <p>
          Archive system representing limited leather production,
          OEM manufacturing, and private label atelier network.
        </p>
        <ul>
          <li>Luxury Leather Manufacturing Cluster</li>
          <li>Limited Edition Production System</li>
          <li>Private Label OEM Capability</li>
          <li>Hong Kong Atelier Network</li>
        </ul>
      </section>

      {/* ====================== Header ====================== */}
      <header className="max-w-6xl mx-auto mb-24 border-b border-white/10 pb-10">
        <span className="text-[10px] tracking-[0.4em] text-white/40 uppercase">
          Atelier Registry / 2026
        </span>

        <h1 className="text-5xl md:text-7xl font-light uppercase mt-6">
          The <span className="italic text-white/60">Archive</span>
        </h1>

        <p className="text-white/40 mt-6 text-sm max-w-xl leading-relaxed">
          Limited production leather goods, private label manufacturing,
          and bespoke atelier editions.
        </p>

        <p className="text-[10px] text-white/20 mt-6 uppercase tracking-[0.3em]">
          Total {products.length} Editions
        </p>
      </header>

      {/* ====================== Grid ====================== */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/limited/${p.slug}`}
            className="group"
          >
            <div className="relative aspect-[4/5] bg-neutral-900 overflow-hidden mb-6">
              <Image
                src={p.previewImage}
                alt={p.name}
                fill
                className="object-cover group-hover:scale-105 transition duration-700 opacity-80 group-hover:opacity-100"
              />
            </div>

            <h2 className="text-sm uppercase tracking-[0.2em] font-light">
              {p.name}
            </h2>

            <p className="text-[10px] text-white/40 mt-2 uppercase tracking-[0.3em]">
              Limited Archive / Atelier Series
            </p>

            <p className="mt-4 text-white/70">
              {formatCurrency(p.price)}
            </p>
          </Link>
        ))}
      </section>

      {/* ====================== Internal Link Graph ====================== */}
      <footer className="mt-40 pt-20 border-t border-white/10 text-center">
        <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] mb-10">
          Explore Archive Clusters
        </p>

        <div className="flex flex-wrap justify-center gap-10 text-[10px] uppercase tracking-[0.3em]">
          <Link href="/collection/women">Women Cluster</Link>
          <Link href="/collection/men">Men Cluster</Link>
          <Link href="/collection/all?type=limited">
            Limited Editions
          </Link>
          <Link href="/contact">OEM Inquiry</Link>
        </div>
      </footer>
    </main>
  );
}