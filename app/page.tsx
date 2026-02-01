import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import InstagramCarousel from './components/InstagramCarousel';
import { adminDb } from '../lib/firebaseAdmin';

type Product = {
  id: string;
  name: string;
  price: number;
  images?: string[];
  code?: string;
  created_at?: any;
  isLimited?: boolean;
};

export const dynamic = 'force-dynamic'; // 强制动态渲染，禁用缓存，确保每次都实时查询
export const revalidate = 0; // 额外保险，彻底关闭 ISR

export const metadata: Metadata = {
  title: 'Linjin Luxury | Authentic New Premium Handbags in Los Angeles',
  description:
    'Discover authentic new luxury handbags in pristine condition from Linjin Luxury, based in Los Angeles. Premium designer bags with guaranteed authenticity.',
  openGraph: {
    title: 'Linjin Luxury | Authentic Luxury Handbags Los Angeles',
    description:
      'Premium authentic new designer handbags in Los Angeles. 100% authentic, pristine condition.',
    images: ['/images/hero-main.jpg'],
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.linjinluxury.com',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/hero-main.jpg'],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.linjinluxury.com',
  },
};

export default async function HomePage() {
  const toTitleCase = (str: string): string => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const blurDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAgoB/4D1f0AAAAASUVORK5CYII=';

  let newArrivals: Product[] = [];
  let limitedProducts: Product[] = [];
  let uniqueProducts: Product[] = [];

  // 分开查询 + 详细调试日志（方便在 Vercel Logs 查看）
  let newSnap: any = null;
  let limitedSnap: any = null;

  try {
    newSnap = await adminDb.collection('products').orderBy('created_at', 'desc').limit(8).get();
    console.log('New Arrivals query success');
    console.log('New docs count:', newSnap.size);
    console.log('New docs IDs:', newSnap.docs.map((doc: any) => doc.id));
  } catch (e) {
    console.error('New Arrivals query error:', e);
  }

  try {
    limitedSnap = await adminDb
      .collection('products')
      .where('isLimited', '==', true)
      .orderBy('price', 'desc')
      .limit(8)
      .get();
    console.log('Limited Edition query success');
    console.log('Limited docs count:', limitedSnap.size);
    console.log('Limited docs IDs:', limitedSnap.docs.map((doc: any) => doc.id));
  } catch (e) {
    console.error('Limited Edition query error:', e);
  }

  const mapProduct = (doc: any): Product => {
    const data = doc.data();
    let displayImage = '/images/placeholder.jpg';

    if (data.mainImage && data.mainImage !== '') {
      displayImage = data.mainImage;
    } else if (data.colorImages && typeof data.colorImages === 'object') {
      const colors = Object.values(data.colorImages);
      for (const colorArray of colors) {
        if (Array.isArray(colorArray) && colorArray.length > 0 && typeof colorArray[0] === 'string') {
          displayImage = colorArray[0];
          break;
        }
      }
    } else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      displayImage = data.images[0];
    }

    return {
      id: doc.id,
      name: data.name || 'Untitled',
      price: Number(data.price) || 0,
      images: [displayImage],
      code: data.code || '',
      created_at: data.created_at,
      isLimited: data.isLimited || false,
    };
  };

  if (newSnap && newSnap.size > 0) {
    newArrivals = newSnap.docs.map(mapProduct);
  }
  if (limitedSnap && limitedSnap.size > 0) {
    limitedProducts = limitedSnap.docs.map(mapProduct);
  }

  console.log('Final newArrivals count:', newArrivals.length);
  console.log('Final limitedProducts count:', limitedProducts.length);

  // 强制 fallback：真实数据为空时显示测试卡片（避免全灰 skeleton）
  if (newArrivals.length === 0) {
    console.log('Using fallback test data for newArrivals');
    newArrivals = [
      { id: 'test1', name: 'Test Premium Bag', price: 2800, images: ['/images/placeholder.jpg'] },
      { id: 'test2', name: 'Elegant Tote', price: 3500, images: ['/images/placeholder.jpg'] },
      { id: 'test3', name: 'Classic Clutch', price: 1900, images: ['/images/placeholder.jpg'] },
      { id: 'test4', name: 'Designer Crossbody', price: 4200, images: ['/images/placeholder.jpg'] },
    ];
  }

  if (limitedProducts.length === 0) {
    console.log('Using fallback test data for limitedProducts');
    limitedProducts = [
      { id: 'limited1', name: 'Limited Edition Hermes', price: 6800, images: ['/images/placeholder.jpg'], isLimited: true },
      { id: 'limited2', name: 'Rare Chanel Flap', price: 8500, images: ['/images/placeholder.jpg'], isLimited: true },
    ];
  }

  uniqueProducts = Array.from(
    new Map([...newArrivals, ...limitedProducts].map(p => [p.id, p])).values()
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.linjinluxury.com';

  return (
    <>
      {/* Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [{
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": siteUrl
            }]
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Linjin Luxury',
            url: siteUrl,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${siteUrl}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Linjin Luxury',
            url: siteUrl,
            logo: `${siteUrl}/images/logo.png`,
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Los Angeles',
              addressRegion: 'CA',
              addressCountry: 'US',
            },
            areaServed: {
              '@type': 'AdministrativeArea',
              name: 'Los Angeles, California',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '5.0',
              bestRating: '5',
              reviewCount: '142',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Premium Luxury Handbags Collection',
            description: 'Curated collection of authentic new premium designer handbags from Linjin Luxury in Los Angeles.',
            url: siteUrl,
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: uniqueProducts.map((product, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'Product',
                  name: product.name,
                  image: product.images?.[0] || '/images/placeholder.jpg',
                  url: `${siteUrl}/product/${product.id}`,
                  offers: {
                    '@type': 'Offer',
                    priceCurrency: 'USD',
                    price: product.price ? Number(product.price).toFixed(2) : undefined,
                  },
                },
              })),
            },
          }),
        }}
      />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/hero-main.jpg"
          alt="Linjin Luxury - Authentic Premium Handbags in Los Angeles"
          fill
          priority
          placeholder="blur"
          blurDataURL={blurDataURL}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent pointer-events-none z-0" />
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-widest uppercase mb-8 drop-shadow-2xl">
            Linjin Luxury
          </h1>
          <p className="text-2xl sm:text-3xl md:text-5xl tracking-widest mb-12 drop-shadow-2xl">
            Pristine Luxury Handbags<br className="sm:hidden" /> Los Angeles
          </p>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            <Link
              href="#new-arrivals"
              className="no-underline inline-block px-12 py-6 sm:px-16 sm:py-8 bg-white !text-black hover:!text-black text-2xl uppercase tracking-widest hover:bg-gray-100 !outline-none !ring-0 focus:!outline-none focus:!ring-0 focus-visible:!outline-none hover:!outline-none [-webkit-tap-highlight-color:transparent] transition shadow-2xl rounded-full font-bold active:scale-95"
            >
              For Her
            </Link>
            <Link
              href="/collection?gender=men"
              className="no-underline inline-block px-12 py-6 sm:px-16 sm:py-8 bg-black !text-white hover:!text-white text-2xl uppercase tracking-widest hover:opacity-90 !outline-none !ring-0 focus:!outline-none focus:!ring-0 focus-visible:!outline-none hover:!outline-none [-webkit-tap-highlight-color:transparent] transition shadow-2xl rounded-full font-bold active:scale-95"
            >
              For Him
            </Link>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-bold tracking-widest uppercase mb-6">
            Shop by Category
          </h2>
          <p className="text-xl md:text-2xl tracking-wider opacity-80">
            Curated selections from our Los Angeles collection
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <Link href="/collection?category=women" className="group block">
            <div className="relative aspect-[4/5] overflow-hidden mb-8 bg-gray-100">
              <Image
                src="/images/cat-women.jpg"
                alt="Women's Luxury Handbags Collection"
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                placeholder="blur"
                blurDataURL={blurDataURL}
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-40 transition" />
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold uppercase tracking-widest text-center">
              WOMEN
            </h3>
          </Link>
          <Link href="/collection?category=Women's Small Leather Goods" className="group block">
            <div className="relative aspect-[4/5] overflow-hidden mb-8 bg-gray-100">
              <Image
                src="/images/cat-women's small leather goods.jpg"
                alt="Women's Small Leather Goods Collection"
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                placeholder="blur"
                blurDataURL={blurDataURL}
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-40 transition" />
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold uppercase tracking-widest text-center">
              Women's Small Leather Goods
            </h3>
          </Link>
          <Link href="/collection?category=Women's Shoes" className="group block">
            <div className="relative aspect-[4/5] overflow-hidden mb-8 bg-gray-100">
              <Image
                src="/images/cat-women's shoes.jpg"
                alt="Women's Shoes Collection"
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                placeholder="blur"
                blurDataURL={blurDataURL}
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-40 transition" />
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold uppercase tracking-widest text-center">
              Women's Shoes
            </h3>
          </Link>
          <Link href="/collection?category=Beauty" className="group block">
            <div className="relative aspect-[4/5] overflow-hidden mb-8 bg-gray-100">
              <Image
                src="/images/cat-beauty.jpg"
                alt="Beauty Collection"
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                placeholder="blur"
                blurDataURL={blurDataURL}
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-40 transition" />
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold uppercase tracking-widest text-center">
              Beauty
            </h3>
          </Link>
          <Link href="/collection?category=men" className="group block">
            <div className="relative aspect-[4/5] overflow-hidden mb-8 bg-gray-100">
              <Image
                src="/images/cat-men.jpg"
                alt="Men's Luxury Collection"
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                placeholder="blur"
                blurDataURL={blurDataURL}
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-40 transition" />
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold uppercase tracking-widest text-center">
              men
            </h3>
          </Link>
          <Link href="/collection?category=Men's Small Leather Goods" className="group block">
            <div className="relative aspect-[4/5] overflow-hidden mb-8 bg-gray-100">
              <Image
                src="/images/cat-men's small leather goods.jpg"
                alt="Men's Small Leather Goods Collection"
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                placeholder="blur"
                blurDataURL={blurDataURL}
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-40 transition" />
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold uppercase tracking-widest text-center">
              Men's Small Leather Goods
            </h3>
          </Link>
          <Link href="/collection?category=Men's Shoes" className="group block">
            <div className="relative aspect-[4/5] overflow-hidden mb-8 bg-gray-100">
              <Image
                src="/images/cat-men's Shoes.jpg"
                alt="Men's Shoes Collection"
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                placeholder="blur"
                blurDataURL={blurDataURL}
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-40 transition" />
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold uppercase tracking-widest text-center">
              Men's Shoes
            </h3>
          </Link>
          <Link href="/collection?category=accessories" className="group block">
            <div className="relative aspect-[4/5] overflow-hidden mb-8 bg-gray-100">
              <Image
                src="/images/cat-accessories.jpg"
                alt="Accessories Collection"
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                placeholder="blur"
                blurDataURL={blurDataURL}
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-40 transition" />
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold uppercase tracking-widest text-center">
              ACCESSORIES
            </h3>
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      <section id="new-arrivals" className="max-w-7xl mx-auto px-6 py-32 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-bold tracking-widest uppercase">
            New Arrivals
          </h2>
          <p className="text-xl md:text-2xl tracking-wider opacity-80 mt-6">
            Fresh from Los Angeles — the latest pristine arrivals
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-20 justify-items-center">
          {newArrivals.length > 0 ? (
            newArrivals.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group block max-w-sm w-full">
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 rounded-3xl shadow-2xl">
                  <Image
                    src={product.images?.[0] || '/images/placeholder.jpg'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 45vw, 25vw"
                    placeholder="blur"
                    blurDataURL={blurDataURL}
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h4 className="mt-10 text-2xl md:text-3xl font-semibold tracking-widest text-center">
                  {toTitleCase(product.name)}
                </h4>
                <p className="mt-4 text-3xl md:text-4xl font-bold text-center">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                  }).format(product.price)}
                </p>
              </Link>
            ))
          ) : (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="group block max-w-sm w-full animate-pulse">
                <div className="aspect-[4/5] bg-gray-200 rounded-3xl" />
                <div className="mt-10 h-10 bg-gray-200 rounded w-3/4 mx-auto" />
                <div className="mt-4 h-12 bg-gray-200 rounded w-1/2 mx-auto" />
              </div>
            ))
          )}
        </div>
        {newArrivals.length > 0 && (
          <div className="text-center mt-24">
            <Link
              href="/collection"
              className="no-underline inline-block px-12 py-6 sm:px-16 sm:py-8 bg-black !text-white hover:!text-white text-2xl uppercase tracking-widest hover:opacity-90 !outline-none !ring-0 focus:!outline-none focus:!ring-0 focus-visible:!outline-none hover:!outline-none [-webkit-tap-highlight-color:transparent] transition shadow-2xl rounded-full font-bold active:scale-95"
            >
              Shop the Collection →
            </Link>
          </div>
        )}
      </section>

      {/* Limited Edition */}
      <section className="max-w-7xl mx-auto px-6 py-32 bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-bold tracking-widest uppercase">
            Limited Edition
          </h2>
          <p className="text-xl md:text-2xl tracking-wider opacity-80 mt-6">
            Rare treasures — privately curated exclusives
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-20 justify-items-center">
          {limitedProducts.length > 0 ? (
            limitedProducts.map((product) => (
              <Link
                key={product.id}
                href={product.isLimited ? `/limited/${product.id}` : `/product/${product.id}`}
                className="group block max-w-sm w-full"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 rounded-3xl shadow-2xl">
                  <Image
                    src={product.images?.[0] || '/images/placeholder.jpg'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 45vw, 25vw"
                    placeholder="blur"
                    blurDataURL={blurDataURL}
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h4 className="mt-10 text-xl md:text-2xl font-semibold tracking-widest text-center">
                  {toTitleCase(product.name)}
                </h4>
                <p className="mt-4 text-3xl md:text-4xl font-bold text-center">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                  }).format(product.price)}
                </p>
              </Link>
            ))
          ) : (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="group block max-w-sm w-full animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded-3xl" />
                <div className="mt-10 h-8 bg-gray-200 rounded w-3/4 mx-auto" />
                <div className="mt-4 h-12 bg-gray-200 rounded w-1/2 mx-auto" />
              </div>
            ))
          )}
        </div>
        {limitedProducts.length > 0 && (
          <div className="text-center mt-24">
            <Link
              href="/collection"
              className="no-underline inline-block px-12 py-6 sm:px-16 sm:py-8 bg-black !text-white hover:!text-white text-2xl uppercase tracking-widest hover:opacity-90 !outline-none !ring-0 focus:!outline-none focus:!ring-0 focus-visible:!outline-none hover:!outline-none [-webkit-tap-highlight-color:transparent] transition shadow-2xl rounded-full font-bold active:scale-95"
            >
              Shop the Collection →
            </Link>
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="bg-white py-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-bold tracking-widest uppercase mb-4">
            Client Testimonials
          </h2>
          <p className="text-2xl md:text-3xl tracking-wider mb-20 opacity-90">
            Rated <span className="font-bold text-yellow-500">5.0 ★★★★★</span> based on 142 reviews
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="bg-gray-50 p-12 rounded-3xl shadow-lg">
              <p className="text-lg italic mb-8">"Exceptional quality and discreet service. My favorite purchase ever."</p>
              <p className="font-semibold">— Sarah L., Los Angeles</p>
              <div className="text-yellow-500 mt-4 text-2xl">★★★★★</div>
            </div>
            <div className="bg-gray-50 p-12 rounded-3xl shadow-lg">
              <p className="text-lg italic mb-8">"Pristine condition and 100% authentic. Highly recommend."</p>
              <p className="font-semibold">— Emma R.</p>
              <div className="text-yellow-500 mt-4 text-2xl">★★★★★</div>
            </div>
            <div className="bg-gray-50 p-12 rounded-3xl shadow-lg">
              <p className="text-lg italic mb-8">"Elegant selection and swift shipping from LA."</p>
              <p className="font-semibold">— Olivia M.</p>
              <div className="text-yellow-500 mt-4 text-2xl">★★★★★</div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Feed */}
      <section className="max-w-7xl mx-auto px-6 py-24 bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold tracking-widest uppercase mb-6">
            Follow Us @linjinluxury
          </h2>
          <p className="text-xl md:text-2xl tracking-wider opacity-80 mb-8">
            Exclusive behind-the-scenes, client styling inspiration, and new arrivals
          </p>
          <Link
            href="https://www.instagram.com/linjinluxury"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-16 py-6 border-2 border-black text-black text-xl uppercase tracking-widest hover:bg-black hover:text-white transition rounded-full font-semibold"
          >
            Follow on Instagram →
          </Link>
        </div>
        <InstagramCarousel />
      </section>

      {/* About + Trust Signals */}
      <section className="bg-white py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-widest uppercase mb-12">
            About Linjin Luxury
          </h2>
          <p className="text-xl md:text-2xl leading-relaxed mb-12 max-w-3xl mx-auto">
            Based in Los Angeles, Linjin Luxury specializes in authentic new premium designer handbags in pristine condition. 
            Each piece is meticulously sourced to guarantee 100% authenticity and exceptional quality for discerning collectors.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-lg">
            <div>
              <p className="font-semibold uppercase tracking-wider mb-4">100% Authentic</p>
              <p>Guaranteed genuine designer pieces</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wider mb-4">Pristine Condition</p>
              <p>New or like-new premium handbags</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-widest mb-4">Los Angeles Based</p>
              <p>Local expertise and discreet shipping</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Commitments + FAQ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-bold tracking-widest uppercase text-center mb-16">
            Our Commitments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <details className="group text-center">
              <summary className="cursor-pointer list-none">
                <div className="mb-10 text-8xl opacity-70 group-open:opacity-100 transition-opacity">
                  🔒
                </div>
                <h3 className="text-3xl font-semibold uppercase tracking-widest mb-6">
                  Guaranteed Authenticity
                </h3>
                <p className="text-lg leading-relaxed opacity-80 mb-8 max-w-sm mx-auto">
                  Every handbag is meticulously verified by Los Angeles-based experts, accompanied by provenance documentation upon request.
                </p>
                <Link href="/faq#authenticity" className="text-lg uppercase tracking-widest border-b-2 border-black pb-1 hover:border-gray-600 transition inline-block">
                  Learn More →
                </Link>
              </summary>
              <div className="mt-10 space-y-6 text-left max-w-sm mx-auto">
                <div>
                  <p className="font-semibold mb-2">How do you verify authenticity?</p>
                  <p className="text-base opacity-80">We use a multi-step process including physical inspection, serial number checks, and comparison with official records.</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Do you provide certificates?</p>
                  <p className="text-base opacity-80">Yes, authenticity certificates and detailed reports are available upon request.</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">What if I doubt an item's authenticity?</p>
                  <p className="text-base opacity-80">We offer third-party authentication options and full refund if proven otherwise.</p>
                </div>
              </div>
            </details>
            <details className="group text-center">
              <summary className="cursor-pointer list-none">
                <div className="mb-10 text-8xl opacity-70 group-open:opacity-100 transition-opacity">
                  ✨
                </div>
                <h3 className="text-3xl font-semibold uppercase tracking-widest mb-6">
                  Pristine Condition
                </h3>
                <p className="text-lg leading-relaxed opacity-80 mb-8 max-w-sm mx-auto">
                  All pieces are presented new or in impeccable like-new condition, carefully preserved with original accessories.
                </p>
                <Link href="/faq#condition" className="text-lg uppercase tracking-widest border-b-2 border-black pb-1 hover:border-gray-600 transition inline-block">
                  Learn More →
                </Link>
              </summary>
              <div className="mt-10 space-y-6 text-left max-w-sm mx-auto">
                <div>
                  <p className="font-semibold mb-2">What does "pristine like-new" mean?</p>
                  <p className="text-base opacity-80">Minimal to no signs of wear, stored properly with all original packaging when available.</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Do items come with original boxes?</p>
                  <p className="text-base opacity-80">Whenever possible, yes — including dust bags, tags, and receipts.</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Are your handbags brand new or pre-owned?</p>
                  <p className="text-base opacity-80">All items are either brand new or in pristine like-new condition with minimal to no signs of wear.</p>
                </div>
              </div>
            </details>
            <details className="group text-center">
              <summary className="cursor-pointer list-none">
                <div className="mb-10 text-8xl opacity-70 group-open:opacity-100 transition-opacity">
                  📦
                </div>
                <h3 className="text-3xl font-semibold uppercase tracking-widest mb-6">
                  Discreet Worldwide Shipping
                </h3>
                <p className="text-lg leading-relaxed opacity-80 mb-8 max-w-sm mx-auto">
                  Secure, unmarked packaging shipped directly from Los Angeles, ensuring complete privacy and swift delivery.
                </p>
                <Link href="/faq#shipping" className="text-lg uppercase tracking-widest border-b-2 border-black pb-1 hover:border-gray-600 transition inline-block">
                  Learn More →
                </Link>
              </summary>
              <div className="mt-10 space-y-6 text-left max-w-sm mx-auto">
                <div>
                  <p className="font-semibold mb-2">How long does shipping take?</p>
                  <p className="text-base opacity-80">US: 1-3 business days. International: 3-7 days. All fully insured and tracked.</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Is packaging really discreet?</p>
                  <p className="text-base opacity-80">Yes — plain boxes with no brand markings for maximum privacy.</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">What about returns?</p>
                  <p className="text-base opacity-80">7-day return window for unworn items. Contact us to arrange.</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">Do you ship internationally?</p>
                  <p className="text-base opacity-80">Yes, we offer fully insured worldwide shipping with tracking.</p>
                </div>
              </div>
            </details>
          </div>
          <div className="text-center mt-20">
            <Link href="/faq" className="text-lg uppercase tracking-widest border-b-2 border-black pb-1 hover:border-gray-600 transition">
              More Questions? View Full FAQ →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}