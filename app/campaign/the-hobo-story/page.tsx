'use client';
import Image from 'next/image';
import Link from 'next/link';

export default function CampaignPage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans text-[#1A1A1A]">
      {/* 1. 极简 Header - 仅展示 Logo */}
      <nav className="py-8 text-center">
        <h1 className="text-2xl tracking-[0.6em] font-light uppercase">LINJIN LUXURY</h1>
      </nav>

      {/* 2. Hero Section - 视觉冲击 */}
      <section className="relative h-[90vh] w-full">
        <Image 
          src="/campaign-hero.jpg" // 这里放你那张最有质感的模特氛围图
          alt="LJL Hobo Bag"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-end pb-20 text-white">
          <h2 className="text-4xl md:text-6xl font-extralight tracking-widest mb-4">THE $300 REVOLUTION</h2>
          <p className="text-lg tracking-widest mb-8 opacity-90 text-center px-4">
            Luxury quality, without the brand tax. Direct from our atelier.
          </p>
          <button className="bg-white text-black px-12 py-4 tracking-widest hover:bg-black hover:text-white transition-all duration-500 uppercase text-sm">
            Own the Craft
          </button>
        </div>
      </section>

      {/* 3. 创始人背书 - 建立信任 */}
      <section className="max-w-7xl mx-auto py-24 px-6 grid md:grid-cols-2 gap-16 items-center">
        <div className="relative h-[600px] rounded-sm overflow-hidden shadow-2xl">
          <Image 
            src="/founder-at-work.jpg" // 这里放你在工厂挑选皮料的真实工作照
            alt="Founder at Atelier"
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-8">
          <span className="text-xs tracking-[0.4em] text-gray-500 uppercase">Our Story</span>
          <h3 className="text-3xl font-light leading-tight">“I grew up in the scent of leather. I refused to let craftsmanship be hidden behind a $2000 markup.”</h3>
          <p className="text-gray-600 leading-relaxed text-lg">
            As a second-generation factory owner, I’ve seen the world’s finest bags leave our hands with a brand tag that costs 10x our craft. <strong>LINJIN LUXURY</strong> is my promise to you: The exact same Grade-A leather, the same hand-stitched precision, delivered directly to your door.
          </p>
          <div className="pt-4 border-t border-gray-200">
            <p className="font-medium italic">— Lin Jin, Founder & Artisan</p>
          </div>
        </div>
      </section>

      {/* 4. 材质暴击 - 专业性展示 */}
      <section className="bg-white py-24">
        <div className="max-w-5xl mx-auto text-center px-6">
          <h3 className="text-xs tracking-[0.5em] text-gray-400 uppercase mb-16">Sensory Excellence</h3>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="h-40 w-40 mx-auto relative rounded-full overflow-hidden border border-gray-100">
                <Image src="/leather-texture.jpg" alt="Grain" fill className="object-cover" />
              </div>
              <h4 className="tracking-widest uppercase text-sm font-bold">Grade-A Hide</h4>
              <p className="text-sm text-gray-500">Only the top 5% of vegetable-tanned leather makes the cut.</p>
            </div>
            <div className="space-y-4">
              <div className="h-40 w-40 mx-auto relative rounded-full overflow-hidden border border-gray-100">
                <Image src="/stitching.jpg" alt="Craft" fill className="object-cover" />
              </div>
              <h4 className="tracking-widest uppercase text-sm font-bold">Hand-Burnished</h4>
              <p className="text-sm text-gray-500">Each edge is hand-painted and polished for a seamless finish.</p>
            </div>
            <div className="space-y-4">
              <div className="h-40 w-40 mx-auto relative rounded-full overflow-hidden border border-gray-100">
                <Image src="/hardware.jpg" alt="Hardware" fill className="object-cover" />
              </div>
              <h4 className="tracking-widest uppercase text-sm font-bold">Solid Brass</h4>
              <p className="text-sm text-gray-500">Custom-forged hardware that feels heavy and reliable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 独一无二的验证系统 */}
      <section className="bg-[#1A1A1A] text-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h3 className="text-2xl tracking-[0.4em] font-extralight uppercase">Authenticity In Every Stitch</h3>
          <p className="text-gray-400 leading-relaxed">
            Every LJL creation is registered in our global database. Your bag carries a unique serial number, proving its artisanal origin and ensuring it is never a copy.
          </p>
          <Link href="/verify" className="inline-block border-b border-white pb-1 text-sm tracking-widest hover:text-gray-300 transition-colors">
            VERIFY YOUR HERITAGE →
          </Link>
        </div>
      </section>

      {/* 6. 最终成交区 */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <h3 className="text-3xl font-extralight tracking-widest mb-12 uppercase">Join the Collective</h3>
        <div className="bg-white p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 h-[400px] relative">
            <Image src="/the-bag-product.jpg" alt="The Product" fill className="object-contain" />
          </div>
          <div className="w-full md:w-1/2 text-left space-y-6">
            <h4 className="text-2xl tracking-widest">THE ATELIER HOBO</h4>
            <p className="text-3xl font-light">$299 <span className="text-lg text-gray-400 line-through ml-4">$2,450 Retail</span></p>
            <ul className="text-sm space-y-2 text-gray-600">
              <li>✓ Free Global Express Shipping</li>
              <li>✓ 30-Day Artisanal Guarantee</li>
              <li>✓ Limited Batch: No. 12 of 50</li>
            </ul>
            <button className="w-full bg-black text-white py-5 tracking-[0.3em] uppercase text-sm hover:bg-gray-800 transition-all">
              Claim Yours Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}