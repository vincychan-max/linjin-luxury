'use client';

import Image from 'next/image';
import { X, Phone, MessageCircle, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

// 定义组件接口
interface ContactModalsProps {
  showContactModal: boolean;
  setShowContactModal: (value: boolean) => void;
  showWhatsAppModal: boolean;
  setShowWhatsAppModal: (value: boolean) => void;
  onWhatsAppClick: () => void; // WhatsApp 跳转逻辑
  onEmailClick: () => void;    // Email 跳转逻辑
}

export function ContactModals({
  showContactModal,
  setShowContactModal,
  showWhatsAppModal,
  setShowWhatsAppModal,
  onWhatsAppClick,
  onEmailClick,
}: ContactModalsProps) {

  // 🌟 核心：Live Chat 呼叫逻辑
  const handleLiveChat = () => {
    const tawk = (window as any).Tawk_API;
    
    if (tawk && typeof tawk.maximize === 'function') {
      try {
        tawk.showWidget(); // 确保组件可见
        tawk.maximize();   // 强制弹出聊天窗口
        setShowContactModal(false); // 关闭当前的 UI 抽屉
      } catch (error) {
        console.error("Tawk.to initialization error:", error);
      }
    } else {
      // 脚本未加载完成时的友好提示
      toast.info("Connecting to our concierge...", {
        description: "Please wait a moment while we establish a secure connection."
      });
    }
  };

  return (
    <>
      {/* 遮罩层 (Backdrop) */}
      {(showContactModal || showWhatsAppModal) && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60] transition-opacity duration-500"
          onClick={() => {
            setShowContactModal(false);
            setShowWhatsAppModal(false);
          }}
        />
      )}

      {/* 1. 主联系方式抽屉 (Contact Us Drawer) */}
      <div className={`fixed inset-y-0 right-0 z-[70] w-full md:w-[500px] bg-white shadow-2xl transform transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        showContactModal ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col p-8 md:p-14">
          <button
            onClick={() => setShowContactModal(false)}
            className="self-end p-2 text-zinc-400 hover:text-black transition-colors"
          >
            <X size={28} strokeWidth={1} />
          </button>

          <div className="mt-12 flex-1 text-black">
            <h2 className="text-[22px] uppercase tracking-[0.4em] text-center mb-20 font-light italic">
              Contact Us
            </h2>

            <div className="space-y-12">
              {/* Call Us - 直接拨号 */}
              <div 
                className="group flex items-start gap-8 cursor-pointer" 
                onClick={() => window.location.href='tel:+17817026596'}
              >
                <Phone size={22} strokeWidth={1} className="text-zinc-400 group-hover:text-black transition-colors mt-1" />
                <div className="border-b border-zinc-100 group-hover:border-black transition-all duration-500 pb-4 flex-1">
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-2">Call Us</h3>
                  <p className="text-base font-light tracking-wide">+1 (781) 702-6596</p>
                </div>
              </div>

              {/* 🌟 Live Chat - 调用 Tawk.to */}
              <div className="group flex items-start gap-8 cursor-pointer" onClick={handleLiveChat}>
                <MessageCircle size={22} strokeWidth={1} className="text-zinc-400 group-hover:text-black transition-colors mt-1" />
                <div className="border-b border-zinc-100 group-hover:border-black transition-all duration-500 pb-4 flex-1">
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-2">Live Chat</h3>
                  <p className="text-base font-light tracking-wide">Real-time Assistance</p>
                </div>
              </div>

              {/* Message Us - 调用 Email 逻辑 */}
              <div className="group flex items-start gap-8 cursor-pointer" onClick={onEmailClick}>
                <Mail size={22} strokeWidth={1} className="text-zinc-400 group-hover:text-black transition-colors mt-1" />
                <div className="border-b border-zinc-100 group-hover:border-black transition-all duration-500 pb-4 flex-1">
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-2">Message Us</h3>
                  <p className="text-base font-light tracking-wide">Official Email Inquiry</p>
                </div>
              </div>

              {/* WhatsApp Concierge - 进入二维码页面 */}
              <div 
                className="group flex items-start gap-8 cursor-pointer" 
                onClick={() => { 
                  setShowContactModal(false); 
                  setShowWhatsAppModal(true); 
                }}
              >
                <MessageCircle size={22} strokeWidth={1} className="text-zinc-400 group-hover:text-black transition-colors mt-1" />
                <div className="border-b border-zinc-100 group-hover:border-black transition-all duration-500 pb-4 flex-1">
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-2">WhatsApp Concierge</h3>
                  <p className="text-base font-light tracking-wide">Instant Assistance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. WhatsApp 二维码抽屉 (QR Drawer) */}
      <div className={`fixed inset-y-0 right-0 z-[70] w-full md:w-[500px] bg-white transform transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        showWhatsAppModal ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col p-8 md:p-14 items-center text-black relative">
          {/* 返回按钮 */}
          <button
            onClick={() => { setShowWhatsAppModal(false); setShowContactModal(true); }}
            className="absolute top-12 left-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-black group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            <span>BACK</span>
          </button>

          <button onClick={() => setShowWhatsAppModal(false)} className="absolute top-10 right-10 text-zinc-400 hover:text-black">
            <X size={28} strokeWidth={1} />
          </button>

          <div className="mt-28 text-center flex flex-col items-center w-full">
            <h2 className="text-xl uppercase tracking-[0.3em] font-light mb-2">WhatsApp</h2>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-12 italic">Direct to our master atelier</p>
            
            <div className="relative w-64 h-64 md:w-80 md:h-80 grayscale hover:grayscale-0 transition-all duration-1000 border border-zinc-100 p-6 mb-16 shadow-inner">
              <Image 
                src="/images/whatsapp-qr.png" 
                alt="WhatsApp QR Code" 
                fill 
                className="object-contain p-4" 
              />
            </div>

            <button
              onClick={() => {
                onWhatsAppClick();
                setShowWhatsAppModal(false);
              }}
              className="w-full py-5 bg-black text-white text-[11px] uppercase tracking-[0.4em] hover:bg-zinc-900 transition-all text-center"
            >
              Start Conversation
            </button>
          </div>
        </div>
      </div>
    </>
  );
}