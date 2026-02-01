// app/collection/page.tsx
import { Metadata } from 'next';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';  // 统一使用别名路径，更标准

import Link from 'next/link';
import ProductGrid from '../components/ProductGrid';  // 确保路径正确

type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  category?: string;
  gender?: string;
  created_at?: any;  // 用于分页 cursor
};

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

// 强制动态渲染，彻底避免 prerender 阶段的错误（尤其是数据为空或 undefined 时）
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const category = searchParams.category || 'All';
  const gender = searchParams.gender || '';
  const titleCategory = category !== 'All' ? category : (gender || 'Full');
  
  return {
    title: `Linjin Luxury | ${titleCategory} Collection`,
    description: `Explore authentic premium ${titleCategory.toLowerCase()} designer handbags in pristine condition from Linjin Luxury in Los Angeles.`,
  };
}

export default async function CollectionPage({ searchParams }: Props) {
  const category = searchParams.category as string | undefined;
  const gender = searchParams.gender as string | undefined;

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

    // 用于无限滚动 cursor
    if (snapshot.docs.length > 0) {
      initialLastCreatedAt = snapshot.docs[snapshot.docs.length - 1].data().created_at;
    }
  } catch (error) {
    console.error('Collection page initial query error:', error);
    // 出错时返回空数组，避免 crash
    initialProducts = [];
  }

  return (
    <>
      {/* 标题 + 过滤栏 */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold tracking-widest uppercase mb-6">
            {category || gender || 'Full'} Collection
          </h1>
          <p className="text-xl md:text-2xl tracking-wider opacity-80">
            Authentic premium designer handbags in pristine condition
          </p>
        </div>

        {/* 简洁过滤栏 */}
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
          {/* 如需更多过滤，可继续添加 */}
        </div>
      </section>

      {/* 产品网格 - Client Component 处理无限滚动 */}
      <ProductGrid 
        initialProducts={initialProducts}
        initialLastCreatedAt={initialLastCreatedAt}
        category={category}
        gender={gender}
      />
    </>
  );
}