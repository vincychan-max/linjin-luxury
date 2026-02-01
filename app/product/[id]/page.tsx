import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductClient from './ProductClient';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';

type Props = {
  params: Promise<{ id: string }>; // params 是 Promise
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params; // await params

  const productDoc = await getDoc(doc(db, 'products', id));
  if (!productDoc.exists()) notFound();

  const data = productDoc.data();
  const name = data.name || data.code || 'Unnamed Product';

  return {
    title: `${name} - Linjin Luxury`,
    description: data.description || 'Discover this luxury item.',
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params; // await params

  const productDoc = await getDoc(doc(db, 'products', id));
  if (!productDoc.exists()) notFound();

  const productData = productDoc.data();

  // 转成纯对象（避免 Timestamp 等问题）
  const product = {
    id: productDoc.id,
    name: productData.name || productData.code || 'Unnamed Product',
    code: productData.code || '',
    price: productData.price || 0,
    description: productData.description || '',
    mainImage: productData.mainImage || '',
    colorImages: productData.colorImages || {},
    colors: productData.colors || [],
    dimensions: productData.dimensions || {},
    features: productData.features || [],
    keywords: productData.keywords || [],
    condition: productData.condition || '',
    createdAt: productData.createdAt?.toDate().toISOString() || null,
    // 加更多字段如果需要
  };

  // 推荐产品
  const recommendedQuery = query(
    collection(db, 'products'),
    where('mainGroup', '==', productData.mainGroup || 'handbags'),
    limit(8)
  );
  const recommendedSnapshot = await getDocs(recommendedQuery);

  const recommendedProducts = recommendedSnapshot.docs.map((doc) => {
    const data = doc.data();
    const colorImages = data.colorImages as Record<string, string[]> | undefined;
    return {
      id: doc.id,
      name: data.name || data.code || 'Unnamed Product',
      code: data.code || '',
      price: data.price || 0,
      mainImage: data.mainImage || (colorImages ? Object.values(colorImages)[0]?.[0] || '' : ''),
      createdAt: data.createdAt?.toDate().toISOString() || null,
    };
  });

  return <ProductClient product={product} recommendedProducts={recommendedProducts} />;
}