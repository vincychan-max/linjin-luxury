'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ExternalLink,
  ShoppingBag,
  Download,
  AlertCircle,
  X,
  Upload
} from 'lucide-react';

export default function MyOrdersPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 退款弹窗状态
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('Size mismatch');
  const [refundDesc, setRefundDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let channel: any = null;
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to view orders');
        router.push('/auth/signin');
        return;
      }
      await loadOrders(session.user.id);
      
      channel = supabase
        .channel(`orders-${session.user.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'orders', 
          filter: `user_id=eq.${session.user.id}` 
        }, () => loadOrders(session.user.id))
        .subscribe();
    };
    init();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
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

  // 提交退款申请
  const submitRefundRequest = async () => {
    if (!selectedOrderId) return;
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. 在 refund_requests 表中创建记录
      const { error: requestError } = await supabase
        .from('refund_requests')
        .insert({
          order_id: selectedOrderId,
          user_id: user.id,
          reason: refundReason,
          description: refundDesc,
          images: [] // 这里可以后续扩展图片上传逻辑
        });

      if (requestError) throw requestError;

      // 2. 更新订单状态为 refund_pending
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'refund_pending' })
        .eq('id', selectedOrderId);

      if (orderError) throw orderError;

      toast.success("Return request submitted successfully");
      setIsRefundModalOpen(false);
      loadOrders(user.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadInvoice = (orderId: string) => {
    window.print();
  };

  const getStatusInfo = (status: string = 'paid') => {
    switch (status.toLowerCase()) {
      case 'paid': return { label: 'Paid', color: 'text-green-600', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'processing': return { label: 'Processing', color: 'text-zinc-500', icon: <Clock className="w-4 h-4" /> };
      case 'shipped': return { label: 'Shipped', color: 'text-blue-600', icon: <Truck className="w-4 h-4" /> };
      case 'delivered': return { label: 'Delivered', color: 'text-black', icon: <Package className="w-4 h-4" /> };
      case 'refund_pending': return { label: 'Return Review', color: 'text-orange-600', icon: <AlertCircle className="w-4 h-4" /> };
      case 'refunded': return { label: 'Refunded', color: 'text-zinc-400', icon: <CheckCircle2 className="w-4 h-4" /> };
      default: return { label: status, color: 'text-zinc-400', icon: <Clock className="w-4 h-4" /> };
    }
  };

  const getTrackingLink = (num?: string) => {
    if (!num) return undefined;
    const cleanNum = num.trim();
    if (cleanNum.length === 22 || /^9[245]/.test(cleanNum)) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${cleanNum}`;
    if (/^1Z/i.test(cleanNum) && cleanNum.length === 18) return `https://www.ups.com/track?loc=en_US&tracknum=${cleanNum}`;
    return `https://www.fedex.com/fedextrack/?trknbr=${cleanNum}`;
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-2 border-zinc-100 border-t-black rounded-full animate-spin mb-4" />
      <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold">Authenticating</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white py-20 md:py-32">
      <style jsx global>{`
        @media print {
          nav, footer, .no-print, button, .modal { display: none !important; }
          .print-area { padding: 0 !important; margin: 0 !important; }
          .order-card { border: none !important; page-break-after: always; }
          body { background: white; }
        }
      `}</style>

      {/* 退款申请弹窗 (Modal) */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 modal">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsRefundModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg p-10 animate-in fade-in zoom-in duration-300">
            <button onClick={() => setIsRefundModalOpen(false)} className="absolute top-6 right-6 hover:rotate-90 transition-transform">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Request Return</h2>
            <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] mb-10">LINJIN LUXURY Concierge Service</p>
            
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block mb-3">Reason for Return</label>
                <select 
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full border-b border-zinc-200 py-3 text-xs uppercase font-bold tracking-widest focus:outline-none focus:border-black transition-colors bg-transparent cursor-pointer"
                >
                  <option>Size mismatch</option>
                  <option>Changed my mind</option>
                  <option>Item defective</option>
                  <option>Wrong item received</option>
                  <option>Quality not as expected</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block mb-3">Additional Details</label>
                <textarea 
                  value={refundDesc}
                  onChange={(e) => setRefundDesc(e.target.value)}
                  placeholder="Please describe the issue..."
                  className="w-full border border-zinc-100 p-4 text-xs min-h-[120px] focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <button 
                disabled={isSubmitting}
                onClick={submitRefundRequest}
                className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 print-area">
        <div className="text-center mb-24 no-print">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4 text-black">My Orders</h1>
          <p className="text-zinc-400 uppercase text-[10px] tracking-[0.5em] font-medium">Order History & Invoices</p>
        </div>

        <div className="space-y-32">
          {orders.map((order: any) => {
            const statusInfo = getStatusInfo(order.status);
            const total = Number(order.total || 0);
            const tax = Number(order.tax || 0);
            const shipping = Number(order.shipping_cost || 0);
            const subtotal = total - tax - shipping;

            return (
              <div key={order.id} className="order-card group">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-black pb-6 mb-10 gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Order Reference</p>
                    <p className="font-mono text-sm font-bold text-black uppercase">{order.order_number || `ORD-${order.id.slice(0, 8).toUpperCase()}`}</p>
                  </div>
                  
                  <div className="flex items-center gap-10">
                    <button onClick={() => handleDownloadInvoice(order.id)} className="no-print flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
                       <Download className="w-3 h-3" /> Invoice
                    </button>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Status</p>
                      <div className={`flex items-center gap-2 mt-1 text-xs font-bold uppercase tracking-widest ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                  <div className="md:col-span-8 space-y-10">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-8 items-center">
                        <div className="w-20 h-28 relative bg-zinc-50 overflow-hidden">
                          <Image src={item.image} alt={item.name} fill className="object-cover grayscale" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-bold uppercase tracking-wider mb-2 text-black">{item.name}</h3>
                          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em]">QTY: {item.quantity} / SIZE: {item.size}</p>
                        </div>
                        <div className="text-sm font-bold font-mono text-black">${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="md:col-span-4">
                    <div className="bg-zinc-50 p-8 border border-zinc-100">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] border-b border-zinc-200 pb-4 mb-6 text-zinc-400">Financial Summary</h4>
                      <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-[11px] uppercase tracking-widest text-zinc-500">
                          <span>Subtotal</span>
                          <span className="text-black">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] uppercase tracking-widest text-zinc-500">
                          <span>Shipping</span>
                          <span className="text-black italic">{shipping === 0 ? 'Complimentary' : `$${shipping.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between text-xs font-black uppercase tracking-[0.2em] pt-5 border-t border-zinc-200 text-black">
                          <span>Grand Total</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="no-print">
                        {order.status === 'paid' && (
                          <button 
                            onClick={() => { setSelectedOrderId(order.id); setIsRefundModalOpen(true); }}
                            className="w-full py-4 border border-zinc-200 text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          >
                            Request a Return
                          </button>
                        )}
                        {order.status === 'refund_pending' && (
                          <div className="flex items-center justify-center gap-2 py-4 bg-zinc-100 text-[9px] uppercase tracking-widest font-bold text-zinc-500">
                            <AlertCircle className="w-3 h-3 text-orange-500" /> Under Review
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}