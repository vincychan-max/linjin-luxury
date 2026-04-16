'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, Truck, Search, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const checkPermission = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        console.log("Current User:", user.email);

        // --- 暴力解锁：确保你的邮箱绝对拥有权限 ---
        if (user.email === 'linjinluxury@gmail.com') {
          console.log("Super Admin identified!");
          setIsAdmin(true);
          await fetchOrders();
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (profile?.is_admin) {
          setIsAdmin(true);
          await fetchOrders();
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Permission check failed:", err);
        setLoading(false);
      }
    };

    checkPermission();
  }, []);

  const fetchOrders = async () => {
    try {
      // 使用 * 确保拉取所有字段，防止字段缺失导致的 500 错误
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Supabase Error:", error.message);
        throw error;
      }
      
      console.log("Orders Data Fetched:", data);
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateTracking = async (orderId: string, email: string, paypalOrderId: string) => {
    const carrier = window.prompt("Enter Carrier (e.g., UPS, FedEx, DHL):", "UPS");
    if (!carrier) return;

    const trackingNum = window.prompt("Enter Tracking Number:");
    if (!trackingNum) return;

    try {
      // 1. 更新数据库状态
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'shipped',
          tracking_number: trackingNum 
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // 2. 调用 Resend API 发送邮件
      const response = await fetch('/api/send-shipping-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          orderNumber: paypalOrderId, // 传给邮件模板的订单号
          trackingNumber: trackingNum,
          carrier: carrier
        }),
      });

      if (response.ok) {
        alert("Success: Order updated & Email sent!");
        fetchOrders();
      } else {
        const errorData = await response.json();
        console.error("Resend API Error:", errorData);
        alert(`Partial Success: Order updated in DB, but email failed: ${errorData.error?.message || 'Unknown error'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Error: ${e.message || "Failed to update order"}`);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="w-12 h-12 animate-spin mb-4 text-black" />
      <div className="text-2xl font-light tracking-widest uppercase">Fetching Orders...</div>
    </div>
  );

  if (!isAdmin) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-3xl font-bold uppercase tracking-widest">Access Denied</h1>
      <p className="mt-2 opacity-60">You do not have administrator privileges.</p>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Orders Management</h1>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 opacity-30" />
          <input 
            type="text" 
            placeholder="Search by PayPal ID..." 
            className="pl-10 pr-4 py-2 border rounded-xl w-64 focus:ring-2 focus:ring-black outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-6 font-semibold uppercase text-xs tracking-wider">Order ID</th>
              <th className="p-6 font-semibold uppercase text-xs tracking-wider">Date</th>
              <th className="p-6 font-semibold uppercase text-xs tracking-wider">Total</th>
              <th className="p-6 font-semibold uppercase text-xs tracking-wider">Status</th>
              <th className="p-6 font-semibold uppercase text-xs tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center text-gray-400 italic">No orders found in database.</td>
              </tr>
            ) : (
              orders.filter(o => o.paypal_order_id?.toLowerCase().includes(searchTerm.toLowerCase())).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-6">
                    <p className="font-mono text-sm font-bold">{order.paypal_order_id}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{order.email}</p>
                  </td>
                  <td className="p-6 text-sm opacity-60">
                    {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="p-6 font-bold text-lg">${order.total?.toFixed(2)}</td>
                  <td className="p-6">
                    <span className={`px-4 py-1 rounded-full text-[10px] uppercase font-black tracking-widest ${
                      order.status === 'paid' ? 'bg-green-100 text-green-700' : 
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    {order.status === 'paid' && (
                      <button 
                        onClick={() => updateTracking(order.id, order.email, order.paypal_order_id)}
                        className="inline-flex items-center gap-2 bg-black text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-none"
                      >
                        <Truck className="w-3 h-3" />
                        DISPATCH
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <span className="text-xs text-gray-400 font-mono italic">{order.tracking_number}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}