'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, Phone, MessageCircle, Mail, ArrowLeft } from 'lucide-react';

interface ContactModalsProps {
  showContactModal: boolean;
  setShowContactModal: (value: boolean) => void;
  showWhatsAppModal: boolean;
  setShowWhatsAppModal: (value: boolean) => void;
}

export function ContactModals({
  showContactModal,
  setShowContactModal,
  showWhatsAppModal,
  setShowWhatsAppModal,
}: ContactModalsProps) {
  return (
    <>
      {/* 背景遮罩 - 统一管理 */}
      {(showContactModal || showWhatsAppModal) && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[60] transition-opacity duration-500"
          onClick={() => {
            setShowContactModal(false);
            setShowWhatsAppModal(false);
          }}
        />
      )}

      {/* 主 Contact Us 抽屉 */}
      <div className={`fixed inset-y-0 right-0 z-[70] w-full md:w-[500px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.05)] transform transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        showContactModal ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col p-8 md:p-14">
          <button
            onClick={() => setShowContactModal(false)}
            className="self-end p-2 text-zinc-400 hover:text-black transition-all duration-300"
          >
            <X size={28} strokeWidth={1} />
          </button>

          <div className="mt-12 flex-1 text-black">
            <h2 className="text-[22px] uppercase tracking-[0.4em] text-center mb-20 font-light italic !text-black">
              Contact Us
            </h2>

            <div className="space-y-14">
              {/* Call Us */}
              <div className="group flex items-start gap-8 cursor-pointer" onClick={() => window.location.href='tel:+17817026596'}>
                <Phone size={22} strokeWidth={1} className="text-zinc-400 group-hover:text-black transition-colors mt-1" />
                <div className="border-b border-zinc-100 group-hover:border-black transition-all duration-500 pb-4 flex-1">
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-2 !text-black">Call Us</h3>
                  <p className="text-base font-light tracking-wide !text-black">+1 (781) 702-6596</p>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 mt-2 font-light">Available Mon - Sun</p>
                </div>
              </div>

              {/* Live Chat */}
              <div className="group flex items-start gap-8 cursor-pointer" 
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).Tawk_API) {
                    (window as any).Tawk_API.showWidget();
                    (window as any).Tawk_API.maximize();
                  }
                  setShowContactModal(false);
                }}>
                <MessageCircle size={22} strokeWidth={1} className="text-zinc-400 group-hover:text-black transition-colors mt-1" />
                <div className="border-b border-zinc-100 group-hover:border-black transition-all duration-500 pb-4 flex-1">
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-2 !text-black">Live Chat</h3>
                  <p className="text-base font-light tracking-wide !text-black">Real-time Assistance</p>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 mt-2 font-light">Chat with a client advisor</p>
                </div>
              </div>

              {/* Message Us - 点击打开二维码页面 */}
              <div className="group flex items-start gap-8 cursor-pointer" onClick={() => { setShowContactModal(false); setShowWhatsAppModal(true); }}>
                <Mail size={22} strokeWidth={1} className="text-zinc-400 group-hover:text-black transition-colors mt-1" />
                <div className="border-b border-zinc-100 group-hover:border-black transition-all duration-500 pb-4 flex-1">
                  <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-2 !text-black">Message Us</h3>
                  <p className="text-base font-light tracking-wide !text-black">Inquiry via WhatsApp</p>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 mt-2 font-light">Instant support & details</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 text-center text-black">
            <Link
              href="/contact"
              className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 hover:text-black transition-colors underline underline-offset-[12px] decoration-zinc-200 hover:decoration-black"
            >
              Explore Customer Service Page
            </Link>
          </div>
        </div>
      </div>

      {/* WhatsApp 抽屉 (二维码页面) */}
      <div className={`fixed inset-y-0 right-0 z-[70] w-full md:w-[500px] bg-white transform transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        showWhatsAppModal ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col p-8 md:p-14 items-center text-black relative">
          
          {/* 🚀 关键：增加返回按钮 */}
          <button
            onClick={() => { 
              setShowWhatsAppModal(false); 
              setShowContactModal(true); 
            }}
            className="absolute top-12 left-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            <span>BACK</span>
          </button>

          {/* 右上角关闭按钮 */}
          <button
            onClick={() => setShowWhatsAppModal(false)}
            className="absolute top-10 right-10 text-zinc-400 hover:text-black transition-all duration-300"
          >
            <X size={28} strokeWidth={1} />
          </button>

          <div className="mt-28 text-center flex flex-col items-center">
            <h2 className="text-xl uppercase tracking-[0.3em] font-light mb-2 !text-black">WhatsApp</h2>
            <p className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase mb-16 font-light">Connect to our service</p>
            
            {/* 二维码区域 */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 grayscale hover:grayscale-0 transition-all duration-1000 border border-zinc-50 p-6 mb-16 shadow-sm">
              <Image
                src="/images/whatsapp-qr.png"
                alt="WhatsApp QR Code"
                fill
                className="object-contain p-4"
              />
            </div>

            <a
              href="https://wa.me/17817026596?text=Hello%20Linjin%20Luxury!"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-5 bg-black text-white text-[11px] uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all duration-300 text-center"
            >
              Start Conversation
            </a>
          </div>
        </div>
      </div>
    </>
  );
}