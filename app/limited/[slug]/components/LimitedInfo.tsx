"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InquiryForm from "./InquiryForm"; 

interface LimitedInfoProps {
  product: any;
}

export default function LimitedInfo({ product }: { product: any }) {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  /**
   * 🌟 核心修正点 1：描述信息解构
   * 确保无论后台返回的是对象还是字符串，都能稳定获取 HTML 内容
   */
  const descriptionHtml = useMemo(() => {
    if (!product?.description) return "";
    // 如果是 Hygraph 的 RichText 对象，取 .html；否则取字符串本身
    return typeof product.description === 'object' ? product.description.html : product.description;
  }, [product?.description]);

  if (!product) return null;

  return (
    <div className="flex flex-col h-full justify-center space-y-10">
      {/* 品牌标识 */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-4"
      >
        <span className="text-[10px] tracking-[0.9em] uppercase text-[#d4af37]">
          Privé Archive
        </span>
        <div className="h-[1px] flex-grow bg-white/10" />
      </motion.div>

      {/* 产品标题 */}
      <h1 className="text-4xl md:text-5xl font-serif italic font-light tracking-tight leading-tight text-white">
        {product.name}
      </h1>

      {/* 限量编号与价格 */}
      <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
        <div className="space-y-3">
          <p className="text-[9px] tracking-[0.6em] text-white/30 uppercase">Availability</p>
          <p className="text-xl font-mono text-[#d4af37]">№ {product.stock || '184'} <span className="text-white/20">/ 300</span></p>
        </div>
        <div className="space-y-3 text-right border-l border-white/5 pl-8">
          <p className="text-[9px] tracking-[0.6em] text-white/30 uppercase">Valuation</p>
          <p className="text-xl font-light text-[#d4af37]">
            ${product.price} <span className="text-[9px] opacity-40">USD</span>
          </p>
        </div>
      </div>

      {/* 描述信息区域 */}
      <div className="relative pl-8 border-l border-[#d4af37]/20">
        <div 
          className="
            description-content
            text-[13px] 
            leading-[1.8] 
            tracking-[0.05em] 
            text-white/60 
            font-light 
            space-y-8
            /* 针对内部 RichText 标签的深度样式优化 */
            [&_strong]:text-[#d4af37] 
            [&_strong]:text-[10px] 
            [&_strong]:tracking-[0.3em] 
            [&_strong]:uppercase 
            [&_strong]:block 
            [&_strong]:mb-2
            [&_p]:mb-6
          "
          dangerouslySetInnerHTML={{ __html: descriptionHtml }} 
        />
      </div>

      {/* 交互按钮 */}
      <div className="pt-6">
        <button 
          onClick={() => setIsEnquiryOpen(true)}
          className="group relative w-full border border-[#d4af37]/30 py-6 overflow-hidden transition-all duration-700 hover:border-[#d4af37]"
        >
          <div className="absolute inset-0 bg-[#d4af37]/0 group-hover:bg-[#d4af37]/5 transition-colors duration-700" />
          <span className="relative z-10 text-[11px] tracking-[0.8em] uppercase font-bold group-hover:text-[#d4af37] transition-colors duration-500">
            Request Access
          </span>
        </button>
        
        <p className="mt-8 text-[8px] text-center tracking-[0.3em] text-white/20 uppercase">
          * Application review required for allocation
        </p>
      </div>

      {/* 弹窗 */}
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