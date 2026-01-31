import Link from 'next/link';
import Image from 'next/image';

export default function WorldOfLJL() {
  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden">

      {/* Hero Section - 带模糊占位，防报错 */}
<section className="relative h-screen flex items-center justify-center">
  <Image 
    src="/images/world-hero.jpg"  // ← 改成你的实际文件名（如 placeholder.jpg 如果你有）
    alt="World of LinJin Luxury" 
    fill 
    className="object-cover"
    priority
    placeholder="blur"  // ← 模糊占位（加载中显示模糊版）
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="  // ← 通用模糊占位基64（灰色模糊图）
  />
  <div className="absolute inset-0 bg-black/40" />
  <div className="relative text-center text-white z-10 px-6">
    <h1 className="text-6xl md:text-8xl font-thin tracking-widest mb-8">
      World of LinJin Luxury
    </h1>
    <p className="text-2xl md:text-3xl font-light tracking-wider max-w-4xl mx-auto">
      Timeless Craftsmanship • Eternal Elegance • Endless Innovation
    </p>
    <p className="text-lg mt-8 opacity-90">
      Since 1998, LinJin Luxury has redefined modern elegance through masterful artistry and unwavering dedication to excellence.
    </p>
  </div>
</section>

   

      {/* Chapter 2: Craftsmanship - 工艺展示 */}
      <section className="py-20 px-6 bg-gray-50">
        <h2 className="text-5xl md:text-6xl font-thin text-center mb-16 tracking-widest">
          Masterful Craftsmanship
        </h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <video autoPlay muted loop playsInline className="w-full rounded-lg shadow-2xl">
              <source src="/videos/handcraft.mp4" type="video/mp4" />
              {/* 备用图片 */}
          <Image src="/images/handcraft.jpg" alt="LinJin Luxury Craftsmanship" fill className="object-cover" />
            </video>
          </div>
          <div>
            <p className="text-xl leading-relaxed opacity-90 mb-8">
              Every LinJin piece is born from the hands of master artisans. From selecting the finest leathers to the final stitch, our atelier upholds centuries-old techniques fused with modern precision.
            </p>
            <p className="text-xl leading-relaxed opacity-90">
              "True luxury is not in perfection, but in the soul infused by human hands." – Lin Jin
            </p>
          </div>
        </div>
      </section>

      {/* Chapter 3: Signature Icons - 标志性元素 */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-thin text-center mb-16 tracking-widest">
          Signature Icons
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          
          <div className="text-center">
            <Image src="/images/icon-buckle.jpg" alt="Signature Buckle" width={400} height={400} className="mx-auto mb-6 object-cover rounded-lg" />
            <h3 className="text-2xl font-thin mb-4">Iconic Buckle</h3>
          </div>
          <div className="text-center">
            <Image src="/images/icon-leather.jpg" alt="Exotic Leathers" width={400} height={400} className="mx-auto mb-6 object-cover rounded-lg" />
            <h3 className="text-2xl font-thin mb-4">Exotic Leathers</h3>
          </div>
          <div className="text-center">
            <Image src="/images/icon-stitch.jpg" alt="Hand Stitching" width={400} height={400} className="mx-auto mb-6 object-cover rounded-lg" />
            <h3 className="text-2xl font-thin mb-4">Saddle Stitch</h3>
          </div>
        </div>
      </section>

      {/* Chapter 4: Sustainability & Responsibility */}
      <section className="py-20 px-6 bg-gray-50">
        <h2 className="text-5xl md:text-6xl font-thin text-center mb-16 tracking-widest">
          Sustainability & Responsibility
        </h2>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl leading-relaxed opacity-90 mb-12">
            At LinJin Luxury, we believe true elegance respects the planet. We source ethical materials, reduce carbon footprint, and support artisan communities worldwide.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-8 bg-white rounded-lg shadow-lg">
              <h3 className="text-2xl font-thin mb-4">Ethical Sourcing</h3>
              <p>100% traceable leathers and materials</p>
            </div>
            <div className="p-8 bg-white rounded-lg shadow-lg">
              <h3 className="text-2xl font-thin mb-4">Carbon Neutral</h3>
              <p>Committed to net-zero by 2030</p>
            </div>
            <div className="p-8 bg-white rounded-lg shadow-lg">
              <h3 className="text-2xl font-thin mb-4">Artisan Support</h3>
              <p>Preserving traditional crafts globally</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter 5: Experiences - 门店与体验 */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl font-thin mb-16 tracking-widest">
          Exclusive Experiences
        </h2>
        <p className="text-xl leading-relaxed opacity-90 max-w-4xl mx-auto mb-12">
          Visit our flagship boutiques worldwide for personalized consultations, private viewings, and bespoke creations.
        </p>
        <Image src="/images/stores-map.jpg" alt="Global Boutiques" width={1200} height={600} className="mx-auto rounded-lg shadow-2xl" />
      </section>

      
    </div>
  );
}