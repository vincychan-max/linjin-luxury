"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// 1. 确保导入路径正确，如果 InquiryForm 在同级目录用 "./InquiryForm"
import InquiryForm from "./InquiryForm"; 

interface LimitedInfoProps {
  product: any;
}

export default function LimitedInfo({ product }: { product: any }) {
  // 2. 控制弹窗显隐的状态
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  // 3. 安全检查：如果数据未就绪，返回骨架屏或空，防止渲染报错
  if (!product) return null;

  return (
    <div className="flex flex-col h-full justify-center space-y-12">
      {/* 品牌标识 */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-4"
      >
        <span className="text-[10px] tracking-[0.9em] uppercase text-[#d4af37]">
          Privé Archive
        </span>
        <div className="h-[px] flex-grow bg-white/10" />
      </motion.div>

      {/* 产品标题 */}
      <h1 className="text-4xl md:text-5xl font-serif italic font-light tracking-tight leading-tight">
        {product.title}
      </h1>

      {/* 限量编号与价格 */}
      <div className="grid grid-cols-2 gap-8 py-10 border-y border-white/5">
        <div className="space-y-3">
          <p className="text-[9px] tracking-[0.6em] text-white/30 uppercase">Availability</p>
          <p className="text-xl font-mono text-[#d4af37]">№ 184 <span className="text-white/20">/ 300</span></p>
        </div>
        <div className="space-y-3 text-right border-l border-white/5 pl-8">
          <p className="text-[9px] tracking-[0.6em] text-white/30 uppercase">Valuation</p>
          <p className="text-xl font-light text-[#d4af37]">
            ${product.price} <span className="text-[9px] opacity-40">USD</span>
          </p>
        </div>
      </div>

      {/* 描述信息 */}
      <div 
        className="text-[11px] leading-[2.6] tracking-[0.2em] text-white/50 uppercase font-light border-l border-[#d4af37]/20 pl-6"
        dangerouslySetInnerHTML={{ __html: product.description?.html || product.description }} 
      />

      {/* 交互按钮 */}
      <div className="pt-10">
        <button 
          onClick={() => setIsEnquiryOpen(true)}
          className="group relative w-full border border-[#d4af37]/30 py-6 overflow-hidden transition-all duration-700 hover:border-[#d4af37]"
        >
          {/* 按钮内的光影流动效果 */}
          <div className="absolute inset-0 bg-[#d4af37]/0 group-hover:bg-[#d4af37]/5 transition-colors duration-700" />
          <span className="relative z-10 text-[11px] tracking-[0.8em] uppercase font-bold group-hover:text-[#d4af37] transition-colors duration-500">
            Request Access
          </span>
        </button>
        
        <p className="mt-8 text-[8px] text-center tracking-[0.3em] text-white/20 uppercase">
          * Application review required for allocation
        </p>
      </div>

      {/* 4. 核心：调用整合后的 InquiryForm */}
      <AnimatePresence>
        {isEnquiryOpen && (
          <InquiryForm 
            product={product} 
            onClose={() => setIsEnquiryOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}