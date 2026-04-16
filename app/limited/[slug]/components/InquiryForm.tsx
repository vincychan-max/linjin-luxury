"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InquiryFormProps {
  product: any;
  onClose: () => void;
}

export default function InquiryForm({ product, onClose }: InquiryFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("Selected_Product", product?.title || "Exclusive Archive Piece");

    try {
      const response = await fetch("https://formspree.io/f/xqeylgjo", {
        method: "POST",
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        alert("Request could not be processed.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-6 md:p-12"
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

      <button 
        onClick={onClose} 
        className="absolute top-10 right-10 text-[12px] tracking-[0.8em] uppercase text-white font-bold z-10"
      >
        Close [×]
      </button>

      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 max-w-4xl w-full flex flex-col items-center space-y-12 py-10"
          >
            <header className="text-center space-y-6">
              <span className="text-[11px] tracking-[1.2em] uppercase text-[#d4af37] font-bold block">
                Privé Archive Enquire
              </span>
              <h2 className="text-5xl md:text-7xl font-serif italic text-white leading-tight">
                Request Access For <br /> 
                <span className="text-white">{product?.title || "Limited Edition"}</span>
              </h2>
            </header>

            <form onSubmit={handleSubmit} className="w-full space-y-12">
              {/* 高度恢复，文字加深加亮 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 border-t border-b border-white/20 py-10">
                <div className="space-y-4">
                  {/* 问题（标签）：字号加大至 14px，纯白加粗 */}
                  <label className="text-[14px] tracking-[0.6em] uppercase text-white block font-black">Full Name</label>
                  <input 
                    name="Full_Name" 
                    required 
                    type="text" 
                    className="w-full border-b border-white bg-transparent outline-none text-xl tracking-[0.1em] uppercase py-3 text-white focus:border-[#d4af37] transition-all placeholder:text-white/30 font-bold" 
                    placeholder="REQUIRED" 
                  />
                </div>
                <div className="space-y-4 md:border-l md:border-white/10 md:pl-12">
                  <label className="text-[14px] tracking-[0.6em] uppercase text-white block font-black">Email Address</label>
                  <input 
                    name="Email" 
                    required 
                    type="email" 
                    className="w-full border-b border-white bg-transparent outline-none text-xl tracking-[0.1em] uppercase py-3 text-white focus:border-[#d4af37] transition-all placeholder:text-white/30 font-bold" 
                    placeholder="FOR CONTACT" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[14px] tracking-[0.6em] uppercase text-white block font-black">Personal Message</label>
                <input 
                  name="Message" 
                  type="text" 
                  className="w-full border-b border-white bg-transparent outline-none text-xl py-3 text-white focus:border-[#d4af37] transition-all placeholder:text-white/30 font-bold" 
                  placeholder="Any specific requirements..." 
                />
              </div>

              {/* 按钮高度恢复原本的 py-8 */}
              <button 
                disabled={loading}
                type="submit"
                className="group relative w-full border border-white py-8 overflow-hidden transition-all duration-700 hover:border-[#d4af37] bg-white/5"
              >
                <span className="relative z-10 text-[15px] tracking-[1.2em] uppercase font-black text-white group-hover:text-[#d4af37] transition-colors">
                  {loading ? "Verifying..." : "Submit Application"}
                </span>
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 text-center space-y-16 w-full"
          >
            <div className="space-y-6">
              <h2 className="text-7xl md:text-8xl font-serif italic text-white">Thank You.</h2>
              <span className="text-[12px] tracking-[1.5em] uppercase text-[#d4af37] font-bold block">Application Received</span>
            </div>
            <div className="space-y-8">
              <p className="text-[16px] tracking-[0.4em] uppercase text-white font-bold leading-relaxed">
                Your private enquiry has been <br /> securely processed.
              </p>
              <div className="inline-block px-10 py-3 border border-white/20 rounded-full">
                 <span className="text-[12px] tracking-[0.4em] text-white font-bold">REF: № LIN-{Math.floor(Math.random() * 8999) + 1000}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-[12px] tracking-[1em] uppercase text-white border-b border-white/30 pb-2 font-bold">Return to Gallery</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}