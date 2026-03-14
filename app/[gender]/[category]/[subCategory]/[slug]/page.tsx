import { hygraph } from '@/lib/hygraph';
import ProductClient from './ProductClient'; 
import { gql } from 'graphql-request';
import { notFound } from 'next/navigation';
import { Metadata } from 'next'; // 新增：用于动态 metadata (SEO)

// ISR: 每5分钟重新验证/更新页面（详情页变化较快，如库存）
export const revalidate = 300; 

// 1. 获取主产品的查询
const GET_PRODUCT = gql`
  query GetProduct($slug: String!) {
    product(where: { slug: $slug }, stage: PUBLISHED) {
      id
      name
      slug
      price
      description { html }
      dimensions
      materialsCare { html } 
      images { url }
      sizes
      stock
      colors {
        id
        name
        images { url }
      }
    }
  }
`;

// 2. 获取推荐产品的查询
const GET_RECOMMENDED_PRODUCTS = gql`
  query GetRecommendedProducts($currentId: ID!) {
    products(where: { id_not: $currentId }, first: 4, stage: PUBLISHED) {
      id
      name
      slug
      price
      images {
        url
      }
    }
  }
`;

// 预生成静态路径（ISR 关键：构建时生成所有产品路径）
export async function generateStaticParams() {
  const GET_ALL_SLUGS = gql`
    query GetAllSlugs {
      products(stage: PUBLISHED) {
        slug
      }
    }
  `;
  const { products } = await hygraph.request(GET_ALL_SLUGS);

  return products?.map((prod: any) => ({
    slug: prod.slug,
  })) || []; // 生成所有 slug 路径；如果产品多，可限制热门产品
}

// 动态 metadata（SEO 优化：基于产品数据生成标题/描述）
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  // 查询产品名称用于 metadata（轻量查询）
  const GET_PRODUCT_NAME = gql`
    query GetProductName($slug: String!) {
      product(where: { slug: $slug }) {
        name
        price
      }
    }
  `;
  const { product } = await hygraph.request(GET_PRODUCT_NAME, { slug });

  if (!product) return { title: 'Product Not Found' };

  const title = `${product.name} | Linjin Luxury`;
  const description = `Discover ${product.name} for $${product.price}. Luxury fashion item with premium quality.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ['/og-image.jpg'], // 或动态从产品图像
      url: `/product/${slug}`, // 调整为实际路径
    },
  };
}

// 新增：生成 JSON-LD 结构化数据函数（SEO + GEO 优化）
function generateJsonLd(product: any) {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": (product.description?.html || '').replace(/<[^>]+>/g, ''), // 优化：先 || '' 避免 undefined.replace 错误
    "image": product.images[0]?.url || '',
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD", // GEO: 可基于用户位置调整
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  // GEO 示例：添加 LocalBusiness（如果有店铺位置）
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Linjin Luxury Shop",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Fashion St", // 你的店铺地址
      "addressLocality": "Los Angeles",
      "addressRegion": "CA",
      "postalCode": "90001",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 34.0522,
      "longitude": -118.2437
    }
  };

  return [productSchema, localBusiness]; // 返回数组，便于渲染多个 script
}

export default async function ProductPage({ params }: { params: Promise<any> }) {
  const { slug } = await params;

  try {
    // 先获取产品详情，以获取 ID 用于推荐查询
    const productData: any = await hygraph.request(GET_PRODUCT, { slug });
    
    if (!productData?.product) return notFound();

    const product = productData.product;

    // 用产品 ID 查询推荐
    const recData: any = await hygraph.request(GET_RECOMMENDED_PRODUCTS, { 
      currentId: product.id 
    });

    const safeProduct = {
      ...product,
      description: product.description?.html || '',
      dimensions: product.dimensions || '',
      materialsCare: product.materialsCare?.html || '', 
      colors: product.colors && product.colors.length > 0 
        ? product.colors 
        : [
            {
              id: 'default',
              name: 'Original',
              images: product.images || []
            }
          ]
    };

    const jsonLdScripts = generateJsonLd(safeProduct); // 新增：生成 JSON-LD

    return (
      <>
        {jsonLdScripts.map((schema, index) => ( // 新增：渲染 JSON-LD script 标签
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <ProductClient 
          product={safeProduct} 
          recommendedProducts={recData?.products || []} 
        />
      </>
    );

  } catch (error: any) {
    console.error('🔥 接口请求报错:', error);
    return <div className="p-20 text-center">API Error: Please check terminal</div>;
  }
}