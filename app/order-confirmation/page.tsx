'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { db } from '@/lib/firebase';
import { doc, getDoc } from "firebase/firestore";

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

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
        const orderDoc = await getDoc(doc(db, "orders", orderId));
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() });
        } else {
          toast.error('Order not found');
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-4xl uppercase tracking-widest">Loading your order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white py-32 text-center">
        <h2 className="text-4xl uppercase tracking-widest mb-12">Order Not Found</h2>
        <Link href="/" className="inline-block bg-black text-white px-16 py-6 text-xl uppercase tracking-wide transition-transform hover:scale-105 drop-shadow-md">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 md:py-24">
      <div className="w-full px-6 md:px-16 lg:px-24">
        {/* 感谢标题 */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl uppercase tracking-widest mb-8">Thank You for Your Purchase</h1>
          <p className="text-2xl opacity-80">Your order has been confirmed and is being prepared with care.</p>
          <p className="text-xl mt-4 opacity-70">Order #{order.id.slice(-8).toUpperCase()}</p>
          <p className="text-lg mt-2 opacity-70">Estimated delivery: 3-5 business days</p>
        </div>

        {/* 商品列表 */}
        <div className="space-y-12 mb-20">
          <h2 className="text-4xl uppercase tracking-widest text-center mb-12">Order Details</h2>
          {order.items.map((item: any, index: number) => (
            <div key={index} className="flex flex-col md:flex-row gap-8 pb-12 border-b border-gray-200">
              <div className="w-full md:w-48 lg:w-64 h-64 md:h-80 flex-shrink-0">
                <Image
                  src={item.image || '/images/placeholder.jpg'}
                  alt={item.name}
                  width={500}
                  height={600}
                  className="w-full h-full object-cover rounded-xl shadow-lg"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl uppercase tracking-widest">{item.name}</h3>
                <p className="text-xl mt-2 opacity-80">Color: {item.color} | Size: {item.size}</p>
                <p className="text-xl opacity-80">Quantity: {item.quantity}</p>
                <p className="text-2xl md:text-3xl mt-4">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 地址 + 总结 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* 地址 */}
          <div className="bg-white p-12 rounded-2xl shadow-lg">
            <h2 className="text-3xl uppercase tracking-widest mb-8">Shipping Address</h2>
            <div className="text-xl space-y-2 opacity-80">
              <p>{order.address.name}</p>
              <p>{order.address.street}</p>
              <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
              <p>{order.address.country}</p>
            </div>
          </div>

          {/* 订单总结 */}
          <div className="bg-white p-12 rounded-2xl shadow-lg">
            <h2 className="text-3xl uppercase tracking-widest mb-8">Order Summary</h2>
            <div className="space-y-4 text-xl">
              <div className="flex justify-between"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>Complimentary</span></div>
              <div className="flex justify-between"><span>Tax</span><span>${order.tax.toFixed(2)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-${order.discount.toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold text-2xl pt-8 border-t border-gray-200"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="text-center mt-20 space-y-8">
          <Link 
            href="/" 
            className="inline-block bg-black text-white px-20 py-6 text-xl uppercase tracking-wide transition-transform hover:scale-105 drop-shadow-md"
          >
            Continue Shopping
          </Link>

          <div className="mt-12">
            <p className="text-lg opacity-70">Questions about your order?</p>
            <Link href="/contact" className="text-xl underline hover:opacity-80 transition">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}