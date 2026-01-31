// 第一步：修改后端 API 支持分页（app/api/search/route.ts）

import { NextRequest } from 'next/server';

// 真实产品数据（模拟数据库，以后换真实 DB）
const products = [
  { id: 1, name: 'Classic Handbag', price: '$4,800', image: 'https://via.placeholder.com/600x800?text=Classic+Handbag' },
  { id: 2, name: 'Mini Chain Bag', price: '$3,200', image: 'https://via.placeholder.com/600x800?text=Mini+Chain+Bag' },
  { id: 3, name: 'Everyday Tote', price: '$2,500', image: 'https://via.placeholder.com/600x800?text=Everyday+Tote' },
  { id: 4, name: 'Evening Clutch', price: '$2,900', image: 'https://via.placeholder.com/600x800?text=Evening+Clutch' },
  { id: 5, name: 'Limited Edition Heels', price: '$1,800', image: 'https://via.placeholder.com/600x800?text=Limited+Heels' },
  { id: 6, name: 'New Arrival Dress', price: '$6,500', image: 'https://via.placeholder.com/600x800?text=New+Dress' },
  { id: 7, name: 'Luxury Watch', price: '$12,000', image: 'https://via.placeholder.com/600x800?text=Luxury+Watch' },
  { id: 8, name: 'Silk Scarf', price: '$850', image: 'https://via.placeholder.com/600x800?text=Silk+Scarf' },
  { id: 9, name: 'Custom Suit', price: '$8,500', image: 'https://via.placeholder.com/600x800?text=Custom+Suit' },
  { id: 10, name: 'Bespoke Jewelry', price: '$15,000', image: 'https://via.placeholder.com/600x800?text=Bespoke+Jewelry' },
  { id: 11, name: 'Oxford Shoes', price: '$1,200', image: 'https://via.placeholder.com/600x800?text=Oxford+Shoes' },
  { id: 12, name: 'Cashmere Coat', price: '$5,800', image: 'https://via.placeholder.com/600x800?text=Cashmere+Coat' },
  // 可以继续添加更多产品...
];

const LIMIT = 9; // 每页9个产品（3列网格）

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase() || '';
  const page = parseInt(searchParams.get('page') || '1');

  // 过滤匹配的产品
  let filtered = products;
  if (q) {
    filtered = products.filter(product =>
      product.name.toLowerCase().includes(q)
    );
  }

  // 分页计算
  const total = filtered.length;
  const totalPages = Math.ceil(total / LIMIT);
  const start = (page - 1) * LIMIT;
  const results = filtered.slice(start, start + LIMIT);

  return Response.json({
    results,
    total,
    currentPage: page,
    totalPages,
  });
}