import { fetchFromHygraph } from '@/lib/hygraph';
import ProductClient from './ProductClient'; 
import { gql } from 'graphql-request';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Script from 'next/script';

/**
 * 1. 类型定义
 */
type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300; 

/**
 * 2. GraphQL 查询定义
 */
const GET_PRODUCT_DEEP = gql`
  query GetProductDeep($slug: String!) {
    product(where: { slug: $slug }, stage: PUBLISHED) {
      id
      name
      slug
      price
      seoTitle        
      seoDescription 
      description { 
        html 
        text 
      }
      size: dimensions
      materialsCare { html }
      material
      altText
      stock
      category {
        name
        slug
      }
      gender {
        name
        slug
      }
      variants {
        ... on ProductVariant {
          id
          productColorEnum
          images { url width height }
        }
      }
    }
  }
`;

const GET_RECOMMENDED_PRODUCTS = gql`
  query GetRecommendedProducts($currentId: ID!, $categorySlug: String) {
    products(
      where: { 
        id_not: $currentId,
        category: { slug: $categorySlug }
      }, 
      first: 4, 
      stage: PUBLISHED
    ) {
      id
      name
      slug
      price
      variants(first: 1) {
        ... on ProductVariant {
          images(first: 1) { url }
        }
      }
    }
  }
`;

function getRealPath(product: any, baseUrl: string) {
  const gender = product.gender?.slug || 'shop';
  const category = product.category?.slug || 'all';
  return `${baseUrl}/${gender}/${category}/${product.slug}`;
}

export async function generateStaticParams() {
  const GET_ALL_SLUGS = gql` query { products(stage: PUBLISHED) { slug } } `;
  try {
    const data: any = await fetchFromHygraph(GET_ALL_SLUGS);
    return data.products?.map((prod: any) => ({ slug: prod.slug })) || [];
  } catch { return []; }
}

/**
 * 3. 增强后的 Metadata 配置
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = 'https://www.linjinluxury.com';

  try {
    const data: any = await fetchFromHygraph(GET_PRODUCT_DEEP, { slug });
    const product = data?.product;
    if (!product) return { title: 'Product Not Found | LINJIN LUXURY' };

    const realPath = getRealPath(product, baseUrl);
    const firstImg = product.variants?.[0]?.images?.[0]?.url || `${baseUrl}/og-default.jpg`;
    
    const title = product.seoTitle || `${product.name} | LINJIN LUXURY`;
    const seoDescription = (product.seoDescription || product.description?.text || product.altText || product.name)
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160);

    return {
      title,
      description: seoDescription,
      keywords: [product.name, 'LINJIN LUXURY', product.category?.name || '', 'Luxury Fashion'].filter(Boolean),
      authors: [{ name: 'LINJIN LUXURY' }],
      alternates: { canonical: realPath },
      robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
      },
      openGraph: {
        title,
        description: seoDescription,
        url: realPath,
        siteName: 'LINJIN LUXURY',
        images: [{ url: firstImg, width: 1200, height: 630, alt: product.name }],
        type: 'website', 
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: seoDescription,
        images: [firstImg],
      },
      other: {
        'product:price:amount': product.price.toString(),
        'product:price:currency': 'USD',
      }
    };
  } catch { return { title: 'LINJIN LUXURY' }; }
}

/**
 * 4. 页面主体渲染
 */
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const baseUrl = 'https://www.linjinluxury.com';

  try {
    const productData: any = await fetchFromHygraph(GET_PRODUCT_DEEP, { slug });
    if (!productData?.product) return notFound();

    const product = productData.product;
    const realPath = getRealPath(product, baseUrl);
    
    const recData: any = await fetchFromHygraph(GET_RECOMMENDED_PRODUCTS, { 
      currentId: product.id,
      categorySlug: product.category?.slug || ""
    });

    const jsonDescription = (product.seoDescription || product.description?.text || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 260) || product.name;

    const variants = product.variants || [];
    const firstVariantImages = variants[0]?.images || [];
    const validImages = firstVariantImages.length > 0 
      ? firstVariantImages.map((img: any) => img.url)
      : [`${baseUrl}/og-default.jpg`];

    const safeProduct = {
      ...product,
      description: product.description?.html || '',
      materialsCare: product.materialsCare?.html || '', 
      plainDescription: jsonDescription,
      size: product.size, 
      colors: variants.map((v: any) => ({
        id: v.id,
        name: v.productColorEnum || 'Classic',
        images: v.images || []
      })),
      images: firstVariantImages
    };

    const recommendedProducts = recData?.products?.map((p: any) => ({
      ...p,
      images: p.variants?.[0]?.images || []
    })) || [];

    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const validUntil = nextYear.toISOString().split('T')[0];

    // JSON-LD 数据结构 (SEO 核心)
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`,
          "name": "LINJIN LUXURY",
          "url": baseUrl,
          "logo": `${baseUrl}/logo.png`
        },
        {
          "@type": "Product",
          "@id": `${realPath}#product`,
          "name": product.name,
          "description": jsonDescription,
          "image": validImages,
          "sku": product.id,
          "mpn": product.id,
          "brand": {
            "@type": "Brand",
            "name": "LINJIN LUXURY"
          },
          "material": product.material || "Full-grain Leather",
          "color": product.variants?.[0]?.productColorEnum || "Black",
          "category": product.category?.name,
          "url": realPath,
          ...(recommendedProducts.length > 0 && {
            "isSimilarTo": recommendedProducts.map((p: any) => ({
              "@type": "Product",
              "name": p.name,
              "url": `${baseUrl}/product/${p.slug}` 
            }))
          }),
          "offers": {
            "@type": "Offer",
            "priceCurrency": "USD",
            "price": product.price.toString(),
            "priceValidUntil": validUntil,
            "itemCondition": "https://schema.org/NewCondition",
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": realPath,
            "shippingDetails": {
              "@type": "OfferShippingDetails",
              "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "USD" },
              "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "US" },
              "deliveryTime": {
                "@type": "ShippingDeliveryTime",
                "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "d" },
                "transitTime": { "@type": "QuantitativeValue", "minValue": 3, "maxValue": 10, "unitCode": "d" }
              }
            }
          }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
            { 
              "@type": "ListItem", 
              "position": 2, 
              "name": product.gender?.name || "Shop", 
              "item": `${baseUrl}/${product.gender?.slug || 'shop'}` 
            },
            { 
              "@type": "ListItem", 
              "position": 3, 
              "name": product.category?.name || "Collection", 
              "item": `${baseUrl}/${product.gender?.slug || 'shop'}/${product.category?.slug || 'all'}` 
            },
            { 
              "@type": "ListItem", 
              "position": 4, 
              "name": product.name, 
              "item": realPath 
            }
          ]
        }
      ]
    };

    return (
      <main className="min-h-screen bg-white">
        <Script id={`product-ld-${product.id}`} type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </Script>

        <ProductClient 
          product={safeProduct} 
          recommendedProducts={recommendedProducts} 
        />
      </main>
    );

  } catch (error) {
    console.error('🔥 LinJin Build Error:', error);
    return notFound();
  }
}