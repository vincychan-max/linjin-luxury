import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

const mapProduct = (doc: any) => {
  const data = doc.data();
  let displayImage = '/images/placeholder.jpg';

  if (data.mainImage) displayImage = data.mainImage;
  else if (data.colorImages && typeof data.colorImages === 'object') {
    const colors = Object.values(data.colorImages);
    for (const colorArray of colors) {
      if (Array.isArray(colorArray) && colorArray.length > 0 && typeof colorArray[0] === 'string') {
        displayImage = colorArray[0];
        break;
      }
    }
  } else if (data.images?.[0]) displayImage = data.images[0];

  return {
    id: doc.id,
    name: data.name || 'Untitled',
    price: Number(data.price) || 0,
    images: [displayImage],
    isLimited: data.isLimited || false,
  };
};

export async function GET() {
  let newArrivals = [];
  let limitedProducts = [];

  try {
    const [newSnap, limitedSnap] = await Promise.all([
      adminDb.collection('products').orderBy('created_at', 'desc').limit(8).get(),
      adminDb.collection('products').where('isLimited', '==', true).orderBy('price', 'desc').limit(8).get(),
    ]);

    newArrivals = newSnap.docs.map(mapProduct);
    limitedProducts = limitedSnap.docs.map(mapProduct);
  } catch (error) {
    console.error('API query error:', error);
    return NextResponse.json({ error: 'Query failed', details: error.message }, { status: 500 });
  }

  // fallback 如果 API 也空
  if (newArrivals.length === 0) {
    newArrivals = [
      { id: 'test1', name: 'Test Premium Bag', price: 2800, images: ['/images/placeholder.jpg'] },
      // ... 其他 test
    ];
  }
  if (limitedProducts.length === 0) {
    limitedProducts = [
      { id: 'limited1', name: 'Limited Edition Hermes', price: 6800, images: ['/images/placeholder.jpg'], isLimited: true },
      // ...
    ];
  }

  return NextResponse.json({ newArrivals, limitedProducts });
}

export const dynamic = 'force-dynamic'; // 确保 API 实时