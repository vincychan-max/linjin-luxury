import { hygraph } from '@/lib/hygraph';
import ProductListClient from './ProductListClient';
import { gql } from 'graphql-request';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Script from 'next/script';

// 强制每小时重新验证数据，平衡性能与实时性
export const revalidate = 3600; 

const BASE_URL = 'https://www.linjinluxury.com';

// --- GraphQL 查询定义 ---

// 1. 获取分类及子分类的配置信息
const GET_CATEGORY_BY_SLUG = gql`
  query GetCategoryBySlug($categorySlug: String!, $genderSlug: String!) {
    categories(where: { slug: $categorySlug, gender: { slug: $genderSlug } }) {
      id
      name
      collectionTitle
      collectionDescription
      collectionBackgroundImage { url }
      subCategories { 
        name 
        slug 
        collectionTitle
        collectionDescription
        collectionBackgroundImage { url }
      }
    }
  }
`;

/**
 * 2. 动态生成产品查询语句
 * 🌟 修正核心：在 variants 内增加了 id 字段，用于支持列表页的心愿单功能
 */
function getProductsQuery(isAll: boolean) {
  const productFields = `
    id 
    name 
    slug 
    price 
    isNew
    material
    variants {
      ... on ProductVariant {
        id  # 👈 必须获取变体 ID
        productColorEnum
        images(first: 1) {
          url
        }
      }
    }
  `;

  if (isAll) {
    return gql`
      query GetProductsDataAll($categoryID: ID!, $genderSlug: String!) {
        products(where: { 
          AND: [
            { gender: { slug: $genderSlug } }, 
            { category: { id: $categoryID } }
          ] 
        }, first: 48, stage: PUBLISHED) {
          ${productFields}
        }
      }
    `;
  }

  return gql`
    query GetProductsDataSub($categoryID: ID!, $genderSlug: String!, $subCategorySlug: String!) {
      products(where: { 
        AND: [
          { gender: { slug: $genderSlug } }, 
          { category: { id: $categoryID } },
          { subCategories_some: { slug: $subCategorySlug } }
        ] 
      }, first: 48, stage: PUBLISHED) {
        ${productFields}
      }
    }
  `;
}

// --- 工具函数：Slug 适配器 ---
function getInternalSlug(gender: string, category: string) {
  const g = gender.toLowerCase();
  const c = category.toLowerCase();
  const conflictCategories = ['shoes', 'ready-to-wear', 'bags', 'accessories'];
  if (conflictCategories.includes(c)) {
    return `${g}-${c}`; 
  }
  return c;
}

