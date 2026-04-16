'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Image from 'next/image';

type RefundRequest = {
  id: string;
  order_id: string;
  reason: string;
  status: string;
  notes?: string;
  created_at: string;
  order: {
    id: string;
    paypal_order_id: string;
    capture_id: string;
    total: number;
    status: string;
    items: any[];
  };
};

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    const { data } = await supabase
      .from('refund_requests')
      .select(`
        *,
        order:orders (
          id, paypal_order_id, capture_id, total, status, items
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    setRefunds(data || []);
    setLoading(false);
  };

  // ==================== PayPal 真实退款（Server Action） ====================
  const handleRefundAction = async (refundId: string, action: 'approve' | 'reject', notes?: string) => {
    setProcessingId(refundId);

    const { data: refund } = await supabase
      .from('refund_requests')
      .select('*, order:orders(capture_id, paypal_order_id)')
      .eq('id', refundId)
      .single();

    if (!refund || !refund.order?.capture_id) {
      toast.error('无法找到退款所需信息');
      setProcessingId(null);
      return;
    }

    if (action === 'approve') {
      // 调用 PayPal 退款
      const res = await fetch('/api/admin/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          captureId: refund.order.capture_id,
          orderId: refund.order.paypal_order_id,
          amount: refund.order.total,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || 'PayPal 退款失败');
        setProcessingId(null);
        return;
      }
    }

    // 更新退款状态
    await supabase
      .from('refund_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        notes: notes || (action === 'approve' ? '已通过 PayPal 退款' : '已拒绝'),
      })
      .eq('id', refundId);

    // 更新订单状态
    await supabase
      .from('orders')
      .update({ status: action === 'approve' ? 'refunded' : 'refund_rejected' })
      .eq('id', refund.order_id);

    toast.success(action === 'approve' ? '✅ 退款已成功处理并通过 PayPal 退款' : '❌ 退款已拒绝');
    fetchRefunds();
    setProcessingId(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-4xl">Loading refunds...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-5xl uppercase tracking-widest mb-12 text-center">Admin - Refund Requests</h1>

        {refunds.length === 0 ? (
          <p className="text-center text-2xl opacity-60">No pending refund requests 🎉</p>
        ) : (
          <div className="space-y-8">
            {refunds.map((req) => (
              <div key={req.id} className="bg-white p-10 rounded-3xl shadow">
                <div className="flex justify-between mb-8">
                  <div>
                    <p className="text-sm opacity-60">Refund ID: {req.id.slice(0,8)}</p>
                    <p className="text-2xl">Order #{req.order.paypal_order_id.slice(-8)}</p>
                  </div>
                  <p className="text-xl">${req.order.total}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-10">
                  <div>
                    <h4 className="font-bold mb-2">Items</h4>
                    {req.order.items.map((item: any, i: number) => (
                      <div key={i} className="flex gap-4 mb-4">
                        <Image src={item.image || '/placeholder.jpg'} alt="" width={80} height={80} className="rounded" />
                        <div>
                          <p>{item.name}</p>
                          <p className="text-sm opacity-70">{item.color} • {item.size} × {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Reason</h4>
                    <p className="text-lg">{req.reason}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleRefundAction(req.id, 'approve')}
                    disabled={!!processingId}
                    className="flex-1 bg-green-600 text-white py-6 rounded-2xl text-xl hover:bg-green-700 disabled:opacity-50"
                  >
                    {processingId === req.id ? 'Processing...' : '✅ Approve & Refund'}
                  </button>
                  <button
                    onClick={() => handleRefundAction(req.id, 'reject')}
                    disabled={!!processingId}
                    className="flex-1 bg-red-600 text-white py-6 rounded-2xl text-xl hover:bg-red-700 disabled:opacity-50"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}