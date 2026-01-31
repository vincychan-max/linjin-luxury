'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from '@/lib/firebase'; // 路径根据你的项目
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  getDocs,
  doc,
  deleteDoc 
} from "firebase/firestore";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        toast.error('Please sign in to view saved items');
        router.push('/auth/signin');
        return;
      }

      const q = query(collection(db, "wishlist"), where("user_id", "==", user.uid));

      // 初始手动加载 + 超时保护
      const loadInitial = async () => {
        try {
          const snapshot = await getDocs(q);
          const items: any[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            items.push({ docId: doc.id, ...data });
          });
          setWishlistItems(items);
          setLoading(false);
          setError(null);
        } catch (err: any) {
          console.error("Initial load error:", err);
          setError(err.message || 'Failed to load');
          setLoading(false);
        }
      };

      loadInitial();

      // 实时监听
      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const items: any[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({ docId: doc.id, ...data });
        });
        setWishlistItems(items);
        setLoading(false);
        setError(null);
      }, (err) => {
        console.error("Realtime error:", err);
        setError(err.message || 'Realtime sync failed');
        setLoading(false);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, [router]);

  // 删除收藏
  const removeItem = async (item: any) => {
    try {
      await deleteDoc(doc(db, "wishlist", item.docId));
      toast.success('Removed from saved items');
    } catch (error) {
      toast.error('Remove failed');
    }
  };

  const retryLoad = () => {
    setLoading(true);
    setError(null);
    window.location.reload(); // 简单重试
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-4xl uppercase tracking-wide">Loading saved items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6">
        <p className="text-3xl uppercase tracking-wide mb-8">{error}</p>
        <button 
          onClick={retryLoad}
          className="bg-black text-white px-16 py-6 text-xl uppercase tracking-wide transition-transform hover:scale-105 drop-shadow-md"
        >
          Retry
        </button>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-white py-32 text-center">
        <h2 className="text-4xl uppercase tracking-wide mb-12">No Saved Items</h2>
        <Link 
          href="/" 
          className="inline-block bg-black text-white px-16 py-6 text-xl uppercase tracking-wide transition-transform hover:scale-105 drop-shadow-md"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-5xl uppercase tracking-wide text-center mb-16">Saved Items</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-16">
          {wishlistItems.map((item) => (
            <div key={item.docId} className="group relative">
              <Link href={`/product/${item.product_id || item.id}`}>
                <div className="relative overflow-hidden rounded-xl shadow-2xl aspect-[3/4]">
                  <Image
                    src={item.image || '/images/placeholder.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    quality={95}
                  />
                </div>
                <div className="mt-8 text-center">
                  <p className="text-2xl font-thin tracking-wide">{item.name}</p>
                  <p className="mt-4 text-xl">${item.price}</p>
                  <p className="mt-2 text-lg opacity-70">Color: {item.color} • Size: {item.size}</p>
                </div>
              </Link>

              <button 
                onClick={() => removeItem(item)}
                className="absolute top-4 right-4 bg-white/80 text-black px-6 py-2 rounded-full text-sm uppercase tracking-wide opacity-0 group-hover:opacity-100 transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}