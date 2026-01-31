// components/Footer.tsx
"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage('Thank you! You’ve been subscribed.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <footer className="bg-black text-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          {/* 列1: LIN替IN LUXURY 文字 + Services */}
          <div className="flex flex-col">
            <div className="mb-10">
              <Link href="/">
                <h2 className="text-3xl font-light tracking-widest uppercase opacity-90 hover:opacity-100 transition">
                  LINJIN LUXURY
                </h2>
              </Link>
            </div>

            <nav aria-label="Services navigation">
              <h3 className="text-lg uppercase tracking-widest mb-8 opacity-80">Services</h3>
              <ul className="space-y-4 text-base opacity-70">
                <li><Link href="/faq" className="hover:opacity-100 transition">FAQ</Link></li>
                <li><Link href="/services/authenticity" className="hover:opacity-100 transition">Authenticity Verification</Link></li>
                <li><Link href="/contact" className="hover:opacity-100 transition">Contact Us</Link></li>
                <li><Link href="/shipping" className="hover:opacity-100 transition">Shipping & Returns</Link></li>
                <li><Link href="/care" className="hover:opacity-100 transition">Product Care</Link></li>
              </ul>
            </nav>
          </div>

          {/* 列2: Collection */}
          <nav aria-label="Collection navigation">
            <h3 className="text-lg uppercase tracking-widest mb-8 opacity-80">Collection</h3>
            <ul className="space-y-4 text-base opacity-70">
              <li><Link href="/collection?category=shoulder" className="hover:opacity-100 transition">Shoulder Bags</Link></li>
              <li><Link href="/collection?category=tote" className="hover:opacity-100 transition">Tote Bags</Link></li>
              <li><Link href="/collection?category=clutch" className="hover:opacity-100 transition">Clutch Bags</Link></li>
              <li><Link href="/collection?category=crossbody" className="hover:opacity-100 transition">Crossbody Bags</Link></li>
              <li><Link href="/collection" className="hover 
opacity-100 transition">View All</Link></li>
            </ul>
          </nav>

          {/* 列3: About */}
          <nav aria-label="About Linjin Luxury navigation">
            <h3 className="text-lg uppercase tracking-widest mb-8 opacity-80">About Linjin Luxury</h3>
            <ul className="space-y-4 text-base opacity-70">
              <li><Link href="/about" className="hover:opacity-100 transition">Our Story</Link></li>
              <li><Link href="/sustainability" className="hover:opacity-100 transition">Sustainability</Link></li>
              <li><Link href="/careers" className="hover:opacity-100 transition">Careers</Link></li>
              <li><Link href="/press" className="hover:opacity-100 transition">Press</Link></li>
            </ul>
          </nav>

          {/* 列4: Newsletter + Social Icons */}
          <div>
            <h3 className="text-lg uppercase tracking-widest mb-8 opacity-80">Stay Exclusive</h3>
            <p className="text-base opacity-70 mb-12">
              Unlock early access to new arrivals, private offers, and exclusive pieces reserved for subscribers.
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-12 mb-6 sm:flex-row sm:gap-32 sm:items-center"
              aria-label="Newsletter subscription"
              noValidate
            >
              <input
                id="newsletter-email"
                type="email"
                placeholder="* Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full sm:w-96 px-8 py-3.5 bg-transparent border border-white/50 text-white text-lg rounded-2xl placeholder:text-white/50 focus:outline-none focus:border-white focus:bg-white/5 transition-all disabled:opacity-70"
                required
                disabled={status === 'loading' || status === 'success'}
              />

              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="w-full sm:w-auto px-12 py-3.5 bg-white text-black uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition font-semibold text-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed' : 'Subscribe'}
              </button>
            </form>

            <div className="min-h-[2.5rem] mb-2">
              <p className={`text-base transition-all duration-300 ease-in-out ${
                status === 'success' ? 'text-green-400 opacity-100' : 
                status === 'error' ? 'text-red-400 opacity-100' : 'opacity-0'
              }`}>
                {message || '\u00A0'}
              </p>
            </div>

            <div className="flex space-x-10 mt-0" aria-label="Social media links">
              <Link href="https://instagram.com/linjinluxury" aria-label="Instagram" className="text-pink-500 hover:scale-110 transition">
                <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.148 3.225-1.663 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.148-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.148-3.227 1.663-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.059 1.689.073 4.948.073 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" clipRule="evenodd" />
                </svg>
              </Link>

              <Link href="https://x.com/linjinluxury" aria-label="X" className="text-white hover:scale-110 transition">
                <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.5 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l9.967 15.393z" />
                </svg>
              </Link>

              <Link href="https://tiktok.com/@linjinluxury" aria-label="TikTok" className="text-pink-500 hover:scale-110 transition">
                <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.58 4.55a5.5 5.5 0 0 1-3.04-1.02c-.2-.02-.4-.03-.6-.03h-4v13.08c0 1.54-1.24 2.79-2.77 2.79-1.53 0-2.77-1.25-2.77-2.79 0-1.54 1.24-2.79 2.77-2.79.5 0 .96.13 1.37.35V9.88a6.52 6.52 0 0 0-1.37-.15c-3.6 0-6.53 2.93-6.53 6.53 0 3.6 2.93 6.53 6.53 6.53 3.6 0 6.53-2.93 6.53-6.53V12.2a9.95 9.95 0 0 0 5.82 1.82V9.98a5.5 5.5 0 0 1-1.94-.43z"/>
                </svg>
              </Link>

              <Link href="https://youtube.com/@linjinluxury" aria-label="YouTube" className="text-red-600 hover:scale-110 transition">
                <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.5 6.19a3.05 3.05 0 0 0-2.14-2.15C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.36.54a3.05 3.05 0 0 0-2.14 2.15c-.54 1.82-.54 5.62-.54 5.62s0 3.8.54 5.62a3.05 3.05 0 0 0 2.14 2.15c1.82.54 9.36.54 9.36.54s7.54 0 9.36-.54a3.05 3.05 0 0 0 2.14-2.15c.54-1.82.54-5.62.54-5.62s0-3.8-.54-5.62zM9.75 15.02V8.98l6 3.01-6 3.03z"/>
                </svg>
              </Link>

              <Link href="https://facebook.com/linjinluxury" aria-label="Facebook" className="text-blue-600 hover:scale-110 transition">
                <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* 版权 */}
        <div className="border-t border-gray-800 pt-12 text-center text-sm opacity-70">
          <p>© {new Date().getFullYear()} Linjin Luxury. All rights reserved. Los Angeles, California.</p>
        </div>
      </div>
    </footer>
  );
}