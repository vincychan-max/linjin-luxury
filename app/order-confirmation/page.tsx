'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// 导入 Supabase 客户端
import { createClient } from '@/utils/supabase/client'; 

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId'); 
  const paypalToken = searchParams.get('token'); 
  
  const supabase = createClient(); 

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  useEffect(() => {
    // 非法进入检测
    if (!orderId && !paypalToken) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        let query = supabase.from('orders').select('*');

        if (orderId) {
          // 情况 A: 通过系统内部 UUID 查询
          query = query.eq('id', orderId);
        } else if (paypalToken) {
          // 情况 B: 通过 PayPal 回传的 Token/ID 查询
          // 使用双保险：同时匹配 paypal_order_id 和 paypal_token 列
          query = query.or(`paypal_order_id.eq.${paypalToken},paypal_token.eq.${paypalToken}`);
        }

        const { data, error } = await query.single();

        if (error) throw error;
        if (data) {
          setOrder(data);
        }
      } catch (error) {
        console.error('Order fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, paypalToken, supabase]);

  // 1. 加载中状态
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[1px] border-zinc-100 border-t-black rounded-full animate-spin mb-6 mx-auto" />
          <p className="text-[9px] uppercase tracking-[8px] text-zinc-400 pl-[8px]">Authenticating</p>
        </div>
      </div>
    );
  }

  // 2. 订单未找到状态 (可能是数据库同步延迟)
  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-[500px] w-full text-center">
          <h2 className="text-2xl uppercase tracking-[10px] font-light mb-8">Order Pending</h2>
          <p className="text-[11px] uppercase tracking-[3px] text-zinc-500 mb-12 leading-loose">
            Thank you. Your transaction was received. <br/>
            We are currently synchronizing your order details.
          </p>
          <Link href="/" className="bg-black text-white px-12 py-5 rounded-full text-[10px] uppercase tracking-[5px] font-black hover:bg-zinc-800 transition shadow-xl inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // 3. 正常显示确认详情
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-24">
          <div className="inline-block w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-8">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl uppercase tracking-[15px] font-light text-black mb-4 pl-[15px]">
            Confirmed
          </h1>
          <p className="text-[10px] uppercase tracking-[4px] text-zinc-400">
            Order: {order.id.slice(-12).toUpperCase()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* 左侧：订单商品明细 */}
          <div className="lg:col-span-7 space-y-10">
            <h3 className="text-[10px] uppercase tracking-[4px] font-black border-b border-zinc-100 pb-6">
              Your Selection
            </h3>
            
            <div className="space-y-8">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex gap-8 py-2">
                  <div className="w-24 h-28 relative bg-zinc-50 rounded-2xl overflow-hidden flex-shrink-0 border border-zinc-100/50">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="text-[12px] uppercase tracking-widest font-bold mb-2">{item.name}</h4>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Quantity: {item.quantity}</p>
                    <p className="text-[12px] font-medium mt-3">{formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-10 space-y-4 border-t border-zinc-50">
              <div className="flex justify-between text-[11px] uppercase tracking-widest text-zinc-400">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal || (order.total - (order.shipping || 0)))}</span>
              </div>
              <div className="flex justify-between text-[11px] uppercase tracking-widest text-zinc-400">
                <span>Shipping</span>
                <span className="text-black">{order.shipping > 0 ? formatPrice(order.shipping) : 'Complimentary'}</span>
              </div>
              <div className="flex justify-between text-[14px] uppercase tracking-[3px] font-black pt-6 border-t border-zinc-100 text-black">
                <span>Total Amount</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* 右侧：收货地址与联系方式 */}
          <div className="lg:col-span-5 space-y-12">
            <div className="bg-zinc-50 rounded-[40px] p-10 border border-zinc-100/50">
              <h3 className="text-[10px] uppercase tracking-[4px] font-black mb-10">Delivery Details</h3>
              
              <div className="space-y-8 text-[11px] uppercase tracking-[2px] leading-relaxed">
                <section>
                  <p className="text-[9px] text-zinc-400 mb-2 font-black">Recipient</p>
                  <p className="text-black font-medium">{order.address?.name}</p>
                </section>

                <section>
                  <p className="text-[9px] text-zinc-400 mb-2 font-black">Contact Phone</p>
                  <p className="text-black font-bold select-all">
                    {order.address?.phone || 'Contact Info Required'}
                  </p>
                </section>

                <section>
                  <p className="text-[9px] text-zinc-400 mb-2 font-black">Shipping Address</p>
                  <div className="text-zinc-600 space-y-1">
                    <p>{order.address?.street}</p>
                    <p>{order.address?.city}, {order.address?.state} {order.address?.zip}</p>
                    <p className="text-black font-medium">{order.address?.country}</p>
                  </div>
                </section>
              </div>
            </div>

            <div className="text-center space-y-8 px-4">
              <p className="text-[9px] uppercase tracking-[2.5px] text-zinc-400 leading-loose">
                An official receipt and tracking number will be sent to your email within 48 hours. 
                Our atelier is now preparing your LINJIN LUXURY selection.
              </p>
              <Link href="/" className="block w-full bg-black text-white py-6 rounded-full text-[10px] uppercase tracking-[5px] font-black hover:bg-zinc-800 transition shadow-2xl">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 使用 Suspense 包裹，确保 useSearchParams 在客户端渲染时不报错
export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[9px] uppercase tracking-[10px] animate-pulse">Loading Details</p>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}