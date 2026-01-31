import { NextRequest } from 'next/server';

// 模拟奢侈品搜索建议（以后可以换成真实数据库）
const allSuggestions = [
  'Classic Handbag',
  'Mini Chain Bag',
  'Everyday Tote',
  'Evening Clutch',
  'Limited Edition Heels',
  'New Arrival Dress',
  'Luxury Watch',
  'Silk Scarf',
  'Custom Suit',
  'Bespoke Jewelry',
  'Oxford Shoes',
  'Cashmere Coat',
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase() || '';

  const suggestions = allSuggestions
    .filter(item => item.toLowerCase().includes(q))
    .slice(0, 10);

  return Response.json({ suggestions });
}