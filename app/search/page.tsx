'use client';
import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase'; // 路径根据你的项目调整
import { collection, getDocs } from "firebase/firestore";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.trim() || '';

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        // 加载所有产品（你的产品不多，client-side filter 足够快 + 简单）
        const snapshot = await getDocs(collection(db, "products"));
        let allProducts: any[] = [];
        snapshot.forEach((doc) => {
          allProducts.push({ id: doc.id, ...doc.data() });
        });

        // client-side 搜索：name 或 description 包含查询词（忽略大小写）
        const filtered = allProducts.filter((product) => {
          const name = product.name?.toLowerCase() || '';
          const description = product.description?.toLowerCase() || '';
          const searchLower = query.toLowerCase();
          return name.includes(searchLower) || description.includes(searchLower);
        });

        setResults(filtered);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-4xl uppercase tracking-wide">Searching...</p>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="min-h-screen bg-white py-32 text-center">
        <h2 className="text-4xl uppercase tracking-wide mb-12">Enter a search term</h2>
        <Link href="/" className="inline-block bg-black text-white px-16 py-6 text-xl uppercase tracking-wide transition-transform hover:scale-105 drop-shadow-md">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-white py-32 text-center">
        <h2 className="text-4xl uppercase tracking-wide mb-12">No results found for "{query}"</h2>
        <Link href="/" className="inline-block bg-black text-white px-16 py-6 text-xl uppercase tracking-wide transition-transform hover:scale-105 drop-shadow-md">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-5xl uppercase tracking-wide text-center mb-16">
          Search Results for "{query}" ({results.length})
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-16">
          {results.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group">
              <div className="relative overflow-hidden rounded-xl shadow-2xl aspect-[3/4]">
                <Image
                  src={product.images?.[0] || '/images/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  quality={95}
                />
              </div>
              <div className="mt-12 text-center">
                <p className="text-2xl font-thin tracking-wide">{product.name}</p>
                <p className="mt-6 text-xl">{product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-4xl uppercase tracking-wide">Searching...</p>
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}