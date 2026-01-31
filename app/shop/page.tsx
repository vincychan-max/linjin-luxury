'use client';
import Link from 'next/link';
import Image from 'next/image';

// Mock 产品数据（后期从 Firestore 读取）
const products = [
  { id: '1', name: 'GG Marmont Mini Bag', price: '$2,390', image: 'https://via.placeholder.com/800x1000?text=Bag+1' },
  { id: '2', name: 'Ophidia GG Shoulder Bag', price: '$2,100', image: 'https://via.placeholder.com/800x1000?text=Bag+2' },
  { id: '3', name: 'Dionysus Mini Bag', price: '$1,890', image: 'https://via.placeholder.com/800x1000?text=Bag+3' },
  { id: '4', name: 'Horsebit 1955 Bag', price: '$2,650', image: 'https://via.placeholder.com/800x1000?text=Bag+4' },
];

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-white pt-32 px-6 md:px-12">
      <h1 className="text-4xl md:text-5xl font-thin tracking-widest text-center mb-16 uppercase">
        Shop All
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
        {products.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id} className="group">
            <div className="relative overflow-hidden rounded-xl shadow-lg">
              <Image
                src={product.image}
                alt={product.name}
                width={800}
                height={1000}
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <div className="mt-8 text-center">
              <p className="text-xl md:text-2xl font-thin tracking-widest">{product.name}</p>
              <p className="mt-4 text-lg">{product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}