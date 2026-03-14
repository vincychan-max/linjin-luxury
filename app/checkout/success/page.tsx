'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); // PayPal 返回的 token

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-[600px] w-full text-center">
        <div className="inline-block mb-10 relative">
          <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center">
             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <div className="absolute -inset-4 border border-zinc-100 rounded-full animate-ping opacity-20" />
        </div>

        <h1 className="text-3xl uppercase tracking-[15px] font-light text-black mb-6 pl-[15px]">
          Payment Success
        </h1>
        
        <p className="text-[11px] uppercase tracking-[4px] text-zinc-500 mb-12 leading-loose">
          Thank you for your purchase. <br/>
          Your transaction has been completed, and a receipt for your purchase has been emailed to you.
        </p>

        <div className="bg-zinc-50 rounded-[32px] p-8 border border-zinc-100 mb-12 inline-block px-12">
          <p className="text-[9px] uppercase tracking-widest text-zinc-400 mb-2">Transaction ID</p>
          <p className="text-[12px] font-mono text-black font-bold selection:bg-black selection:text-white">
            {token || 'PAY-XXXX-XXXX-XXXX'}
          </p>
        </div>

        <div>
          <Link 
            href="/"
            className="bg-black text-white px-12 py-5 rounded-full text-[10px] uppercase tracking-[5px] font-black hover:bg-zinc-800 transition shadow-2xl inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}