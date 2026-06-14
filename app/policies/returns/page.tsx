export default function ReturnsPolicy() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-3xl mx-auto px-6 py-28">

        {/* HEADER */}
        <header className="text-center mb-20">
          <h1 className="text-[24px] font-light tracking-[0.3em] uppercase">
            Returns & Exchanges
          </h1>
          <p className="mt-6 text-[11px] tracking-[0.3em] text-black/40 uppercase">
            Policy Overview
          </p>
        </header>

        {/* SECTION 1 */}
        <section className="mb-14 border-l border-black/10 pl-6">
          <h2 className="text-[11px] tracking-[0.35em] uppercase text-black/40 mb-4">
            Return Eligibility
          </h2>
          <p className="text-[13px] leading-[1.9] text-black/70">
            Returns may be requested within 7 days of delivery. Items must be unused, in original condition,
            and returned with original packaging.
          </p>
        </section>

        {/* SECTION 2 */}
        <section className="mb-14 border-l border-black/10 pl-6">
          <h2 className="text-[11px] tracking-[0.35em] uppercase text-black/40 mb-4">
            Return Shipping
          </h2>
          <p className="text-[13px] leading-[1.9] text-black/70">
            Return shipping costs and any applicable import duties are the responsibility of the customer,
            unless the return is due to a verified product defect or shipping error.
          </p>
        </section>

        {/* SECTION 3 */}
        <section className="mb-14 border-l border-black/10 pl-6">
          <h2 className="text-[11px] tracking-[0.35em] uppercase text-black/40 mb-4">
            Product Condition Issues
          </h2>
          <p className="text-[13px] leading-[1.9] text-black/70">
            If an item is received defective or incorrect, return shipping will be covered after verification.
          </p>
        </section>

        {/* SECTION 4 */}
        <section className="mb-14 border-l border-black/10 pl-6">
          <h2 className="text-[11px] tracking-[0.35em] uppercase text-black/40 mb-4">
            Non-Returnable Items
          </h2>
          <p className="text-[13px] leading-[1.9] text-black/70">
            Customized or personalized items are final sale and are not eligible for return or exchange.
          </p>
        </section>

        {/* SECTION 5 */}
        <section className="mb-14 border-l border-black/10 pl-6">
          <h2 className="text-[11px] tracking-[0.35em] uppercase text-black/40 mb-4">
            Refund Processing
          </h2>
          <p className="text-[13px] leading-[1.9] text-black/70">
            Approved refunds are issued to the original payment method within 7–10 business days.
            Shipping fees are non-refundable.
          </p>
        </section>

        {/* CONTACT */}
        <section className="mt-20 border-t border-black/10 pt-10 text-center">
          <p className="text-[11px] tracking-[0.3em] uppercase text-black/40 mb-3">
            Contact
          </p>
          <p className="text-[13px] text-black/70">
            info@linjinluxury
          </p>
        </section>

      </div>
    </div>
  );
}