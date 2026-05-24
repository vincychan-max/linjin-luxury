'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function FilterBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleUpdateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // 每次操作重置到第一页
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <section className="w-full px-6 py-6 border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] tracking-[0.15em] uppercase text-gray-500">
        
        {/* 搜索框 */}
        <input
          type="text"
          placeholder="FILTER BY NAME..."
          className="outline-none bg-transparent w-48 text-black placeholder-gray-400"
          defaultValue={searchParams.get('search') || ''}
          onChange={(e) => handleUpdateParams('search', e.target.value)}
        />

        {/* 排序下拉 */}
        <select 
          className="outline-none bg-transparent cursor-pointer text-gray-500 hover:text-black"
          defaultValue={searchParams.get('sort') || ''}
          onChange={(e) => handleUpdateParams('sort', e.target.value)}
        >
          <option value="">SORT BY</option>
          <option value="price_ASC">Price: Low to High</option>
          <option value="price_DESC">Price: High to Low</option>
          <option value="createdAt_DESC">Newest</option>
        </select>
      </div>
    </section>
  );
}