'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuth } from "firebase/auth";
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function MyOrdersPage() {
  const router = useRouter();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth/signin');
      return;
    }

    const q = query(collection(db, "orders"), where("user_id", "==", currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setOrders(list.sort((a, b) => b.created_at.toDate() - a.created_at.toDate()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, router]);

  // 状态颜色
  const getStatusColor = (status: string = 'processing') => {
    switch (status.toLowerCase()) {
      case 'processing': return 'text-orange-600';
      case 'shipped': return 'text-blue-600';
      case 'delivered': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // 新增：自动识别物流公司并生成跟踪链接
  const getTrackingLink = (trackingNumber: string) => {
    if (!trackingNumber) return null;

    const num = trackingNumber.trim();

    // USPS: 通常 22 位数字，或以 94/95/92 开头
    if (num.length === 22 || /^9[245]/.test(num)) {
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${num}`;
    }

    // UPS: 常以 1Z 开头，18 位
    if (/^1Z/i.test(num) && num.length === 18) {
      return `https://www.ups.com/track?loc=en_US&tracknum=${num}`;
    }

    // FedEx: 以 1Z 开头，或 12/15/20/22 位数字
    if (/^1Z/i.test(num) || [12, 15, 20, 22].includes(num.length)) {
      return `https://www.fedex.com/fedextrack/?trknbr=${num}`;
    }

    // 默认 fallback FedEx
    return `https://www.fedex.com/fedextrack/?trknbr=${num}`;
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-2xl">Loading orders...</div>;

  if (orders.length === 0) {
    return <div className="min-h-screen bg-white text-center py-32">
      <h2 className="text-4xl uppercase tracking-widest mb-12">No Orders Yet</h2>
      <Link href="/" className="text-xl uppercase tracking-widest">Start Shopping</Link>
    </div>;
  }

  return (
    <div className="min-h-screen bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-5xl uppercase tracking-widest text-center mb-16">My Orders</h1>
        <div className="space-y-16">
          {orders.map((order) => (
            <details key={order.id} className="bg-gray-50 p-12 rounded-2xl cursor-pointer group">
              <summary className="flex justify-between items-center mb-8 list-none">
                <div>
                  <p className="text-xl">
                    Order {order.order_number || order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className={`text-lg font-bold ${getStatusColor(order.status)}`}>
                    {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Processing'}
                  </p>
                </div>
                <p className="text-xl">{order.created_at.toDate().toLocaleDateString()}</p>
              </summary>

              {/* 商品列表 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-6">
                    <Image src={item.image} alt={item.name} width={200} height={300} className="rounded-xl object-cover" />
                    <div>
                      <p className="text-2xl">{item.name}</p>
                      <p>Color: {item.color} • Size: {item.size}</p>
                      <p>Quantity: {item.quantity} • ${item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 跟踪信息 */}
              <div className="mt-12 pt-8 border-t border-gray-300 space-y-4 text-lg">
                <p><span className="font-bold">Total:</span> ${order.total.toFixed(2)}</p>

                {(order.tracking_number || order.estimated_delivery) ? (
                  <>
                    {order.tracking_number && (
                      <p>
                        <span className="font-bold">Tracking Number:</span> {order.tracking_number}
                        <a 
                          href={getTrackingLink(order.tracking_number)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-4 text-blue-600 underline hover:text-blue-800"
                        >
                          Track Package →
                        </a>
                      </p>
                    )}
                    {order.estimated_delivery && (
                      <p><span className="font-bold">Estimated Delivery:</span> {new Date(order.estimated_delivery).toLocaleDateString()}</p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-600 italic">Your order is being prepared. Tracking information will be available once shipped.</p>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}