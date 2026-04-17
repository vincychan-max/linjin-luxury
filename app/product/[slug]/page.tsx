import { hygraph } from '@/lib/hygraph';
import ProductClient from './ProductClient'; 
import { gql } from 'graphql-request';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Script from 'next/script';
import { Link } from 'lucide-react';

/**
 * 1. 类型定义 (Next.js 15 标准)
 */
type Props = {
  params: Promise<{ slug: string }>;
};

// 保持 5 分钟验证一次，兼顾奢侈品库存变动与 CDN 性能
export const revalidate = 300; 

/**
 * 2. GraphQL 查询定义
 */

// 核心查询：获取产品详情、SEO 覆盖字段及垂直内链分类
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

// 横向分发查询：获取同类目下的推荐单品，形成站内权重闭环
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
    
    // 逻辑：SEO 专属字段优先级最高，无则使用产品名兜底
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

  try {
    // 并行请求数据，优化 LCP 性能
    const productData: any = await hygraph.request(GET_PRODUCT_DEEP, { slug });
    if (!productData?.product) return notFound();

    const product = productData.product;
    
    const recData: any = await hygraph.request(GET_RECOMMENDED_PRODUCTS, { 
      currentId: product.id,
      categorySlug: product.category?.slug || ""
    });

    // 为 JSON-LD 准备纯文本描述
    const jsonDescription = (product.seoDescription || product.description?.text || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 260) || product.name;

    const variants = product.variants || [];
    const firstVariantImages = variants[0]?.images || [];

    // 数据清洗，下传至 Client Component
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

    // 结构化数据 (SEO + GEO 实体关联)
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          "@id": `https://www.linjinluxury.com/product/${product.slug}#product`,
          "name": product.name,
          "description": jsonDescription,
          "image": firstVariantImages.map((img: any) => img.url),
          "sku": product.id,
          "brand": { "@type": "Brand", "name": "LINJIN LUXURY" },
          "material": product.material,
          "category": product.category?.name,
          "isRelatedTo": recommendedProducts.map((p: any) => ({
            "@type": "Product",
            "name": p.name,
            "url": `https://www.linjinluxury.com/product/${p.slug}`
          })),
          "offers": {
            "@type": "Offer",
            "priceCurrency": "USD",
            "price": product.price,
            "itemCondition": "https://schema.org/NewCondition",
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": `https://www.linjinluxury.com/product/${product.slug}`,
            "shippingDetails": {
              "@type": "OfferShippingDetails",
              "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "USD" },
              "deliveryTime": {
                "@type": "ShippingDeliveryTime",
                "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "DAY" },
                "transitTime": { "@type": "QuantitativeValue", "minValue": 3, "maxValue": 7, "unitCode": "DAY" }
              }
            }
          }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.linjinluxury.com" },
            { 
              "@type": "ListItem", 
              "position": 2, 
              "name": product.gender?.name || "Shop", 
              "item": `https://www.linjinluxury.com/${product.gender?.slug || 'shop'}` 
            },
            { 
              "@type": "ListItem", 
              "position": 3, 
              "name": product.category?.name || "Collection", 
              "item": `https://www.linjinluxury.com/${product.gender?.slug}/${product.category?.slug}/all` 
            },
            { "@type": "ListItem", "position": 4, "name": product.name, "item": `https://www.linjinluxury.com/product/${product.slug}` }
          ]
        }
      ]
    };

    return (
      <main className="min-h-screen bg-white">
        <Script id={`product-ld-${product.id}`} type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </Script>

        {/* 垂直内链：面包屑 UI */}
        <nav aria-label="Breadcrumb" className="max-w-screen-xl mx-auto px-4 pt-6 pb-2">
          <ol className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-zinc-400">
            <li><Link href="/" className="hover:text-black transition-colors">Home</Link></li>
            {product.gender && (
               <li className="before:content-['/'] before:mx-2 before:text-zinc-200">
                 <a href={`/${product.gender.slug}`} className="hover:text-black transition-colors">{product.gender.name}</a>
               </li>
            )}
            {product.category && (
              <li className="before:content-['/'] before:mx-2 before:text-zinc-200">
                <a href={`/${product.gender?.slug}/${product.category.slug}/all`} className="hover:text-black text-zinc-800 font-medium transition-colors">
                  {product.category.name}
                </a>
              </li>
            )}
            <li className="before:content-['/'] before:mx-2 before:text-zinc-200 truncate max-w-[100px] md:max-w-none">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* 交互核心组件 */}
        <ProductClient 
          product={safeProduct} 
          recommendedProducts={recommendedProducts} 
        />
      </main>
    );

  } catch (error) {
    console.error('🔥 LinJin Build Error:', error);
    // 这里的兜底可以根据你的 UI 风格进行调整
    return notFound();
  }
}