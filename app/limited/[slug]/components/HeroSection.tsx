"use client";
import Image from "next/image";
import { motion } from "framer-motion";

interface Product {
  name: string;
  images: { url: string }[];
  price?: number;
  description?: { text: string } | null;
}

interface HeroSectionProps {
  product: Product;
}

export default function HeroSection({ product }: HeroSectionProps) {
  if (!product || !product.images?.length) {
    return null;
  }

  const mainImage = product.images[0]?.url;

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-end pb-24 px-8 md:px-20">
      {/* 背景图层 - 使用 Next.js Image 优化 */}
      <div className="absolute inset-0 z-0">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          priority
          quality={90}
          className="object-cover"
          sizes="100vw"
        />
        
        {/* 双层渐变遮罩：顶部防过亮 + 底部确保文字清晰 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#050505]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent" />
      </div>

      {/* 文字内容层 */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          {/* Limited 标签 */}
          <div className="flex items-center gap-4">
            <span className="text-[10px] tracking-[1em] uppercase text-[#d4af37] font-bold">
              LIMITED EDITION
            </span>
          </div>

          {/* 产品名称 - 使用 product.name */}
          <h1 className="text-6xl md:text-[110px] lg:text-[120px] font-serif italic font-light leading-none tracking-[-0.02em] text-white">
            {product.name}
          </h1>

          {/* 副标题信息 */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12 pt-4">
            <p className="text-[11px] tracking-[0.5em] uppercase text-white/50">
              Only 300 pieces worldwide
            </p>
            <div className="hidden md:block h-[1px] w-24 bg-white/20" />
            <p className="text-[11px] tracking-[0.5em] uppercase text-white/50">
              Crafted for those who appreciate rarity
            </p>
          </div>
        </motion.div>
      </div>

      {/* 右侧垂直装饰文字 */}
      <div className="absolute right-8 md:right-12 bottom-28 hidden xl:block rotate-180">
        <p className="text-[9px] tracking-[1.4em] uppercase text-white/20 writing-vertical">
          EST. 2026 • PRIVÉ ARCHIVE
        </p>
      </div>
    </section>
  );
}