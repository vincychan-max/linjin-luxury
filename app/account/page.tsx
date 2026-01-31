'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function AccountPage() {
  const router = useRouter();
  const auth = getAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        toast.error('Please sign in to view your account');
        router.push('/auth/signin');
        return;
      }

      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-4xl uppercase tracking-widest">Loading account...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 md:py-24">
      <div className="w-full px-6 md:px-16 lg:px-24">
        <h1 className="text-5xl uppercase tracking-widest text-center mb-8">
          My Account
        </h1>
        <p className="text-2xl text-center opacity-80 mb-16">
          Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'Linjin Guest'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* My Orders */}
          <Link 
            href="/my-orders" 
            className="bg-white p-16 rounded-2xl shadow-lg hover:shadow-2xl transition-transform hover:scale-105 flex flex-col items-center text-center group"
          >
            <div className="text-8xl mb-8 opacity-70 group-hover:opacity-100 transition">
              📦
            </div>
            <h2 className="text-3xl md:text-4xl uppercase tracking-widest">
              My Orders
            </h2>
            <p className="text-xl opacity-70 mt-4">View order history and tracking</p>
          </Link>

          {/* My Bag (Cart) */}
          <Link 
            href="/cart" 
            className="bg-white p-16 rounded-2xl shadow-lg hover:shadow-2xl transition-transform hover:scale-105 flex flex-col items-center text-center group"
          >
            <div className="text-8xl mb-8 opacity-70 group-hover:opacity-100 transition">
              🛍️
            </div>
            <h2 className="text-3xl md:text-4xl uppercase tracking-widest">
              My Bag
            </h2>
            <p className="text-xl opacity-70 mt-4">Review items in your bag</p>
          </Link>

          {/* Wishlist */}
          <Link 
            href="/wishlist" 
            className="bg-white p-16 rounded-2xl shadow-lg hover:shadow-2xl transition-transform hover:scale-105 flex flex-col items-center text-center group"
          >
            <div className="text-8xl mb-8 opacity-70 group-hover:opacity-100 transition">
              ❤️
            </div>
            <h2 className="text-3xl md:text-4xl uppercase tracking-widest">
              Wishlist
            </h2>
            <p className="text-xl opacity-70 mt-4">Your saved favorites</p>
          </Link>

          {/* Account Settings（这就是新增的链接！） */}
          <Link 
            href="/account-settings" 
            className="bg-white p-16 rounded-2xl shadow-lg hover:shadow-2xl transition-transform hover:scale-105 flex flex-col items-center text-center group"
          >
            <div className="text-8xl mb-8 opacity-70 group-hover:opacity-100 transition">
              ⚙️
            </div>
            <h2 className="text-3xl md:text-4xl uppercase tracking-widest">
              Account Settings
            </h2>
            <p className="text-xl opacity-70 mt-4">Manage profile and shipping address</p>
          </Link>
        </div>

        <div className="text-center mt-24">
          <Link 
            href="/" 
            className="text-xl uppercase tracking-widest opacity-70 hover:opacity-100 transition"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}