"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroSection({ product }: { product: any }) {
  if (!product || !product.images?.length) return null;

  const mainImage = product.images[0]?.url;

  return (
    <section className="relative h-screen w-full bg-black overflow-hidden">
      {/* 背景图片层 */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.8, ease: "easeOut" }}
          className="relative w-full h-full"
        >
          <Image
            src={mainImage}
            alt={product.name || "LINJIN Privé"}
            fill
            priority
            className="object-cover object-center"
            quality={95}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/40 to-black/85" />
        </motion.div>
      </div>

      {/* 内容层 - 增加顶部安全距离，避免与 Navbar 重叠 */}
      <div className="relative z-10 h-full flex flex-col pt-10 md:pt-15 pb-20 md:pb-28 px-8 md:px-16">
        <div className="max-w-2xl mt-auto">
          
          {/* 主标题 Privé */}
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="text-[68px] md:text-[96px] leading-none font-light tracking-[-2.5px] text-white mb-6"
          >
            Privé
          </motion.h1>

          {/* 副标题 - Hand-carved. One of a kind. */}
          <motion.p 
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.3 }}
            className="text-[21px] md:text-[26px] font-light text-white/80 tracking-wide leading-tight mb-20 md:mb-24"
          >
            Hand-carved.<br className="md:hidden" /> One of a kind.
          </motion.p>
        </div>

        {/* 底部信息栏 */}
        <div className="mt-auto pt-12 border-t border-white/10 flex justify-between items-end text-[10px] tracking-[2px] text-white/40">
          <div>SERIES 01 • 2026</div>
          <div className="hidden md:block">ATELIER PRIVÉ • LIMITED EDITION</div>
          
          <motion.div 
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-[#d4af37] text-xs tracking-widest cursor-pointer hover:text-white transition-colors"
          >
            SCROLL TO DISCOVER
          </motion.div>
        </div>
      </div>
    </section>
  );
}