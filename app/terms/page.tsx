import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | LINJIN LUXURY',
};

export default function TermsPage() {
  return (
    <main className="bg-white text-stone-900 min-h-screen pt-40 pb-32 px-6">
      <div className="max-w-3xl mx-auto font-light leading-relaxed">
        <h1 className="text-3xl font-serif italic mb-16 tracking-wide">Terms of Service</h1>
        
        <div className="space-y-12 text-sm opacity-80">
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold mb-4 opacity-100">1. Overview</h2>
            <p>Welcome to Linjin Luxury. Throughout the site, the terms “we”, “us” and “our” refer to Linjin Luxury (LJL). By visiting our site and purchasing something from us, you engage in our “Service” and agree to be bound by the following terms and conditions.</p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold mb-4 opacity-100">2. Intellectual Property</h2>
            <p>All content included on this site, such as text, graphics, logos, images, and software, is the property of Linjin Luxury and protected by international copyright laws. The "LJL" mark is a registered trademark and may not be used without prior written consent.</p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold mb-4 opacity-100">3. Product Excellence & Representation</h2>
            <p>We make every effort to display as accurately as possible the colors and images of our products. However, due to the nature of genuine leather and individual monitor settings, slight variations may occur. This is a testament to the organic origin of our materials.</p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold mb-4 opacity-100">4. Orders & Pricing</h2>
            <p>We reserve the right to refuse any order you place with us. Prices for our products are subject to change without notice. We shall not be liable to you or to any third-party for any modification, price change, or discontinuance of the Service.</p>
          </section>

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold mb-4 opacity-100">5. Governing Law</h2>
            <p>These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of our operating jurisdictions in Singapore and Thailand.</p>
          </section>
        </div>
      </div>
    </main>
  );
}