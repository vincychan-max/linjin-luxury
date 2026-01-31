// app/product/[id]/components/ContactModals.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ContactModalsProps {
  showContactModal: boolean;
  setShowContactModal: (value: boolean) => void;
  showWhatsAppModal: boolean;
  setShowWhatsAppModal: (value: boolean) => void;
}

export default function ContactModals({
  showContactModal,
  setShowContactModal,
  showWhatsAppModal,
  setShowWhatsAppModal,
}: ContactModalsProps) {
  return (
    <>
      {/* 主 Contact Us 模态 */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setShowContactModal(false)}>
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl p-12 relative overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* × 关闭按钮 */}
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-6 right-6 text-4xl text-gray-500 hover:text-black transition"
            >
              ×
            </button>

            <h2 className="text-4xl uppercase tracking-widest text-center mb-20">Contact Us</h2>

            {/* Call Us */}
            <div className="space-y-4 mb-12">
              <div className="text-2xl flex items-center gap-4">
                <span className="text-3xl">☎</span> 
                <a href="tel:+17817026596" className="!text-black underline transition visited:!text-black">
                  Call Us +1 (781) 702-6596
                </a>
              </div>
              <p className="text-xl pl-12">
                Monday - Saturday from 10 AM to 10 PM (EST).<br />
                Sunday from 10 AM to 9 PM (EST).
              </p>
            </div>

            {/* Live Chat */}
            <div className="space-y-4 mb-12">
              <div className="text-2xl flex items-center gap-4">
                <span className="text-yellow-500 text-3xl">●</span> 
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as any).Tawk_API) {
                      (window as any).Tawk_API.showWidget();
                      (window as any).Tawk_API.maximize();
                    }
                    setShowContactModal(false);
                  }}
                  className="underline transition"
                >
                  Live Chat
                </button>
              </div>
              <p className="text-xl pl-12">
                Monday - Saturday from 10 AM to 10 PM (EST).<br />
                Sunday from 10 AM to 9 PM (EST).
              </p>
            </div>

            {/* Message Us → 切换到 WhatsApp 模态 */}
            <div className="space-y-4 mb-12">
              <div className="text-2xl flex items-center gap-4">
                <span className="text-3xl">✉</span> 
                <button
                  onClick={() => {
                    setShowContactModal(false);
                    setShowWhatsAppModal(true);
                  }}
                  className="underline transition"
                >
                  Message Us
                </button>
              </div>
              <p className="text-xl pl-12">
                Monday - Saturday from 10 AM to 10 PM (EST).<br />
                Sunday from 10 AM to 9 PM (EST).
              </p>
            </div>

            {/* 底部链接 */}
            <div className="text-center space-y-8 pb-12">
              <p className="text-3xl uppercase tracking-widest">Do you need further assistance?</p>
              <Link
                href="/contact"
                className="!text-black text-2xl underline uppercase tracking-widest block transition visited:!text-black"
              >
                Get in Contact with Us
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp 模态 */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 md:p-6" onClick={() => setShowWhatsAppModal(false)}>
          <div className="bg-white w-full max-w-lg md:max-w-xl rounded-2xl shadow-2xl p-8 md:p-12 relative text-center" onClick={(e) => e.stopPropagation()}>
            {/* × 关闭 */}
            <button
              onClick={() => setShowWhatsAppModal(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-3xl md:text-4xl text-gray-500 hover:text-black transition"
            >
              ×
            </button>

            {/* BACK 按钮 → 返回主模态 */}
            <button
              onClick={() => {
                setShowWhatsAppModal(false);
                setShowContactModal(true);
              }}
              className="absolute top-4 left-4 md:top-6 md:left-6 text-lg md:text-xl uppercase tracking-widest transition flex items-center gap-2"
            >
              <span className="text-2xl md:text-3xl">←</span> BACK
            </button>

            <h2 className="text-3xl md:text-4xl uppercase tracking-widest mb-8 md:mb-12">Connect to WhatsApp</h2>
            <p className="text-lg md:text-xl mb-8 md:mb-12 px-4">
              Scan the QR code with your smartphone to connect with our Client Service by mobile
            </p>

            <div className="mx-auto mb-8 md:mb-12 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
              <Image
                src="/images/whatsapp-qr.png"
                alt="WhatsApp QR Code"
                width={400}
                height={400}
                className="w-full h-full object-contain"
              />
            </div>

            <a
              href="https://wa.me/17817026596?text=Hello%20Linjin%20Luxury!%20I%20am%20interested%20in%20authentic%20new%20premium%20luxury%20handbags%20in%20Los%20Angeles"
              target="_blank"
              rel="noopener noreferrer"
              className="!text-black text-xl md:text-2xl underline uppercase tracking-widest transition visited:!text-black"
            >
              Click below to access WhatsApp Web
            </a>
          </div>
        </div>
      )}
    </>
  );
}