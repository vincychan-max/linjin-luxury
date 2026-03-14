import { hygraph } from '@/lib/hygraph';
import ProductListClient from './ProductListClient';
import { gql } from 'graphql-request';
import { notFound } from 'next/navigation';
import { Metadata } from 'next'; // 用于动态 metadata (SEO)

export const revalidate = 3600; // ISR: 每1小时重新验证/更新页面

// 优化查询：预计算条件部分，避免运行时模板错误
function getProductsQuery(categoryID: string, subCategorySlug: string, genderSlug: string, isAll: boolean) {
  const subCategoryCondition = isAll ? '' : ', { subCategories_some: { slug: $subCategorySlug } }';
  return gql`
    query GetDataByID($categoryID: ID!, $subCategorySlug: String!, $genderSlug: String!) {
      category(where: { id: $categoryID }) {
        name
        collectionTitle
        collectionDescription
        collectionBackgroundImage { url }
        subCategories { name slug }
      }
      subCategories(where: { slug: $subCategorySlug }) {
        name
        collectionTitle
        collectionDescription
        collectionBackgroundImage { url }
      }
      products: products(where: { AND: [{ gender: { slug: $genderSlug } }, { category: { id: $categoryID } }${subCategoryCondition}] }, first: 48) {
        id name slug price 
        images(first: 5) { url } 
      }
    }
  `;
}

// 预生成静态路径（ISR 关键：构建时生成热门路径，减少动态 fallback）
export async function generateStaticParams() {
  const GET_CATEGORIES = gql`
    query GetCategories {
      categories {
        gender { slug }
        slug  # category slug
        subCategories { slug }
      }
    }
  `;
  const { categories } = await hygraph.request(GET_CATEGORIES);

  const paths = [];
  for (const cat of categories || []) { // 新增：|| [] 避免 categories 未定义
    if (cat && cat.gender && cat.gender.slug && cat.slug) { // 新增：全面 null 检查
      paths.push({ gender: cat.gender.slug, category: cat.slug, subCategory: 'all' }); // all 路径
      for (const sub of cat.subCategories || []) {
        if (sub && sub.slug) {
          paths.push({ gender: cat.gender.slug, category: cat.slug, subCategory: sub.slug });
        }
      }
    }
  }
  return paths; // 如果路径太多，可 slice(0, 500) 限制热门路径，其他 fallback 到动态
}

// 动态 metadata（SEO 优化：基于 params 生成标题/描述，提升搜索引擎排名）
export async function generateMetadata({ params }: { params: Promise<{ gender: string; category: string; subCategory: string }> }): Promise<Metadata> {
  const { gender, category, subCategory } = await params;
  const title = `${subCategory === 'all' ? category : subCategory} in ${gender} | Linjin Luxury`;
  const description = `Explore luxury ${subCategory === 'all' ? category : subCategory} products for ${gender}. High-quality handbags, shoes, and more.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ['/og-image.jpg'], // 添加默认 OG 图片，或从数据动态获取
      url: `/${gender}/${category}/${subCategory}`,
    },
  };
}

// 新增：生成 JSON-LD 结构化数据函数（SEO + GEO 优化）
function generateJsonLd(data: any, params: { gender: string; category: string; subCategory: string }) {
  const { gender, category, subCategory } = params;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://yourdomain.com" },
      { "@type": "ListItem", "position": 2, "name": gender, "item": `https://yourdomain.com/${gender}` },
      { "@type": "ListItem", "position": 3, "name": category, "item": `https://yourdomain.com/${gender}/${category}` },
      { "@type": "ListItem", "position": 4, "name": subCategory === 'all' ? 'All' : subCategory, "item": `https://yourdomain.com/${gender}/${category}/${subCategory}` }
    ]
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": data.products.map((product: any, index: number) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name,
        "url": `https://yourdomain.com/${gender}/${category}/${subCategory}/${product.slug}`,
        "image": product.images[0]?.url || '',
        "offers": {
          "@type": "Offer",
          "priceCurrency": "USD", // GEO: 可基于用户位置动态调整
          "price": product.price,
          "availability": "https://schema.org/InStock" // 如果有库存数据，可动态
        }
      }
    }))
  };

  // GEO 示例：如果有店铺位置，添加 LocalBusiness（可选，根据你的需求）
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

  return [breadcrumb, itemList, localBusiness]; // 返回数组，便于渲染多个 script
}

export default async function CategoryPage({ params }: { params: Promise<{ gender: string; category: string; subCategory: string }> }) {
  const { gender, category, subCategory } = await params;
  const isAll = subCategory === 'all';
  const query = getProductsQuery("cmljhje0m6t7k08lstoqzg5av", isAll ? "" : subCategory, gender, isAll); // 新增：预计算查询

  try {
    const data: any = await hygraph.request(query, {
      categoryID: "cmljhje0m6t7k08lstoqzg5av", // 如果 categoryID 动态，可从 params 映射或额外查询获取
      subCategorySlug: isAll ? "" : subCategory,
      genderSlug: gender
    });

    if (!data || !data.category) return notFound(); // 新增：data null 检查

    const getUrl = (imgField: any) => {
      if (Array.isArray(imgField) && imgField.length > 0) return imgField[0].url;
      if (imgField && imgField.url) return imgField.url;
      return "";
    };

    const categoryPic = getUrl(data.category.collectionBackgroundImage);
    const subCategoryData = data.subCategories[0] || {}; // 新增：|| {} 避免 null
    const subCategoryPic = getUrl(subCategoryData.collectionBackgroundImage);
    const finalImageUrl = isAll ? categoryPic : (subCategoryPic || categoryPic);

    const jsonLdScripts = generateJsonLd(data, { gender, category, subCategory }); // 新增：生成 JSON-LD

    return (
      <>
        {jsonLdScripts.map((schema, index) => ( // 新增：渲染 JSON-LD script 标签
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <ProductListClient 
          initialProducts={data.products || []} // 新增：|| [] 避免 null
          gender={gender}
          category={category}
          subCategory={subCategory}
          collectionTitle={isAll ? (data.category.collectionTitle || data.category.name) : (subCategoryData.collectionTitle || subCategory)}
          collectionDescription={isAll ? data.category.collectionDescription : (subCategoryData.collectionDescription || data.category.collectionDescription)}
          collectionBackgroundImageUrl={finalImageUrl}
          subCategoriesList={[{ name: 'View All', slug: 'all' }, ...(data.category.subCategories || [])]}
        />
      </>
    );
  } catch (error) {
    console.error('Error fetching category data:', error); // 添加日志，便于调试
    return notFound();
  }
}