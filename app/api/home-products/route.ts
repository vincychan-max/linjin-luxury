import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

const mapProduct = (doc: any) => {
  const data = doc.data();
  let displayImage = '/images/placeholder.jpg';

  if (data.mainImage && data.mainImage !== '') {
    displayImage = data.mainImage;
  } else if (data.colorImages && typeof data.colorImages === 'object') {
    const colors = Object.values(data.colorImages);
    for (const colorArray of colors) {
      if (Array.isArray(colorArray) && colorArray.length > 0 && typeof colorArray[0] === 'string') {
        displayImage = colorArray[0];
        break;
      }
    }
  } else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    displayImage = data.images[0];
  }

  return {
    id: doc.id,
    name: data.name || 'Untitled',
    price: Number(data.price) || 0,
    images: [displayImage],
    isLimited: data.isLimited || false,
  };
};

export async function GET() {
  let newArrivals: any[] = [];
  let limitedProducts: any[] = [];

  try {
    const [newSnap, limitedSnap] = await Promise.all([
      adminDb.collection('products').orderBy('created_at', 'desc').limit(8).get(),
      adminDb
        .collection('products')
        .where('isLimited', '==', true)
        .orderBy('price', 'desc')
        .limit(8)
        .get(),
    ]);

    newArrivals = newSnap.docs.map(mapProduct);
    limitedProducts = limitedSnap.docs.map(mapProduct);

    // 调试 log：看真实查询数量
    console.log('REAL New Arrivals count:', newArrivals.length);
    console.log('REAL Limited Products count:', limitedProducts.length);
    if (newArrivals.length > 0) console.log('Sample New name:', newArrivals[0].name);
    if (limitedProducts.length > 0) console.log('Sample Limited name:', limitedProducts[0].name);
  } catch (error: unknown) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) errorMessage = error.message;
    console.error('API query error:', errorMessage);
    return NextResponse.json({ error: 'Query failed', details: errorMessage }, { status: 500 });
  }

  // 没有 fallback，直接返回真实数据（空就空）

  return NextResponse.json({ newArrivals, limitedProducts });
}

export const dynamic = 'force-dynamic';