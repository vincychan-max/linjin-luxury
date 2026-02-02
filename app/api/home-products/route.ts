import { db } from '@/lib/firebase'; // client-side Firestore (from your firebase config)
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
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
      getDocs(query(collection(db, 'products'), orderBy('created_at', 'desc'), limit(8))),
      getDocs(query(collection(db, 'products'), where('isLimited', '==', true), orderBy('price', 'desc'), limit(8))),
    ]);

    newArrivals = newSnap.docs.map(mapProduct);
    limitedProducts = limitedSnap.docs.map(mapProduct);

    console.log('New Arrivals count:', newArrivals.length);
    console.log('Limited Products count:', limitedProducts.length);
  } catch (error: unknown) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) errorMessage = error.message;
    console.error('API query error:', errorMessage);
    return NextResponse.json({ error: 'Query failed', details: errorMessage }, { status: 500 });
  }

  // 双保险 fallback（真实数据空时显示测试卡片，避免全灰）
  if (newArrivals.length === 0) {
    console.log('Using fallback test data for newArrivals');
    newArrivals = [
      { id: 'test1', name: 'Premium Leather Tote', price: 2800, images: ['/images/placeholder.jpg'] },
      { id: 'test2', name: 'Elegant Crossbody', price: 3500, images: ['/images/placeholder.jpg'] },
      { id: 'test3', name: 'Classic Clutch', price: 1900, images: ['/images/placeholder.jpg'] },
      { id: 'test4', name: 'Designer Shoulder Bag', price: 4200, images: ['/images/placeholder.jpg'] },
    ];
  }

  if (limitedProducts.length === 0) {
    console.log('Using fallback test data for limitedProducts');
    limitedProducts = [
      { id: 'limited1', name: 'Rare Hermes Edition', price: 6800, images: ['/images/placeholder.jpg'], isLimited: true },
      { id: 'limited2', name: 'Exclusive Chanel Flap', price: 8500, images: ['/images/placeholder.jpg'], isLimited: true },
    ];
  }

  return NextResponse.json({ newArrivals, limitedProducts });
}

export const dynamic = 'force-dynamic'; // 确保实时查询