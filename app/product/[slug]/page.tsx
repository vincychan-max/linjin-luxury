import { hygraph } from '@/lib/hygraph';
import ProductClient from './ProductClient'; 
import { gql } from 'graphql-request';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Script from 'next/script';

/**
 * 页面配置：ISR 每 5 分钟刷新一次
 */
export const revalidate = 300; 

/**
 * 1. 核心产品查询
 * 依靠 variants 获取图片、颜色枚举和变体 ID
 */
const GET_PRODUCT = gql`
  query GetProduct($slug: String!) {
    product(where: { slug: $slug }, stage: PUBLISHED) {
      id
      name
      slug
      price
      description { 
        html 
      }
      dimensions
      materialsCare { 
        html 
      }
      material
      altText
      sizes
      stock
      variants {
        ... on ProductVariant {
          id
          productColorEnum
          images { 
            url 
          }
        }
      }
    }
  }
`;

/**
 * 2. 推荐产品查询
 * 推荐列表取第一个 variant 的第一张图作为封面
 */
const GET_RECOMMENDED_PRODUCTS = gql`
  query GetRecommendedProducts($currentId: ID!) {
    products(where: { id_not: $currentId }, first: 4, stage: PUBLISHED) {
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
`;

/**
 * 3. 预生成静态路径
 */
export async function generateStaticParams() {
  const GET_ALL_SLUGS = gql`
    query GetAllSlugs {
      products(stage: PUBLISHED) {
        slug
      }
    }
  `;
  try {
    const data: any = await hygraph.request(GET_ALL_SLUGS);
    return data.products?.map((prod: any) => ({
      slug: prod.slug,
    })) || [];
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

/**
 * 4. 动态 Metadata
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data: any = await hygraph.request(gql`
      query GetProductMeta($slug: String!) {
        product(where: { slug: $slug }) {
          name
          altText
          variants(first: 1) {
            ... on ProductVariant {
              images(first: 1) { url }
            }
          }
        }
      }
    `, { slug });

    const product = data?.product;
    if (!product) return { title: 'Product Not Found' };

    const baseUrl = 'https://www.linjinluxury.com';
    const firstImg = product.variants?.[0]?.images?.[0]?.url || `${baseUrl}/og-default.jpg`;
    const title = `${product.name} | LINJIN LUXURY`;

    return {
      title,
      description: product.altText || `Shop the ${product.name} collection at LINJIN LUXURY.`,
      alternates: { canonical: `${baseUrl}/product/${slug}` },
      openGraph: {
        title,
        url: `${baseUrl}/product/${slug}`,
        images: [{ url: firstImg }],
        type: 'article',
      },
    };
  } catch (error) {
    return { title: 'LINJIN LUXURY' };
  }
}

/**
 * 5. 主页面组件
 */
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const productData: any = await hygraph.request(GET_PRODUCT, { slug });
    
    if (!productData?.product) return notFound();

    const product = productData.product;

    const recData: any = await hygraph.request(GET_RECOMMENDED_PRODUCTS, { 
      currentId: product.id 
    });

    /**
     * 🌟 数据清洗与映射：
     * 将 Hygraph 的 variants 映射为 Client 组件易于处理的 colors 格式
     */
    const variants = product.variants || [];
    
    // 提取第一个变体的信息作为默认显示
    const firstVariant = variants[0];
    const firstVariantImages = firstVariant?.images || [];

    const safeProduct = {
      ...product,
      description: product.description?.html || '',
      dimensions: product.dimensions || '',
      materialsCare: product.materialsCare?.html || '', 
      material: product.material || 'Premium Leather',
      // 映射颜色/变体逻辑
      colors: variants.length > 0 
        ? variants.map((v: any) => ({
            id: v.id, // 这里至关重要：用于客户端的心愿单匹配
            name: v.productColorEnum || 'Default',
            images: v.images || []
          }))
        : [{
            id: product.id,
            name: 'Original',
            images: [] 
          }],
      images: firstVariantImages 
    };

    // 构建结构化数据 (JSON-LD) 以提升 Google 搜索排名
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          "@id": `https://www.linjinluxury.com/product/${product.slug}#product`,
          "name": product.name,
          "description": safeProduct.description.replace(/<[^>]+>/g, '').substring(0, 160),
          "image": firstVariantImages.map((img: any) => img.url),
          "brand": { "@type": "Brand", "name": "LINJIN LUXURY" },
          "offers": {
            "@type": "Offer",
            "priceCurrency": "USD",
            "price": product.price,
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": `https://www.linjinluxury.com/product/${product.slug}`
          }
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
          recommendedProducts={recData?.products?.map((p: any) => ({
            ...p,
            // 推荐商品位同样从第一个变体拿图
            images: p.variants?.[0]?.images || []
          })) || []} 
        />
      </main>
    );

  } catch (error: any) {
    console.error('🔥 Product Page Build Error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">Updating Piece...</p>
        </div>
      </div>
    );
  }
}