"use client";
import { motion } from "framer-motion";

export default function LimitedGallery({ images }: { images: string[] }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-col space-y-24 py-24 lg:py-40 bg-[#050505]">
      {images.map((url, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-10%" }}
          className={`relative group w-full px-6 md:px-12
            ${index % 2 === 0 ? 'lg:pl-20 lg:pr-40' : 'lg:pr-20 lg:pl-40'}
          `}
        >
          {/* 装饰性背景编号 */}
          <div className={`absolute top-0 ${index % 2 === 0 ? 'right-10' : 'left-10'} text-[12vw] font-serif italic text-white/[0.03] pointer-events-none select-none`}>
            0{index + 1}
          </div>

          <div className="relative overflow-hidden bg-[#111] shadow-2xl">
            <img
              src={url}
              alt={`Detail ${index + 1}`}
              className={`w-full object-cover transition-transform duration-[4s] group-hover:scale-105
                ${index === 0 ? 'aspect-[4/5]' : 'aspect-square md:aspect-[3/4]'}
              `}
            />
            
            {/* 细节标签 */}
            <div className="absolute bottom-6 right-6 flex items-center gap-3">
              <div className="h-[1px] w-8 bg-[#d4af37]/50" />
              <span className="text-[8px] tracking-[0.4em] uppercase text-[#d4af37]">
                Detail view // 0{index + 1}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}