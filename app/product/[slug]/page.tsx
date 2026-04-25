import { hygraph } from '@/lib/hygraph';
import ProductClient from './ProductClient'; 
import { gql } from 'graphql-request';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Script from 'next/script';

/**
 * 1. 类型定义 (Next.js 15 标准)
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
      dimensions
      materialsCare { html }
      material
      altText
      sizes
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

/**
 * 3. 静态路径生成 (SSG)
 */
export async function generateStaticParams() {
  const GET_ALL_SLUGS = gql` query { products(stage: PUBLISHED) { slug } } `;
  try {
    const data: any = await hygraph.request(GET_ALL_SLUGS);
    return data.products?.map((prod: any) => ({ slug: prod.slug })) || [];
  } catch { return []; }
}

/**
 * 4. 动态 Metadata (SEO 权重策略)
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = 'https://www.linjinluxury.com';

  try {
    const data: any = await hygraph.request(GET_PRODUCT_DEEP, { slug });
    const product = data?.product;
    if (!product) return { title: 'Product Not Found' };

    const firstImg = product.variants?.[0]?.images?.[0]?.url || `${baseUrl}/og-default.jpg`;
    
    const title = product.seoTitle || `${product.name} | LINJIN LUXURY`;
    const seoDescription = (product.seoDescription || product.description?.text || product.altText || product.name)
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160);

    return {
      title,
      description: seoDescription,
      alternates: { canonical: `${baseUrl}/product/${slug}` },
      openGraph: {
        title,
        description: seoDescription,
        url: `${baseUrl}/product/${slug}`,
        images: [{ url: firstImg, width: 1200, height: 630, alt: product.name }],
        type: 'website', 
      },
      other: {
        'product:price:amount': product.price.toString(),
        'product:price:currency': 'USD',
      }
    };
  } catch { return { title: 'LINJIN LUXURY' }; }
}

/**
 * 5. 主页面组件
 */
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const baseUrl = 'https://www.linjinluxury.com';

  try {
    const productData: any = await hygraph.request(GET_PRODUCT_DEEP, { slug });
    if (!productData?.product) return notFound();

    const product = productData.product;
    
    const recData: any = await hygraph.request(GET_RECOMMENDED_PRODUCTS, { 
      currentId: product.id,
      categorySlug: product.category?.slug || ""
    });

    const jsonDescription = (product.seoDescription || product.description?.text || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 260) || product.name;

    const variants = product.variants || [];
    const firstVariantImages = variants[0]?.images || [];

    // ✅ Fix 3: Image 空数组兜底
    const validImages = firstVariantImages.length > 0 
      ? firstVariantImages.map((img: any) => img.url)
      : [`${baseUrl}/og-default.jpg`];

    const safeProduct = {
      ...product,
      description: product.description?.html || '',
      plainDescription: jsonDescription,
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

    // ✅ Fix 6: 动态生成 priceValidUntil (当前时间往后加 1 年，免维护)
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const validUntil = nextYear.toISOString().split('T')[0];

    // 🚀 结构化数据终极版 (@graph 强化实体)
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        // ✅ Fix 5: 加入 Organization 强化品牌权威
        {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`,
          "name": "LINJIN LUXURY",
          "url": baseUrl,
          "logo": `${baseUrl}/logo.png`
        },
        {
          "@type": "Product",
          "@id": `${baseUrl}/product/${product.slug}#product`,
          "name": product.name,
          "description": jsonDescription,
          "image": validImages, // ✅ Fix 3 应用
          "sku": product.id,
          "mpn": product.id,
          "brand": { "@id": `${baseUrl}/#organization` }, // 关联上方 Organization
          "material": product.material || "Full-grain Leather",
          "color": product.variants?.[0]?.productColorEnum || "Black",
          "category": product.category?.name,
          // ✅ Fix 4: 改用 isSimilarTo
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
            "price": product.price.toString(), // ✅ Fix 2: 转 string
            "priceValidUntil": validUntil, // ✅ Fix 6 应用
            "itemCondition": "https://schema.org/NewCondition",
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": `${baseUrl}/product/${product.slug}`,
            "shippingDetails": {
              "@type": "OfferShippingDetails",
              "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "USD" },
              "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "US" },
              // ✅ Fix 7: 加入 shippingOrigin (提醒：确保这与你后台真实的仓储/发货地匹配)
              "shippingOrigin": { "@type": "DefinedRegion", "addressCountry": "US" },
              "deliveryTime": {
                "@type": "ShippingDeliveryTime",
                "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "d" },
                "transitTime": { "@type": "QuantitativeValue", "minValue": 3, "maxValue": 7, "unitCode": "d" }
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
              // ✅ Fix 8: 真实路径结构映射
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
              "item": `${baseUrl}/product/${product.slug}` 
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