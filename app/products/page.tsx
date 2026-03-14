'use client';

import { useState, useEffect } from 'react';
import { request, gql } from 'graphql-request';
import Image from 'next/image';
import Link from 'next/link';

const HYGRAPH_ENDPOINT = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT!;
const HYGRAPH_TOKEN = process.env.HYGRAPH_TOKEN; // 如果需要

const GET_PRODUCTS = gql`
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, orderBy: name_ASC, stage: PUBLISHED) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        price
        colors
        images {
          url
        }
        colorImages
      }
    }
  }
`;

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColor, setSelectedColor] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [lastCursor, setLastCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // 分页加载
  const fetchProducts = async (isLoadMore = false) => {
    if (!hasMore && isLoadMore) return;
    setLoading(true);

    try {
      const variables = {
        first: 20,
        after: isLoadMore ? lastCursor : null,
      };

      const headers: HeadersInit = {};
      if (HYGRAPH_TOKEN) {
        headers.Authorization = `Bearer ${HYGRAPH_TOKEN}`;
      }

      const data = await request(HYGRAPH_ENDPOINT, GET_PRODUCTS, variables, headers);

      const newProducts = data.products.nodes.map((node: any) => ({
        id: node.id,
        name: node.name,
        price: node.price,
        colors: node.colors || [],
        images: node.images?.map((img: any) => img.url) || [],
        colorImages: node.colorImages || null, // 假设是对象 {color: [url,...]}
      }));

      setAllProducts(prev => isLoadMore ? [...prev, ...newProducts] : newProducts);
      setLastCursor(data.products.pageInfo.endCursor);
      setHasMore(data.products.pageInfo.hasNextPage);
    } catch (error) {
      console.error('Hygraph fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 客户端过滤（与原来一致）
  useEffect(() => {
    let filtered = allProducts;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedColor !== 'all') {
      filtered = filtered.filter(p =>
        p.colors?.some((c: string) => c.toLowerCase() === selectedColor.toLowerCase())
      );
    }

    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(p => {
        const price = Number(p.price?.replace(/[^0-9.-]+/g, "") || 0);
        return price >= min && (!max || price <= max);
      });
    }

    setFilteredProducts(filtered);
  }, [allProducts, searchTerm, selectedColor, priceRange]);

  // 动态颜色选项
  const availableColors = Array.from(new Set(allProducts.flatMap(p => p.colors || [])));

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-5xl md:text-6xl font-thin uppercase tracking-widest text-center mb-16">
          All Products
        </h1>

        {/* 搜索 + 过滤栏 */}
        <div className="flex flex-col md:flex-row gap-8 mb-16">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-8 py-4 border-2 border-gray-300 uppercase tracking-widest text-lg focus:border-black outline-none"
          />

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
                    src={
                      product.colorImages && Object.keys(product.colorImages).length > 0
                        ? product.colorImages[Object.keys(product.colorImages)[0]][0]
                        : product.images?.[0] || '/images/placeholder.jpg'
                    }
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

        {/* Load More */}
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