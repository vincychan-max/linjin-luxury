'use client';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, limit, startAfter, where, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase'; // 你的 firebase path
import Image from 'next/image';
import Link from 'next/link';

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<any[]>([]); // 所有加载的产品
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColor, setSelectedColor] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  // 初始加载 + 分页
  const fetchProducts = async (isLoadMore = false) => {
    if (!hasMore && isLoadMore) return;
    setLoading(true);
    try {
      let q = query(collection(db, 'products'), orderBy('name'), limit(20));
      if (isLoadMore && lastDoc) {
        q = query(collection(db, 'products'), orderBy('name'), startAfter(lastDoc), limit(20));
      }
      const snapshot = await getDocs(q);
      const newProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllProducts(isLoadMore ? [...allProducts, ...newProducts] : newProducts);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 20);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 实时搜索 + 过滤
  useEffect(() => {
    let filtered = allProducts;

    // 搜索名称
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 过滤颜色（从 colors 数组匹配）
    if (selectedColor !== 'all') {
      filtered = filtered.filter(p => 
        p.colors?.some((c: string) => c.toLowerCase() === selectedColor.toLowerCase())
      );
    }

    // 过滤价格范围
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(p => {
        const price = Number(p.price?.replace(/[^0-9.-]+/g,"") || 0);
        return price >= min && (max ? price <= max : true);
      });
    }

    setFilteredProducts(filtered);
  }, [allProducts, searchTerm, selectedColor, priceRange]);

  // 获取所有可用颜色（动态从产品提取）
  const availableColors = Array.from(new Set(allProducts.flatMap(p => p.colors || [])));

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-5xl md:text-6xl font-thin uppercase tracking-widest text-center mb-16">
          All Products
        </h1>

        {/* 搜索 + 过滤栏 */}
        <div className="flex flex-col md:flex-row gap-8 mb-16">
          {/* 搜索框 */}
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-8 py-4 border-2 border-gray-300 uppercase tracking-widest text-lg focus:border-black outline-none"
          />

          {/* 颜色过滤 */}
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="px-8 py-4 border-2 border-gray-300 uppercase tracking-widest text-lg"
          >
            <option value="all">All Colors</option>
            {availableColors.map((color: string) => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>

          {/* 价格范围过滤 */}
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="px-8 py-4 border-2 border-gray-300 uppercase tracking-widest text-lg"
          >
            <option value="all">All Prices</option>
            <option value="0-2000">Under $2,000</option>
            <option value="2000-4000">$2,000 - $4,000</option>
            <option value="4000-">Over $4,000</option>
          </select>
        </div>

        {/* 产品网格 */}
        {loading && filteredProducts.length === 0 ? (
          <p className="text-center text-3xl tracking-widest">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <Link key={product.id} href={`/product/${product.id}`} className="group">
                <div className="relative overflow-hidden rounded-xl shadow-2xl aspect-[3/4]">
                  <Image
                    src={product.colorImages?.[Object.keys(product.colorImages || {})[0]]?.[0] || product.images?.[0] || '/images/placeholder.jpg'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    quality={95}
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="mt-8 text-center">
                  <p className="text-2xl font-thin tracking-widest">{product.name}</p>
                  <p className="mt-4 text-xl">{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More 按钮 */}
        {hasMore && !loading && (
          <button
            onClick={() => fetchProducts(true)}
            className="mt-16 mx-auto block bg-black text-white px-12 py-6 uppercase tracking-widest text-xl hover:bg-gray-800 transition"
          >
            Load More
          </button>
        )}

        {filteredProducts.length === 0 && !loading && (
          <p className="text-center text-3xl tracking-widest mt-32">No products found</p>
        )}
      </div>
    </div>
  );
}