'use client';
import Image from 'next/image';
import Link from 'next/link';

export default function LuxuryFusionPage() {
  return (
    <div className="bg-white min-h-screen text-[#1A1A1A] selection:bg-black selection:text-white">
      {/* --- POLÈNE STYLE: 极简流白头部 --- */}
      <nav className="pt-12 pb-24 text-center">
        <h1 className="text-[13px] tracking-[0.8em] font-light uppercase text-gray-400">LINJIN LUXURY</h1>
      </nav>

      <section className="max-w-[1400px] mx-auto px-6 mb-32">
        <div className="relative h-[85vh] w-full overflow-hidden">
          <Image 
            src="/campaign-hero.jpg" // 建议选一张背景色单一、构图偏一侧的模特图
            alt="The New Minimalism"
            fill
            className="object-cover transition-transform duration-[3000ms] hover:scale-105"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
             <span className="text-[10px] tracking-[0.5em] uppercase mb-4 text-white/80">Edition 01</span>
             <h2 className="text-5xl md:text-7xl font-extralight tracking-tighter text-white mb-8">Pure Form.</h2>
             <button className="px-10 py-3 border border-white text-white text-[11px] tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all duration-500">
               Explore the Craft
             </button>
          </div>
        </div>
      </section>

      {/* --- SENREVE STYLE: 材质功能对比 (核心转化区) --- */}
      <section className="bg-[#FAF9F6] py-32 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <h3 className="text-2xl font-light tracking-widest uppercase">Engineered for Life</h3>
            <div className="grid grid-cols-1 gap-10">
              {/* 功能卖点 1 */}
              <div className="flex gap-6">
                <div className="w-10 h-10 border border-black flex items-center justify-center text-xs">01</div>
                <div>
                  <h4 className="text-sm font-bold tracking-widest uppercase mb-2">Scratch & Water Resistant</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">我们的荔枝纹皮经过特殊处理，无惧指甲刮擦与突如其来的雨水，保持长久如新。</p>
                </div>
              </div>
              {/* 功能卖点 2 */}
              <div className="flex gap-6">
                <div className="w-10 h-10 border border-black flex items-center justify-center text-xs">02</div>
                <div>
                  <h4 className="text-sm font-bold tracking-widest uppercase mb-2">Featherweight Construction</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">摒弃沉重的钢衬，采用航空级内衬材料，确保大容量的同时，自重不到 600g。</p>
                </div>
              </div>
            </div>
          </div>
          {/* 这里放一张皮料微距大图，能看清纹理和水滴不渗透的效果 */}
          <div className="relative h-[500px] shadow-2xl">
            <Image src="/material-detail.jpg" alt="Material" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* --- ITALIC STYLE: 硬核价格透明对比 --- */}
      <section className="py-32 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h3 className="text-xs tracking-[0.5em] text-gray-400 uppercase">The Transparency Report</h3>
          <p className="text-2xl font-light">Why pay for the logo, when you can own the leather?</p>
        </div>
        
        <div className="border-t border-black">
          <div className="grid grid-cols-3 py-8 border-b border-gray-100 text-[11px] tracking-widest uppercase font-bold">
            <div>Component</div>
            <div className="text-center text-gray-400">Traditional Luxury</div>
            <div className="text-right">LinJin Luxury</div>
          </div>
          {/* 价格对比行 */}
          <div className="grid grid-cols-3 py-6 border-b border-gray-100 text-sm font-light">
            <div>Material (Grade A Calfskin)</div>
            <div className="text-center">$85.00</div>
            <div className="text-right">$85.00</div>
          </div>
          <div className="grid grid-cols-3 py-6 border-b border-gray-100 text-sm font-light">
            <div>Craftsmanship (Hand-stitched)</div>
            <div className="text-center">$120.00</div>
            <div className="text-right">$120.00</div>
          </div>
          <div className="grid grid-cols-3 py-6 border-b border-gray-100 text-sm font-light text-red-500">
            <div>Marketing & Retail Markup</div>
            <div className="text-center">$1,800.00</div>
            <div className="text-right">$0.00</div>
          </div>
          <div className="grid grid-cols-3 py-10 text-xl font-light">
            <div>Final Price</div>
            <div className="text-center text-gray-400 line-through">$2,450</div>
            <div className="text-right font-bold">$299</div>
          </div>
        </div>
      </section>

      {/* --- 结尾: 极简成交 --- */}
      <section className="pb-40 text-center">
        <button className="bg-black text-white px-20 py-5 text-[12px] tracking-[0.4em] uppercase hover:bg-gray-800 transition-all shadow-xl">
          Reserve from Atelier
        </button>
        <p className="mt-6 text-[10px] text-gray-400 tracking-widest uppercase">Limited production. Ships globally from our factory.</p>
      </section>
    </div>
  );
}