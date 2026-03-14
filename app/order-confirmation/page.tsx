'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

// 1. 切换到你的 Supabase 客户端钩子或工具类
import { createClient } from '@/utils/supabase/client'; 

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const supabase = createClient(); // 初始化客户端

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      toast.error('Invalid order ID');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        // 2. 将 Firebase 的 getDoc 换成 Supabase 的查询
        const { data, error } = await supabase
          .from('orders') // 确保你在 Supabase 有个叫 orders 的表
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) throw error;

        if (data) {
          setOrder(data);
        } else {
          toast.error('Order not found');
        }
      } catch (error) {
        console.error('Supabase fetch error:', error);
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, supabase]);

  // ... 后面所有的 UI 代码（Loading, Order Not Found, Order Details）基本保持不变 ...
  // 仅需确保数据库字段名一致，例如 order.items, order.address 等
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-4xl uppercase tracking-widest animate-pulse">Loading your order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white py-32 text-center">
        <h2 className="text-4xl uppercase tracking-widest mb-12">Order Not Found</h2>
        <Link href="/" className="inline-block bg-black text-white px-16 py-6 text-xl uppercase tracking-wide transition-transform hover:scale-105">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 md:py-24">
       {/* 保持你原来的 UI 代码不变 */}
       <div className="w-full px-6 md:px-16 lg:px-24">
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl uppercase tracking-widest mb-8">Thank You for Your Purchase</h1>
            <p className="text-xl mt-4 opacity-70">Order #{order.id.slice(-8).toUpperCase()}</p>
          </div>
          {/* ... 展示商品列表和金额总结 ... */}
       </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}