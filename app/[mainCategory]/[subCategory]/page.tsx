import { Metadata } from 'next';
import ProductListClient from './ProductListClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mainCategory: string; subCategory: string }>;
}): Promise<Metadata> {
  const { mainCategory, subCategory } = await params;

  const mainDisplay = mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1);
  const currentDisplay = subCategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const pageTitle = `${currentDisplay} - ${mainDisplay} - Linjin Luxury`;

  return {
    title: pageTitle,
    description: 'Discover our exclusive collection of luxury items.',
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ mainCategory: string; subCategory: string }>;
}) {
  const { mainCategory, subCategory } = await params;

  // 修复：在 server component 计算 currentDisplay 用于 JSON-LD
  const currentDisplay = subCategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const breadcrumbItems = [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://linjinluxury.com/" },
    { "@type": "ListItem", "position": 2, "name": "Women", "item": "https://linjinluxury.com/women" },
    { "@type": "ListItem", "position": 3, "name": currentDisplay, "item": `https://linjinluxury.com/women/${subCategory}` },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ProductListClient params={{ mainCategory, subCategory }} />
    </>
  );
}