'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { DollarSign, Package, Clock, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    pendingRefunds: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. 获取所有订单数据进行统计
      // 关键修正：必须包含 id 用于 key，包含 paypal_order_id 用于显示
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total, status, created_at, paypal_order_id') 
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(o => ['paid', 'processing'].includes(o.status)).length || 0;

      // 2. 获取待处理退款数量
      const { count: pendingRefunds, error: refundError } = await supabase
        .from('refund_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (refundError) throw refundError;

      // 3. 更新状态
      setStats({
        totalRevenue,
        totalOrders,
        pendingOrders,
        pendingRefunds: pendingRefunds || 0,
      });

      // 4. 设置最近 5 个订单
      setRecentOrders(orders?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-4xl animate-pulse font-light tracking-tighter">LOADING DASHBOARD...</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-5xl uppercase tracking-widest mb-16 font-bold">Admin Dashboard</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
          <DollarSign className="w-12 h-12 mb-6 text-green-600" />
          <p className="text-5xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
          <p className="text-xl mt-2 opacity-70">Total Revenue</p>
        </div>
        
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
          <Package className="w-12 h-12 mb-6 text-blue-600" />
          <p className="text-5xl font-bold">{stats.totalOrders}</p>
          <p className="text-xl mt-2 opacity-70">Total Orders</p>
        </div>
        
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
          <Clock className="w-12 h-12 mb-6 text-orange-600" />
          <p className="text-5xl font-bold text-orange-600">{stats.pendingOrders}</p>
          <p className="text-xl mt-2 opacity-70">Pending Orders</p>
        </div>
        
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
          <AlertCircle className="w-12 h-12 mb-6 text-red-600" />
          <p className="text-5xl font-bold text-red-600">{stats.pendingRefunds}</p>
          <p className="text-xl mt-2 opacity-70">Pending Refunds</p>
        </div>
      </div>

      {/* 最近订单 */}
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl uppercase tracking-widest font-semibold">Recent Orders</h2>
          <Link 
            href="/admin/orders" 
            className="text-black font-medium border-b-2 border-black pb-1 hover:opacity-50 transition-opacity"
          >
            VIEW ALL →
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              // 这里的 order.id 已经通过 select 查出来了，不会再报错
              <div key={order.id} className="flex justify-between py-8 items-center">
                <div>
                  <p className="font-bold text-lg">#{order.paypal_order_id?.slice(-8) || 'N/A'}</p>
                  <p className="text-sm opacity-50">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-xl">${order.total?.toFixed(2)}</p>
                  <span className={`text-xs uppercase tracking-tighter px-3 py-1 rounded-full ${
                    order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center opacity-40 italic">No recent orders found.</div>
          )}
        </div>
      </div>
    </div>
  );
}