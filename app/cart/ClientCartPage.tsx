'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { useSupabase } from '../components/providers/SupabaseProvider';
import { useCart, CartItem } from '@/lib/cartStore';
import { PayPalButtons } from '@paypal/react-paypal-js';

interface ClientCartPageProps {
  user?: any;
  initialCart?: CartItem[];
}

// ==================== 静态配置 ====================
const COUNTRY_CODE_MAP: Record<string, string> = {
  US: 'United States', CA: 'Canada', GB: 'United Kingdom', FR: 'France',
  DE: 'Germany', IT: 'Italy', ES: 'Spain', JP: 'Japan', KR: 'South Korea',
  AU: 'Australia', CN: 'China', SG: 'Singapore', HK: 'Hong Kong',
  IN: 'India', ID: 'Indonesia', TH: 'Thailand', VN: 'Vietnam',
  MY: 'Malaysia', PH: 'Philippines', BR: 'Brazil', AR: 'Argentina',
  CL: 'Chile', CO: 'Colombia', PE: 'Peru', MX: 'Mexico',
};

const STATE_TAX_RATES: Record<string, number> = {
  CA: 0.0875, NY: 0.08875, TX: 0.0825, FL: 0.07, IL: 0.0925,
  PA: 0.06, OH: 0.0725, GA: 0.07, NC: 0.0675, NJ: 0.06625,
};

const SOUTH_AMERICA_TAX_RATES: Record<string, number> = {
  'Brazil': 0.60, 'Argentina': 0.21, 'Chile': 0.19, 'Colombia': 0.19, 'Peru': 0.18,
};

const BASE_SHIPPING_RATES: Record<string, number> = {
  'United States': 50, 'Canada': 50, 'United Kingdom': 50, 'France': 50,
  'Germany': 50, 'Italy': 50, 'Spain': 50, 'Japan': 55, 'South Korea': 55,
  'Australia': 55, 'China': 50, 'Singapore': 50, 'Hong Kong': 50,
  'India': 50, 'Indonesia': 50, 'Thailand': 30, 'Vietnam': 30,
  'Malaysia': 30, 'Philippines': 30, 'Brazil': 120, 'Argentina': 120,
  'Chile': 100, 'Colombia': 100, 'Peru': 100,
};

