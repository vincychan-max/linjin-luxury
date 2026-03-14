// app/women/page.tsx
import React from 'react';

export default function WomenCollectionPage() {
  return (
    <div className="min-h-screen bg-white pt-32 px-4 md:px-12">
      <div className="max-w-[1300px] mx-auto">
        <h1 className="text-[10px] uppercase tracking-[10px] font-light text-black mb-12">
          Women's Collection
        </h1>
        {/* 这里将来放置你的产品列表组件 */}
        <p className="text-[10px] tracking-widest text-zinc-400 uppercase">
          Curating the finest selection...
        </p>
      </div>
    </div>
  );
}