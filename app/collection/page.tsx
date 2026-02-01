// app/collection/page.tsx
import { Metadata } from 'next';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import Link from 'next/link';
import ProductGrid from '../components/ProductGrid';

type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  category?: string;
  gender?: string;
  created_at?: any;
};

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

// 强制动态渲染，避免 prerender 错误
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  // 安全处理 searchParams（Next.js 类型可能是 string | string[]）
  const rawCategory = searchParams.category;
  const rawGender = searchParams.gender;

  const category = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;
  const gender = Array.isArray(rawGender) ? rawGender[0] : rawGender;

  const titleCategory = category && category !== 'All' ? category : (gender || 'Full');

  return {
    title: `Linjin Luxury | ${titleCategory} Collection`,
    description: `Explore authentic premium ${titleCategory.toLowerCase()} designer handbags in pristine condition from Linjin Luxury in Los Angeles.`,
  };
}

export default async function CollectionPage({ searchParams }: Props) {
  // 同样安全处理 searchParams
  const rawCategory = searchParams.category;
  const rawGender = searchParams.gender;

  const category = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;
  const gender = Array.isArray(rawGender) ? rawGender[0] : rawGender;

  // 初始查询（第一页）
  let q = query(collection(db, 'products'), orderBy('created_at', 'desc'), limit(12));

  if (category) {
    q = query(q, where('category', '==', category));
  }
  if (gender) {
    q = query(q, where('gender', '==', gender));
  }

  let initialProducts: Product[] = [];
  let initialLastCreatedAt: any = null;

  try {
    const snapshot = await getDocs(q);
    initialProducts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Untitled',
        price: Number(data.price) || 0,
        images: data.images || data.colorImages ? Object.values(data.colorImages || {}).flat() as string[] : ['/images/placeholder.jpg'],
        category: data.category,
        gender: data.gender,
        created_at: data.created_at,
      };
    });

    if (snapshot.docs.length > 0) {
      initialLastCreatedAt = snapshot.docs[snapshot.docs.length - 1].data().created_at;
    }
  } catch (error) {
    console.error('Collection page initial query error:', error);
    initialProducts = [];
  }

  return (
    <>
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold tracking-widest uppercase mb-6">
            {category || gender || 'Full'} Collection
          </h1>
          <p className="text-xl md:text-2xl tracking-wider opacity-80">
            Authentic premium designer handbags in pristine condition
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-16">
          <Link href="/collection" className="px-8 py-3 border border-black rounded-full hover:bg-black hover:text-white transition">
            All
          </Link>
          <Link href="/collection?category=women" className="px-8 py-3 border border-black rounded-full hover:bg-black hover:text-white transition">
            Women
          </Link>
          <Link href="/collection?category=men" className="px-8 py-3 border border-black rounded-full hover:bg-black hover:text-white transition">
            Men
          </Link>
        </div>
      </section>

      <ProductGrid 
        initialProducts={initialProducts}
        initialLastCreatedAt={initialLastCreatedAt}
        category={category}
        gender={gender}
      />
    </>
  );
}