// app/collection/page.tsx
import { Metadata } from 'next';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';  // 统一使用别名路径，更标准

import Link from 'next/link';
import ProductGrid from '../components/ProductGrid';  // 新增导入（修复 Cannot find name 'ProductGrid'）

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

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const category = searchParams.category || 'All';
  return {
    title: `Linjin Luxury | ${category} Collection`,
    description: `Explore authentic premium ${category} designer handbags in pristine condition.`,
  };
}

export default async function CollectionPage({ searchParams }: Props) {
  const category = searchParams.category as string | undefined;
  const gender = searchParams.gender as string | undefined;

  // 初始查询（第一页）
  let q = query(collection(db, 'products'), orderBy('created_at', 'desc'), limit(12));

  if (category) q = query(q, where('category', '==', category));
  if (gender) q = query(q, where('gender', '==', gender));

  const snapshot = await getDocs(q);
  const initialProducts: Product[] = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Product));

  // 用于无限滚动 cursor（传 plain value，避免 DocumentSnapshot 序列化错误）
  const initialLastCreatedAt = snapshot.docs.length > 0 
    ? snapshot.docs[snapshot.docs.length - 1].data().created_at 
    : null;

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
          <Link href="/collection" className="px-8 py-3 border border-white rounded-full hover:bg-white hover:text-black transition">
            All
          </Link>
          <Link href="/collection?category=women" className="px-8 py-3 border border-white rounded-full hover:bg-white hover:text-black transition">
            Women
          </Link>
          <Link href="/collection?category=men" className="px-8 py-3 border border-white rounded-full hover:bg-white hover:text-black transition">
            Men
          </Link>
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