import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Methods | LINJIN LUXURY',
};

export default function PaymentPage() {
  const methods = [
    { name: "Credit & Debit Cards", desc: "We accept Visa, Mastercard, and American Express." },
    { name: "Digital Wallets", desc: "Express checkout via Apple Pay, Google Pay, and PayPal." },
    { name: "Local Payments", desc: "Region-specific options available for Singapore and Thailand." }
  ];

  return (
    <main className="bg-white text-stone-900 min-h-screen pt-40 pb-32 px-6">
      <div className="max-w-3xl mx-auto font-light leading-relaxed">
        <h1 className="text-3xl font-serif italic mb-16 tracking-wide">Payment & Security</h1>
        
        <div className="space-y-16">
          <section className="opacity-80 text-sm">
            <p className="mb-8">Linjin Luxury ensures a seamless and secure shopping experience. All transactions are encrypted and processed through industry-leading secure gateways.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
              {methods.map((item) => (
                <div key={item.name} className="border-l border-stone-200 pl-6">
                  <h3 className="text-[11px] uppercase tracking-widest font-bold mb-2">{item.name}</h3>
                  <p className="text-[12px] opacity-70 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-stone-50 p-10 text-center">
            <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold mb-6">Secure Transactions</h2>
            <p className="text-xs opacity-60 max-w-md mx-auto leading-relaxed">
              Your personal billing information is never stored on our servers. We use PCI-DSS compliant technology to ensure your data remains private and protected at every step of the journey.
            </p>
          </section>

          <section className="text-sm opacity-80">
            <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold mb-4">Currency & Duties</h2>
            <p>Prices are displayed in USD by default. For international orders, duties and taxes may be calculated at checkout depending on your destination to ensure no hidden costs upon delivery.</p>
          </section>
        </div>
      </div>
    </main>
  );
}