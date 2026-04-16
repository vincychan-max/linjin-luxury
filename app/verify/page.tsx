'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    const res = await fetch(`/api/verify?code=${code}`);
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <main className="pt-40 pb-20 px-6 bg-white min-h-screen flex flex-col items-center">
      <div className="max-w-md w-full text-center">
        <h1 className="text-[14px] font-bold tracking-[0.7em] uppercase mb-12">
          Authenticity Verification
        </h1>

        <div className="space-y-6">
          <input
            type="text"
            placeholder="ENTER SERIAL NUMBER"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full border-b border-black py-4 text-center text-[12px] tracking-[0.3em] outline-none placeholder:text-black/20"
          />
          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-black text-white py-4 text-[11px] tracking-[0.5em] uppercase hover:bg-zinc-800 transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify Product'}
          </button>
        </div>

        {/* 结果展示 */}
        <div className="mt-20">
          {result?.verified && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <p className="text-[#d4af37] text-[10px] tracking-[0.5em] uppercase mb-8">
                ✓ Confirmed Authentic
              </p>
              <div className="relative aspect-square w-40 mx-auto mb-6 bg-zinc-50">
                <Image 
                  src={result.product.images[0].url} 
                  alt="Verified product" 
                  fill 
                  className="object-contain p-4"
                />
              </div>
              <h2 className="text-[13px] font-bold uppercase tracking-widest mb-2">
                {result.product.name}
              </h2>
              <p className="text-[10px] text-black/40 uppercase tracking-widest">
                Crafted: {new Date(result.product.productionDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {result?.verified === false && (
            <p className="text-red-500 text-[10px] tracking-[0.3em] uppercase">
              Invalid serial number. Please contact concierge.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}