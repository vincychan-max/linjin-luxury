'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function EssentialCampaign() {
  // 模拟多颜色切换逻辑
  const [selectedColor, setSelectedColor] = useState('Classic Black');
  
  const colors = [
    { name: 'Classic Black', hex: '#1A1A1A', img: '/product-black.jpg' },
    { name: 'Caramel Brown', hex: '#A67B5B', img: '/product-brown.jpg' },
    { name: 'Cream White', hex: '#F5F5DC', img: '/product-white.jpg' },
    { name: 'Sage Green', hex: '#8A9A5B', img: '/product-green.jpg' },
  ];

  return (
    <div className="bg-white min-h-screen text-[#333] font-sans selection:bg-red-100">
      {/* 1. 顶部公告栏 - 制造紧迫感 */}
      <div className="bg-black text-white text-[11px] py-2 text-center tracking-widest uppercase">
        Flash Sale: 40% OFF + Free Global Shipping Today
      </div>

      {/* 2. 极简导航 */}
      <nav className="py-6 px-6 border-b border-gray-100 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tighter">LINJIN LUXURY</h1>
        <div className="text-[10px] bg-red-600 text-white px-2 py-1 rounded-sm animate-pulse">
          FACTORY DIRECT
        </div>
      </nav>

      {/* 3. 产品展示区 - 左右结构 */}
      <section className="max-w-7xl mx-auto py-12 px-6 grid md:grid-cols-2 gap-12">
        {/* 左侧：大图展示 */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-[#F9F9F9] rounded-xl overflow-hidden border border-gray-100">
            <Image 
              src={colors.find(c => c.name === selectedColor)?.img || '/product-main.jpg'} 
              alt={selectedColor}
              fill
              className="object-contain p-8"
            />
          </div>
          {/* 缩略图/多色切换 */}
          <div className="flex gap-3">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                className={`w-12 h-12 rounded-full border-2 transition-all ${
                  selectedColor === color.name ? 'border-black scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* 右侧：购买逻辑 */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase italic">The Everyday Hobo</h2>
            <p className="text-gray-500 text-sm italic">Grade-A Pebbled Leather · Hand-stitched</p>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-bold text-red-600">$89</span>
            <span className="text-xl text-gray-400 line-through">$249 Retail</span>
            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded">SAVE 65%</span>
          </div>

          <p className="text-sm leading-relaxed text-gray-600">
            为什么这么便宜？因为我们是工厂直达。去掉了品牌溢价、中间商差价和昂贵的专柜租金。同样的皮料，只需三分之一的价格。
          </p>

          <button className="w-full bg-black text-white py-5 rounded-lg font-bold tracking-widest hover:bg-gray-800 transition-transform active:scale-95 shadow-lg">
            ADD TO CART — {selectedColor}
          </button>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <span>✈️</span> Free Global Express
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <span>🛡️</span> 30-Day Money Back
            </div>
          </div>
        </div>
      </section>

      {/* 4. 为什么选我们？(三栏式 - 获得感) */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <div className="text-3xl">🐄</div>
            <h4 className="font-bold uppercase text-xs tracking-widest">Real Leather</h4>
            <p className="text-xs text-gray-500">不是PU皮，不是合成革。采用顶级头层牛皮，手感细腻且耐磨。</p>
          </div>
          <div className="space-y-4">
            <div className="text-3xl">🏭</div>
            <h4 className="font-bold uppercase text-xs tracking-widest">Factory Direct</h4>
            <p className="text-xs text-gray-500">我们拥有 20 年代工厂经验，每一只包都经过严格的 QC 检验。</p>
          </div>
          <div className="space-y-4">
            <div className="text-3xl">💎</div>
            <h4 className="font-bold uppercase text-xs tracking-widest">Premium Hardware</h4>
            <p className="text-xs text-gray-500">采用不褪色的高强度合金拉链，顺滑不卡顿。</p>
          </div>
        </div>
      </section>

      {/* 5. 工厂直击 (信任感) */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h3 className="text-center font-bold mb-12 uppercase tracking-widest">Transparent Craftsmanship</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
           {/* 这里放你工厂实拍的照片 */}
           <div className="bg-gray-200 aspect-video relative overflow-hidden">
             <Image src="/factory-1.jpg" alt="Production" fill className="object-cover" />
           </div>
           <div className="bg-gray-200 aspect-video relative overflow-hidden">
             <Image src="/factory-2.jpg" alt="Leather" fill className="object-cover" />
           </div>
           <div className="bg-gray-200 aspect-video relative overflow-hidden">
             <Image src="/factory-3.jpg" alt="QC" fill className="object-cover" />
           </div>
        </div>
        <p className="mt-8 text-center text-sm text-gray-400 italic">
          No fancy filters. No models. Just real craft.
        </p>
      </section>
    </div>
  );
}