export default function ClientCartPage({ 
  user: initialUser, 
  initialCart = [] 
}: ClientCartPageProps) {
  const { supabase, session } = useSupabase();
  const user = session?.user || initialUser;
  const router = useRouter();

  // 使用 store
  const cart = useCart((state) => state.cart);
  const isHydrated = useCart((state) => state._hasHydrated);

  const { 
    removeFromCart, 
    updateQuantity, 
    syncLocalCartWithServer,
    getTotalPrice,
    getTotalItems,
    clearCart,
    setServerCart,
  } = useCart();

  // ====================== 地址状态 ======================
  const [address, setAddress] = useState({
    name: '', phone: '', street: '', city: '', state: '', zip: '', country: 'United States'
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressLocked, setIsAddressLocked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const hasReconciled = useRef(false);

  // ====================== 最强 SSR 数据注入（解决跳没问题） ======================
  useEffect(() => {
    if (initialCart && initialCart.length > 0) {
      // 强制设置 server 数据，并标记已 hydration
      setServerCart(initialCart);
    }
  }, [initialCart, setServerCart]);

  // 防止 Zustand persist 覆盖 server 数据
  useEffect(() => {
    if (isHydrated && initialCart.length > 0 && cart.length === 0) {
      setServerCart(initialCart);
    }
  }, [isHydrated, initialCart, cart.length, setServerCart]);

  // ====================== 登录后同步 ======================
  const reconcileCartAndAddress = useCallback(async () => {
    if (!user?.id || hasReconciled.current) return;
    hasReconciled.current = true;

    try {
      await syncLocalCartWithServer(user.id);

      const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .limit(1);

      if (addresses?.[0]) {
        const addr = addresses[0];
        setSelectedAddressId(addr.id);
        setAddress({
          name: addr.name || '',
          phone: addr.phone || '',
          street: addr.street || '',
          city: addr.city || '',
          state: addr.state || '',
          zip: addr.zip || '',
          country: addr.country || 'United States',
        });
        setIsAddressLocked(true);
      }
    } catch (err) {
      console.error('Reconcile failed:', err);
    }
  }, [user?.id, supabase, syncLocalCartWithServer]);

  useEffect(() => {
    if (isHydrated && user?.id) {
      reconcileCartAndAddress();
    }
  }, [isHydrated, user?.id, reconcileCartAndAddress]);

  // ====================== 计算总额 ======================
  const totals = useMemo(() => {
    const subtotal = getTotalPrice?.() ?? 0;
    const itemsCount = getTotalItems?.() ?? 0;

    let shipping = 0;
    if (itemsCount > 0) {
      const baseRate = BASE_SHIPPING_RATES[address.country] ?? 60;
      shipping = baseRate + (itemsCount - 1) * 20;
    }

    let taxRate = 0;
    if (address.country === 'United States') {
      taxRate = STATE_TAX_RATES[address.state] ?? 0.08;
    } else {
      taxRate = SOUTH_AMERICA_TAX_RATES[address.country] ?? 0;
    }

    const tax = subtotal * taxRate;
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
  }, [cart, address.country, address.state, getTotalPrice, getTotalItems]);

  const formatPrice = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const handleAddressConfirm = async () => {
    const { name, phone, street, city, zip } = address;
    if (!name || !phone || !street || !city || !zip) {
      toast.error('Please complete all shipping details.');
      return;
    }

    if (!user?.id) {
      setIsAddressLocked(true);
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .upsert({
          ...(selectedAddressId ? { id: selectedAddressId } : {}),
          user_id: user.id,
          ...address,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setSelectedAddressId(data.id);
      setIsAddressLocked(true);
      toast.success('Shipping address confirmed.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save address.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ====================== Loading ======================
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="tracking-[15px] uppercase text-[10px] animate-pulse font-light">
          L&apos;ÉTOILE Authenticating...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-24 px-4 md:px-12 lg:px-24">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* 左侧 */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-16">
          <header>
            <h1 className="text-3xl font-light uppercase tracking-[15px] mb-2">My Bag</h1>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Handcrafted Hybrid Collection</p>
          </header>

          <section className="bg-zinc-50 rounded-[40px] p-8 md:p-12 border border-zinc-100">
            {cart.length === 0 ? (
              <div className="py-24 text-center">
                <p className="uppercase tracking-[5px] text-zinc-300 text-[10px] mb-8">Selection empty</p>
                <Link href="/shop" className="text-[10px] uppercase underline tracking-widest hover:text-zinc-500 transition">
                  Return to Store
                </Link>
              </div>
            ) : (
              <div className="space-y-10">
                {cart.map((item: CartItem) => (
                  <div key={item.id} className="flex gap-8 group">
                    <div className="w-28 h-36 relative bg-white rounded-3xl overflow-hidden border border-zinc-100 flex-shrink-0">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="uppercase tracking-[3px] text-[12px] font-bold mb-1">{item.name}</h3>
                          <p className="text-[9px] text-zinc-400 uppercase tracking-widest italic">
                            {item.color} / {item.size}
                          </p>
                        </div>
                        <span className="text-[13px] font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-6 border border-zinc-200 px-5 py-2 rounded-full bg-white scale-90 origin-left">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), user?.id)}
                            className="hover:text-black text-zinc-400"
                          >
                            −
                          </button>
                          <span className="text-[11px] font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1, user?.id)}
                            className="hover:text-black text-zinc-400"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id, user?.id)}
                          className="text-[9px] uppercase tracking-widest text-zinc-300 hover:text-red-500 underline transition underline-offset-4"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 地址表单（保持完整） */}
          <section className="bg-white border border-zinc-200 rounded-[40px] p-8 md:p-12">
            <h2 className="text-[11px] uppercase tracking-[6px] font-black mb-12 flex items-center gap-4">
              <span className="w-8 h-[1px] bg-black" /> Delivery Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              {/* 你的地址表单所有字段保持不变 */}
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Consignee Name</label>
                <input
                  disabled={isAddressLocked}
                  value={address.name}
                  onChange={(e) => setAddress({ ...address, name: e.target.value })}
                  className="w-full border-b border-zinc-200 py-3 text-[13px] uppercase tracking-widest focus:border-black outline-none transition disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Phone</label>
                <input
                  disabled={isAddressLocked}
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="w-full border-b border-zinc-200 py-3 text-[13px] tracking-widest focus:border-black outline-none transition disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Country</label>
                <select
                  disabled={isAddressLocked}
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  className="w-full border-b border-zinc-200 py-3 text-[13px] uppercase tracking-widest bg-transparent outline-none disabled:opacity-50"
                >
                  {Object.values(COUNTRY_CODE_MAP).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Street Address</label>
                <input
                  disabled={isAddressLocked}
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full border-b border-zinc-200 py-3 text-[13px] uppercase tracking-widest focus:border-black outline-none transition disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">City</label>
                <input
                  disabled={isAddressLocked}
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full border-b border-zinc-200 py-3 text-[13px] uppercase tracking-widest focus:border-black outline-none transition disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">State / Province</label>
                <input
                  disabled={isAddressLocked}
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full border-b border-zinc-200 py-3 text-[13px] uppercase tracking-widest focus:border-black outline-none transition disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Zip Code</label>
                <input
                  disabled={isAddressLocked}
                  value={address.zip}
                  onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                  className="w-full border-b border-zinc-200 py-3 text-[13px] tracking-widest focus:border-black outline-none transition disabled:opacity-50"
                />
              </div>
            </div>

            <div className="mt-12">
              {!isAddressLocked ? (
                <button
                  onClick={handleAddressConfirm}
                  disabled={isProcessing}
                  className="w-full py-5 bg-black text-white text-[11px] uppercase tracking-[4px] font-bold rounded-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-70"
                >
                  {isProcessing ? 'Verifying...' : 'Unlock Secure Checkout'}
                </button>
              ) : (
                <div className="flex items-center justify-between bg-zinc-950 p-6 rounded-2xl text-white">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest font-black">Destination Confirmed</span>
                  </div>
                  <button
                    onClick={() => setIsAddressLocked(false)}
                    className="text-[10px] uppercase underline text-zinc-400 hover:text-white"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* 右侧总结 + PayPal */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-32 bg-zinc-950 text-white rounded-[50px] p-10 md:p-14 shadow-2xl">
            <h2 className="text-[10px] uppercase tracking-[6px] font-bold mb-14 text-white/40 italic">Checkout Summary</h2>

            <div className="space-y-7 text-[12px] uppercase tracking-[2px] mb-14">
              <div className="flex justify-between items-center opacity-60 font-light">
                <span>Merchandise</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center opacity-60 font-light">
                <span>International Delivery</span>
                <span>{formatPrice(totals.shipping)}</span>
              </div>
              <div className="flex justify-between items-center text-green-400 font-bold">
                <span>Tax & Duties</span>
                <span>{formatPrice(totals.tax)}</span>
              </div>
              <div className="pt-12 border-t border-white/10 flex justify-between items-end">
                <span className="text-[10px] opacity-40 mb-1 font-bold">Total Amount</span>
                <span className="text-3xl font-light tracking-tighter">{formatPrice(totals.total)}</span>
              </div>
            </div>

            <div className="min-h-[160px]">
              {isAddressLocked && cart.length > 0 ? (
                <PayPalButtons
                  style={{ layout: 'vertical', color: 'white', shape: 'rect', label: 'pay', height: 54 }}
                  forceReRender={[totals.total, cart.length]}
                  createOrder={async () => {
                    try {
                      const response = await fetch('/api/checkout/create-order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          items: cart,
                          address,
                          userId: user?.id || null,
                        }),
                      });

                      const orderData = await response.json();

                      if (!response.ok || !orderData.id) {
                        throw new Error(orderData.error || 'Failed to create PayPal order');
                      }
                      return orderData.id;
                    } catch (err: any) {
                      toast.error(`Order creation failed: ${err.message}`);
                      throw err;
                    }
                  }}
                  onApprove={async (data) => {
                    if (isApproving) return;
                    setIsApproving(true);
                    setIsProcessing(true);

                    try {
                      const response = await fetch('/api/checkout/capture-order', {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Idempotency-Key': data.orderID 
                        },
                        body: JSON.stringify({ paypalOrderId: data.orderID }),
                      });

                      const captureData = await response.json();

                      if (response.ok && captureData.success) {
                        await clearCart(user?.id);
                        toast.success('Payment successful!');
                        router.push(`/order-confirmation?orderId=${captureData.dbOrderId}`);
                      } else {
                        throw new Error(captureData.error || 'Payment capture failed');
                      }
                    } catch (err: any) {
                      toast.error('Payment failed. Please do not refresh.');
                    } finally {
                      setIsApproving(false);
                      setIsProcessing(false);
                    }
                  }}
                />
              ) : (
                <div className="w-full py-8 rounded-3xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-white/20 text-[10px] uppercase tracking-[4px] font-bold text-center whitespace-pre-line">
                  {cart.length === 0 ? 'Selection Empty' : 'Secure Address\nto Proceed'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}