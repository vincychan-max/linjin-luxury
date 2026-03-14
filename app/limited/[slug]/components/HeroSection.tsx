"use client";
import { motion } from "framer-motion";

export default function HeroSection({ product }: { product: any }) {
  if (!product) return null;

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-end pb-24 px-8 md:px-20">
      {/* 背景图层 */}
      <div className="absolute inset-0 z-0">
        <img 
          src={product.images?.[0]?.url} 
          className="w-full h-full object-cover" 
          alt="Main Collection" 
        />
        {/* 关键：双层渐变。顶部防过亮，底部确保标题清晰 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#050505]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
      </div>

      {/* 文字层：采用左对齐或居中对齐，避开图片核心视觉点 */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4">
            <span className="text-[10px] tracking-[1em] uppercase text-[#d4af37] font-bold">
              Limited Edition
            </span>
          </div>
          
          <h1 className="text-6xl md:text-[120px] font-serif italic font-light leading-none tracking-tighter text-white">
            {product.title}
          </h1>

          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12 pt-4">
            <p className="text-[11px] tracking-[0.5em] uppercase text-white/40">
              Only 300 pieces worldwide
            </p>
            <div className="hidden md:block h-[1px] w-24 bg-white/20" />
            <p className="text-[11px] tracking-[0.5em] uppercase text-white/40">
              Crafted for women who shine
            </p>
          </div>
        </motion.div>
      </div>

      {/* 侧边装饰：垂直文字 */}
      <div className="absolute right-12 bottom-24 hidden xl:block">
        <p className="text-[9px] tracking-[1em] uppercase text-white/20 vertical-text origin-bottom">
          Est. 2026 Archive
        </p>
      </div>
    </section>
  );
}