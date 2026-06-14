export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-3xl mx-auto px-6 py-28">

        {/* HEADER */}
        <header className="mb-20 text-center">
          <h1 className="text-[26px] font-light tracking-[0.3em] uppercase">
            Privacy Policy
          </h1>
          <p className="mt-6 text-[11px] tracking-[0.3em] text-black/40 uppercase">
            Effective: March 2026
          </p>
        </header>

        {/* INTRO CARD */}
        <div className="border border-black/10 p-8 mb-12">
          <p className="text-[13px] leading-[1.9] text-black/70">
            This Privacy Policy explains how LINJIN LUXURY collects and uses personal data when you
            use this website or place an order.
          </p>
        </div>

        {/* SECTION CARDS */}
        <div className="space-y-8">

          <div className="border-l-2 border-black/10 pl-6 py-2">
            <h2 className="text-[11px] tracking-[0.35em] uppercase mb-3 text-black/40">
              Data Collection
            </h2>
            <p className="text-[13px] leading-[1.8] text-black/70">
              We collect information required to process orders, provide customer support, and
              operate the website.
            </p>
          </div>

          <div className="border-l-2 border-black/10 pl-6 py-2">
            <h2 className="text-[11px] tracking-[0.35em] uppercase mb-3 text-black/40">
              Usage of Data
            </h2>
            <p className="text-[13px] leading-[1.8] text-black/70">
              Data is used for order fulfillment, account management, and communication related to
              purchases or service updates.
            </p>
          </div>

          <div className="border-l-2 border-black/10 pl-6 py-2">
            <h2 className="text-[11px] tracking-[0.35em] uppercase mb-3 text-black/40">
              Data Security
            </h2>
            <p className="text-[13px] leading-[1.8] text-black/70">
              We apply reasonable technical and organizational measures to protect personal data.
            </p>
          </div>

          <div className="border-l-2 border-black/10 pl-6 py-2">
            <h2 className="text-[11px] tracking-[0.35em] uppercase mb-3 text-black/40">
              International Processing
            </h2>
            <p className="text-[13px] leading-[1.8] text-black/70">
              Data may be processed in countries outside your location for order fulfillment and
              service operations.
            </p>
          </div>

          <div className="border-l-2 border-black/10 pl-6 py-2">
            <h2 className="text-[11px] tracking-[0.35em] uppercase mb-3 text-black/40">
              Your Rights
            </h2>
            <p className="text-[13px] leading-[1.8] text-black/70">
              You may request access, correction, or deletion of your personal data where applicable.
            </p>
          </div>

        </div>

        {/* CONTACT BLOCK */}
        <div className="mt-20 border-t border-black/10 pt-10 text-center">
          <p className="text-[11px] tracking-[0.3em] uppercase text-black/40 mb-4">
            Contact
          </p>
          <p className="text-[13px] text-black/70">
            info@linjinluxury
          </p>
        </div>

      </div>
    </div>
  );
}