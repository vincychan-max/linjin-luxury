'use client';

import { useState } from 'react';
import Image from 'next/image';

// Tawk.to 类型声明（修复 TypeScript window.Tawk_API 类型错误）
declare global {
  interface Window {
    Tawk_API?: any;
  }
}

export default function ContactPage() {
  const [isWhatsAppDrawerOpen, setIsWhatsAppDrawerOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-white text-black py-24 sm:py-40 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto">

          {/* 主标题 & 介绍文字 */}
          <div className="text-center mb-16 sm:mb-20">
            <h1 className="text-5xl sm:text-6xl md:text-8xl uppercase tracking-widest mb-6 sm:mb-8">
              Contact Us
            </h1>
            <p className="text-xl sm:text-2xl tracking-wider px-4">
              Choose your preferred method of contact and connect with a Client Advisor.
            </p>
          </div>

          {/* 统一营业时间提示 */}
          <p className="text-center text-lg sm:text-xl text-gray-700 mb-16 sm:mb-20 italic leading-relaxed px-6">
            Available Monday – Saturday: 10 AM – 10 PM (EST)<br className="sm:hidden" />
            Sunday: 10 AM – 9 PM (EST)
          </p>

          <hr className="border-t border-gray-300 my-24 sm:my-32" />

          {/* 四个联系方式：两行两列 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 sm:gap-20 lg:gap-24 mb-20 max-w-5xl mx-auto">
            {/* Call Us */}
            <section className="text-center flex flex-col items-center justify-center min-h-[320px] sm:min-h-[360px]">
              <h2 className="text-4xl sm:text-5xl uppercase tracking-widest mb-10 sm:mb-12">Call Us</h2>
              <p className="text-3xl sm:text-4xl flex items-center justify-center gap-6 sm:gap-8">
                <span className="text-5xl sm:text-5xl">☎</span>
                <a href="tel:+17817026596" className="underline hover:text-gray-600 transition">
                  +1 (781) 702-6596
                </a>
              </p>
            </section>

            {/* Live Chat */}
            <section className="text-center flex flex-col items-center justify-center min-h-[320px] sm:min-h-[360px]">
              <h2 className="text-4xl sm:text-5xl uppercase tracking-widest mb-10 sm:mb-12">Live Chat</h2>
              <button
                onClick={() => {
                  if (window.Tawk_API) {
                    window.Tawk_API.showWidget();
                    window.Tawk_API.maximize();
                  }
                }}
                className="text-3xl sm:text-4xl flex items-center justify-center gap-6 sm:gap-8 hover:text-gray-600 transition touch-manipulation"
              >
                <span className="text-yellow-500 text-5xl sm:text-5xl">●</span> Start Live Chat
              </button>
            </section>

            {/* WhatsApp */}
            <section className="text-center flex flex-col items-center justify-center min-h-[320px] sm:min-h-[360px]">
              <h2 className="text-4xl sm:text-5xl uppercase tracking-widest mb-10 sm:mb-12">WhatsApp</h2>
              <button
                onClick={() => setIsWhatsAppDrawerOpen(true)}
                className="text-3xl sm:text-4xl flex items-center justify-center gap-6 sm:gap-8 hover:text-gray-600 transition cursor-pointer touch-manipulation"
              >
                <span className="text-5xl sm:text-5xl">✉</span> Message Us on WhatsApp
              </button>
              <p className="text-base sm:text-lg text-gray-600 mt-6">
                Click to view QR code or open WhatsApp
              </p>
            </section>

            {/* Send an Email */}
            <section className="text-center flex flex-col items-center justify-center min-h-[320px] sm:min-h-[360px]">
              <h2 className="text-4xl sm:text-5xl uppercase tracking-widest mb-10 sm:mb-12">Send an Email</h2>
              <p className="text-3xl sm:text-4xl flex items-center justify-center gap-6 sm:gap-8">
                <span className="text-5xl sm:text-5xl">✉</span>
                <a 
                  href="mailto:contact@linjinluxury.com" 
                  className="underline hover:text-gray-600 transition"
                >
                  linjinbag@gmail.com
                </a>
              </p>
              <p className="text-base sm:text-lg text-gray-600 mt-6">
                Click to compose your message
              </p>
            </section>
          </div>

          <hr className="border-t border-gray-300 my-24 sm:my-32" />

          {/* Client Services FAQ */}
          <section className="mb-20">
            <h2 className="text-5xl uppercase tracking-widest text-center mb-16">
              Client Services FAQ
            </h2>
            <div className="max-w-4xl mx-auto space-y-12 text-xl leading-relaxed text-gray-700">
              <details className="group cursor-pointer">
                <summary className="font-medium text-black text-2xl flex justify-between items-center after:content-['+'] after:text-3xl after:ml-4 group-open:after:content-['−']">
                  How should I care for my luxury handbag?
                </summary>
                <p className="mt-6">Store in the original dust bag, avoid direct sunlight and humidity, and use a professional leather conditioner periodically. We recommend consulting brand-specific care guidelines included with your purchase.</p>
              </details>

              <details className="group cursor-pointer">
                <summary className="font-medium text-black text-2xl flex justify-between items-center after:content-['+'] after:text-3xl after:ml-4 group-open:after:content-['−']">
                  Do you offer repair or maintenance services?
                </summary>
                <p className="mt-6">Yes. We partner with authorized brand repair centers for professional servicing. Contact a Client Advisor for assessment and guidance.</p>
              </details>

              <details className="group cursor-pointer">
                <summary className="font-medium text-black text-2xl flex justify-between items-center after:content-['+'] after:text-3xl after:ml-4 group-open:after:content-['−']">
                  Can I request gift wrapping or personalized notes?
                </summary>
                <p className="mt-6">Complimentary luxury gift wrapping and handwritten notes are available upon request at checkout.</p>
              </details>

              <details className="group cursor-pointer">
                <summary className="font-medium text-black text-2xl flex justify-between items-center after:content-['+'] after:text-3xl after:ml-4 group-open:after:content-['−']">
                  Do you provide styling or personalization advice?
                </summary>
                <p className="mt-6">Our Client Advisors offer complimentary styling consultations and can guide you on limited customization options available from select brands.</p>
              </details>

              <details className="group cursor-pointer">
                <summary className="font-medium text-black text-2xl flex justify-between items-center after:content-['+'] after:text-3xl after:ml-4 group-open:after:content-['−']">
                  How does in-store appointment work?
                </summary>
                <p className="mt-6">Contact a Client Advisor to schedule a private viewing in Los Angeles. Enjoy personalized service and priority access to our collection.</p>
              </details>
            </div>
          </section>

        </div>
      </div>

      {/* WhatsApp 右抽屉 */}
      {isWhatsAppDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsWhatsAppDrawerOpen(false)} />
          <div className="fixed inset-0 md:right-0 md:inset-auto md:w-full md:max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300">
            <div className="p-8 md:p-12 text-center h-full flex flex-col justify-center">
              <button onClick={() => setIsWhatsAppDrawerOpen(false)} className="absolute top-6 right-6 text-4xl hover:text-black transition">
                ×
              </button>
              <h3 className="text-3xl md:text-4xl uppercase tracking-widest mb-10 md:mb-12">WhatsApp</h3>
              <p className="text-xl md:text-2xl mb-10 md:mb-12">Scan QR Code or Click Below</p>
              <div className="mx-auto w-72 h-72 md:w-80 md:h-80 mb-10 md:mb-12">
                <Image src="/images/whatsapp-qr.png" alt="WhatsApp QR Code" width={320} height={320} className="mx-auto" />
              </div>
              <a href="https://wa.me/17817026596?text=Hello%20Linjin%20Luxury!%20I%20am%20interested%20in%20authentic%20new%20luxury%20handbags" target="_blank" rel="noopener noreferrer" className="text-xl md:text-2xl underline uppercase tracking-widest hover:text-gray-600 transition block mb-8">
                Open WhatsApp Web
              </a>
              <p className="text-base md:text-lg text-gray-600">
                Available Monday – Saturday: 10 AM – 10 PM (EST)<br />
                Sunday: 10 AM – 9 PM (EST)
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}