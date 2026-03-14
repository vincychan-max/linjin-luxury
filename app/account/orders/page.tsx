'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createBrowserClient } from '@supabase/ssr';

export default function MyOrdersPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // ==================== 初始化 + 实时监听 ====================
  useEffect(() => {
    let channel: any = null;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to view orders');
        router.push('/auth/signin');
        return;
      }

      setCurrentUserId(session.user.id);
      await loadOrders(session.user.id);

      // 实时订阅（订单状态更新时自动刷新）
      channel = supabase
        .channel(`orders-${session.user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${session.user.id}`
          },
          () => loadOrders(session.user.id)
        )
        .subscribe();
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) router.push('/auth/signin');
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  const loadOrders = async (userId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      toast.error('Failed to load orders');
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  // 状态颜色
  const getStatusColor = (status: string = 'processing') => {
    switch (status.toLowerCase()) {
      case 'processing': return 'text-orange-600';
      case 'shipped': return 'text-blue-600';
      case 'delivered': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // 物流跟踪链接
  const getTrackingLink = (trackingNumber?: string): string | undefined => {
    if (!trackingNumber) return undefined;
    const num = trackingNumber.trim();

    if (num.length === 22 || /^9[245]/.test(num)) {
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${num}`;
    }
    if (/^1Z/i.test(num) && num.length === 18) {
      return `https://www.ups.com/track?loc=en_US&tracknum=${num}`;
    }
    return `https://www.fedex.com/fedextrack/?trknbr=${num}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-2xl">
        Loading orders...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-white text-center py-32">
        <h2 className="text-4xl uppercase tracking-widest mb-12">No Orders Yet</h2>
        <Link href="/" className="text-xl uppercase tracking-widest">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-5xl uppercase tracking-widest text-center mb-16">My Orders</h1>

        <div className="space-y-16">
          {orders.map((order: any) => (
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
                <p className="text-xl">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </summary>

              {/* 商品列表 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-6">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={200}
                      height={300}
                      className="rounded-xl object-cover"
                    />
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
                <p>
                  <span className="font-bold">Total:</span> ${order.total?.toFixed(2) || '0.00'}
                </p>

                {(order.tracking_number || order.estimated_delivery) ? (
                  <>
                    {order.tracking_number && (
                      <p>
                        <span className="font-bold">Tracking Number:</span> {order.tracking_number}
                        <a
                          href={getTrackingLink(order.tracking_number) ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 text-blue-600 underline hover:text-blue-800"
                        >
                          Track Package →
                        </a>
                      </p>
                    )}
                    {order.estimated_delivery && (
                      <p>
                        <span className="font-bold">Estimated Delivery:</span>{' '}
                        {new Date(order.estimated_delivery).toLocaleDateString()}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-600 italic">
                    Your order is being prepared. Tracking information will be available once shipped.
                  </p>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}