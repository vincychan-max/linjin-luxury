import React from 'react';
export const metadata = {
  title: "Privacy Policy | Linjin Luxury",
  description:
    "Learn how Linjin Luxury collects, uses, and protects your personal data when you visit our website.",
};
export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 min-h-screen">
      {/* 标题部分 */}
      <header className="text-center mb-20 border-b border-black/5 pb-12">
        <h1 className="text-[14px] tracking-[8px] uppercase font-light text-black">
          Privacy Policy
        </h1>
        <p className="text-[10px] tracking-[2px] text-gray-400 uppercase mt-4">
          Last Updated: March 2026
        </p>
      </header>

      {/* 正文部分 */}
      <div className="space-y-12 text-[13px] leading-[1.8] font-light text-black tracking-wide">
        
        <section>
          <h2 className="text-[11px] tracking-[4px] uppercase font-medium mb-6">1. Introduction</h2>
          <p>
            Welcome to LINJIN LUXURY. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website 
            and tell you about your privacy rights.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] tracking-[4px] uppercase font-medium mb-6">2. Data We Collect</h2>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you, including:
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-600">
            <li>Identity Data (Name, username)</li>
            <li>Contact Data (Email, billing address, delivery address, telephone number)</li>
            <li>Financial Data (Payment card details - processed securely via encrypted gateways)</li>
            <li>Technical Data (IP address, browser type, location)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[11px] tracking-[4px] uppercase font-medium mb-6">3. How We Use Your Data</h2>
          <p>
            We only use your personal data to provide our services to you, including:
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-600">
            <li> Processing and delivering your orders</li>
            <li>Managing your account and VIP services</li>
            <li>Sending you updates regarding our latest collections (only with your consent)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[11px] tracking-[4px] uppercase font-medium mb-6">4. International Transfers</h2>
          <p>
            As an international luxury brand, your personal data may be transferred to and processed in countries outside your place of residence in order to fulfill orders and provide our services.
          </p>
        </section>

        <section>
          <h2 className="text-[11px] tracking-[4px] uppercase font-medium mb-6">5. Your Legal Rights</h2>
          <p>
            Under certain circumstances, you have rights under data protection laws in relation to your personal data, 
            including the right to request access, correction, or erasure of your personal data.
          </p>
        </section>

        <section className="pt-10 border-t border-black/5">
          <h2 className="text-[11px] tracking-[4px] uppercase font-medium mb-6">6. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
            <br />
            <span className="mt-4 block font-medium">linjinluxury@gmail.com</span>
          </p>
        </section>
        
        <section>
          <h2 className="text-[11px] tracking-[4px] uppercase font-medium mb-6">7. Cookies</h2>
          <p>
            Our website may use cookies and similar technologies to enhance your browsing experience and analyze website traffic.
          </p>
        </section>

      </div>
    </div>
  );
}