// --- SEO & GEO：生成 JSON-LD 结构化数据 ---
function generateCombinedSchema(products: any[], params: { gender: string; category: string; subCategory: string }, categoryName: string) {
  const { gender, category } = params;
  const categoryUrl = `${BASE_URL}/${gender}/${category}`;

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
      { "@type": "ListItem", "position": 2, "name": gender.toUpperCase(), "item": `${BASE_URL}/${gender}` },
      { "@type": "ListItem", "position": 3, "name": categoryName, "item": categoryUrl }
    ]
  };

  const itemListSchema = {
    "@type": "ItemList",
    "numberOfItems": products.length,
    "itemListElement": products.map((prod, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${BASE_URL}/product/${prod.slug}`,
      "name": prod.name,
      "image": prod.images?.[0]?.url || ""
    }))
  };

  return {
    "@context": "https://schema.org",
    "@graph": [breadcrumbSchema, itemListSchema]
  };
}

// --- 生成静态路径 ---
export async function generateStaticParams() {
  const GET_ALL_PATHS = gql`
    query GetAllPaths {
      categories {
        gender { slug }
        slug
        subCategories { slug }
      }
    }
  `;
  try {
    const { categories } = await hygraph.request(GET_ALL_PATHS) as any;
    const paths = [];
    for (const cat of categories || []) {
      if (cat?.gender?.slug && cat?.slug) {
        const cleanCategory = cat.slug.replace(`${cat.gender.slug}-`, '');
        paths.push({ gender: cat.gender.slug, category: cleanCategory, subCategory: 'all' });
        for (const sub of cat.subCategories || []) {
          if (sub?.slug) {
            paths.push({ gender: cat.gender.slug, category: cleanCategory, subCategory: sub.slug });
          }
        }
      }
    }
    return paths;
  } catch (error) {
    return [];
  }
}

// --- 生成元数据 ---
export async function generateMetadata({ params }: { params: Promise<{ gender: string; category: string; subCategory: string }> }): Promise<Metadata> {
  const { gender, category, subCategory } = await params;
  const internalSlug = getInternalSlug(gender, category);
  
  try {
    const catRes: any = await hygraph.request(GET_CATEGORY_BY_SLUG, {
      categorySlug: internalSlug,
      genderSlug: gender.toLowerCase()
    });
    
    const cat = catRes.categories[0];
    const title = `${category.toUpperCase()} | ${gender.toUpperCase()} COLLECTION | LINJIN LUXURY`;
    const description = cat?.collectionDescription || `Explore the finest ${gender} ${category} at LINJIN LUXURY.`;

    return {
      title,
      description,
      alternates: {
        canonical: `${BASE_URL}/${gender.toLowerCase()}/${category.toLowerCase()}/${subCategory.toLowerCase()}`,
      },
      openGraph: {
        title,
        description,
        images: [cat?.collectionBackgroundImage?.url || ''],
      }
    };
  } catch (e) {
    return { title: 'Collection | LINJIN LUXURY' };
  }
}

// --- 主页面组件 ---

export default async function CategoryPage({ params }: { params: Promise<{ gender: string; category: string; subCategory: string }> }) {
  const { gender: rawGender, category: rawCategory, subCategory: rawSubCategory } = await params;
  const gender = rawGender.toLowerCase();
  const categoryURL = rawCategory.toLowerCase();
  const subCategory = rawSubCategory.toLowerCase();
  
  const internalCategorySlug = getInternalSlug(gender, categoryURL);
  const isAll = subCategory === 'all';
  
  let currentCategory: any = null;
  let productRes: any = null;

  try {
    // 1. 获取分类基础信息
    const catData: any = await hygraph.request(GET_CATEGORY_BY_SLUG, {
      categorySlug: internalCategorySlug,
      genderSlug: gender
    });
    currentCategory = catData.categories[0];

    // 2. 获取产品列表
    if (currentCategory) {
      const query = getProductsQuery(isAll);
      const variables: any = {
        categoryID: currentCategory.id,
        genderSlug: gender,
      };
      if (!isAll) variables.subCategorySlug = subCategory;

      productRes = await hygraph.request(query, variables);
    }
  } catch (error) {
    console.error('🔥 LinJin Server Error:', error);
  }

  if (!currentCategory) notFound();

  // --- 渲染逻辑处理 ---
  const getUrl = (imgField: any) => {
    if (Array.isArray(imgField) && imgField.length > 0) return imgField[0].url;
    if (imgField && imgField.url) return imgField.url;
    return "";
  };

  const activeSubCategoryData = isAll 
    ? null 
    : currentCategory.subCategories.find((sub: any) => sub.slug === subCategory);

  const displayTitle = isAll 
    ? (currentCategory.collectionTitle || currentCategory.name) 
    : (activeSubCategoryData?.collectionTitle || activeSubCategoryData?.name || subCategory);

  const displayDesc = isAll 
    ? currentCategory.collectionDescription 
    : (activeSubCategoryData?.collectionDescription || currentCategory.collectionDescription);

  const finalImageUrl = isAll 
    ? getUrl(currentCategory.collectionBackgroundImage) 
    : (getUrl(activeSubCategoryData?.collectionBackgroundImage) || getUrl(currentCategory.collectionBackgroundImage));

  /**
   * 🌟 数据清洗处理：
   * 将 variants 里的内容根据 ProductVariant 模型进行提取
   * 增加 defaultVariantId 的提取，确保列表页红心能对应到具体的变体（颜色）
   */
  const formattedProducts = productRes?.products?.map((prod: any) => {
    const realVariants = prod.variants?.filter((v: any) => v.id) || [];
    const firstVariant = realVariants[0] || {};

    return {
      ...prod,
      defaultVariantId: firstVariant.id || null, // 👈 传给客户端组件的核心字段
      isNew: prod.isNew || false, 
      productColorEnum: firstVariant.productColorEnum || null,
      images: firstVariant.images || []
    };
  }) || [];

  return (
    <>
      <Script id="linjin-geo-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(generateCombinedSchema(
          formattedProducts, 
          { gender, category: categoryURL, subCategory }, 
          currentCategory.name
        ))}
      </Script>

      <ProductListClient 
        initialProducts={formattedProducts}
        gender={gender}
        category={categoryURL}
        subCategory={subCategory}
        collectionTitle={displayTitle}
        collectionDescription={displayDesc}
        collectionBackgroundImageUrl={finalImageUrl}
        subCategoriesList={[
          { name: 'View All', slug: 'all' }, 
          ...(currentCategory.subCategories || []) 
        ].filter((item, index, self) => 
          index === self.findIndex((t) => t.slug === item.slug)
        )}
      />
    </>
  );
}