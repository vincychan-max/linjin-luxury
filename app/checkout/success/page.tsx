'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client'; 

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId'); 
  const paypalToken = searchParams.get('token'); 
  
  const supabase = createClient(); 

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  useEffect(() => {
    if (!orderId && !paypalToken) {
      setLoading(false);
      return;
    }

    let retryCount = 0;
    const maxRetries = 6; // 总计约 15-20 秒的轮询时间
    let interval: NodeJS.Timeout;

    const fetchOrder = async () => {
      try {
        let query = supabase.from('orders').select('*');

        if (orderId) {
          query = query.eq('id', orderId);
        } else if (paypalToken) {
          query = query.or(`paypal_order_id.eq.${paypalToken},paypal_token.eq.${paypalToken}`);
        }

        const { data, error } = await query.single();

        if (data) {
          setOrder(data);
          setLoading(false);
          setIsPolling(false);
          return true; // 成功找到订单
        }
        return false;
      } catch (error) {
        return false;
      }
    };

    const startPolling = async () => {
      // 第一次尝试
      const found = await fetchOrder();
      
      // 如果没找到，进入轮询模式
      if (!found) {
        setIsPolling(true);
        interval = setInterval(async () => {
          retryCount++;
          const success = await fetchOrder();
          
          if (success || retryCount >= maxRetries) {
            clearInterval(interval);
            setLoading(false);
            setIsPolling(false);
          }
        }, 3000); // 每 3 秒查询一次
      }
    };

    startPolling();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderId, paypalToken, supabase]);

  // 1. 加载中或轮询中状态
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[1px] border-zinc-100 border-t-black rounded-full animate-spin mb-6 mx-auto" />
          <p className="text-[9px] uppercase tracking-[8px] text-zinc-400 pl-[8px]">
            {isPolling ? "Synchronizing Order" : "Authenticating"}
          </p>
        </div>
      </div>
    );
  }

  // 2. 最终未找到订单 (重试结束)
  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-[500px] w-full text-center">
          <h2 className="text-xl uppercase tracking-[10px] font-light mb-8">Processing Delay</h2>
          <p className="text-[11px] uppercase tracking-[3px] text-zinc-500 mb-12 leading-loose">
            Your payment was successful, but we are still updating our records. <br/>
            Please check your email for the confirmation shortly.
          </p>
          <Link href="/" className="bg-black text-white px-12 py-5 rounded-full text-[10px] uppercase tracking-[5px] font-black hover:bg-zinc-800 transition shadow-xl inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // 3. 正常显示确认详情 (生产级视图)
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
            Order: {order.id.toString().slice(-12).toUpperCase()}
          </p>
          {order.status !== 'paid' && (
            <p className="text-[9px] text-amber-600 uppercase tracking-widest mt-2">Payment Verification Pending</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* 左侧：商品详情 */}
          <div className="lg:col-span-7 space-y-10">
            <h3 className="text-[10px] uppercase tracking-[4px] font-black border-b border-zinc-100 pb-6">Your Selection</h3>
            <div className="space-y-8">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="flex gap-8 py-2">
                  <div className="w-24 h-28 relative bg-zinc-50 rounded-2xl overflow-hidden flex-shrink-0 border border-zinc-100/50">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="text-[12px] uppercase tracking-widest font-bold mb-2">{item.name}</h4>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Qty: {item.quantity}</p>
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
                <span>{order.shipping > 0 ? formatPrice(order.shipping) : 'Complimentary'}</span>
              </div>
              <div className="flex justify-between text-[14px] uppercase tracking-[3px] font-black pt-6 border-t border-zinc-100 text-black">
                <span>Total Amount</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* 右侧：配送详情 */}
          <div className="lg:col-span-5">
            <div className="bg-zinc-50 rounded-[40px] p-10 border border-zinc-100/50 mb-10">
              <h3 className="text-[10px] uppercase tracking-[4px] font-black mb-10">Delivery Details</h3>
              <div className="space-y-8 text-[11px] uppercase tracking-[2px]">
                <section>
                  <p className="text-[9px] text-zinc-400 mb-2 font-black text-[8px]">Recipient</p>
                  <p className="text-black font-medium">{order.address?.name}</p>
                </section>
                <section>
                  <p className="text-[9px] text-zinc-400 mb-2 font-black text-[8px]">Shipping Address</p>
                  <div className="text-zinc-600 space-y-1 lowercase leading-relaxed">
                    <p className="capitalize">{order.address?.street}</p>
                    <p className="capitalize">{order.address?.city}, {order.address?.state} {order.address?.zip}</p>
                    <p className="text-black font-medium uppercase">{order.address?.country}</p>
                  </div>
                </section>
              </div>
            </div>

            <div className="text-center space-y-8">
              <p className="text-[9px] uppercase tracking-[2.5px] text-zinc-400 leading-loose">
                An official receipt and tracking number will be sent to your email. 
                Our atelier is now preparing your LINJIN LUXURY selection.
              </p>
              <Link href="/" className="block w-full bg-black text-white py-6 rounded-full text-[10px] uppercase tracking-[5px] font-black hover:bg-zinc-800 transition shadow-2xl">
                Return to Atelier
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[9px] uppercase tracking-[10px] animate-pulse">Initializing</p>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}