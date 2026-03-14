'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { useSupabase } from '../components/providers/SupabaseProvider';
import { useCart } from '@/lib/cartStore'; 
import { PayPalButtons } from '@paypal/react-paypal-js';

// 国家与税率配置保持不变
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

const customDebounce = <T extends (...args: any[]) => void>(func: T, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export default function ClientCartPage({ initialCart, initialSubtotal, initialFormattedSubtotal, initialShipping, initialFormattedShipping, initialTax, initialFormattedTax, initialTotal, initialFormattedTotal }: any) {
  const { supabase, session } = useSupabase();
  const user = session?.user;
  const router = useRouter();

  const { 
    cart, 
    loading: cartLoading, 
    removeFromCart, 
    updateQuantity, 
    fetchCart, 
    syncLocalCartWithServer,
    getTotalPrice,
    getTotalItems,
  } = useCart();

  const [address, setAddress] = useState<any>({
    name: '', street: '', city: '', state: '', zip: '', country: 'United States'
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddressLocked, setIsAddressLocked] = useState(false);
  const [validDiscount, setValidDiscount] = useState<{ amount: number; code: string } | null>(null);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  useEffect(() => {
    if (!user) return;
    const init = async () => {
      await fetchCart(user.id);
      await syncLocalCartWithServer(user.id); 
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      const defaultAddr = data?.find((a: any) => a.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setAddress({ ...defaultAddr });
        setIsAddressLocked(true);
      }
    };
    init();
  }, [user, fetchCart, syncLocalCartWithServer, supabase]);

  const [clientSubtotal, setClientSubtotal] = useState(initialSubtotal);
  const [clientShipping, setClientShipping] = useState(initialShipping);
  const [clientTax, setClientTax] = useState(initialTax);
  const [clientTotal, setClientTotal] = useState(initialTotal);

  useEffect(() => {
    const newSubtotal = getTotalPrice();
    setClientSubtotal(newSubtotal);

    const totalItemsCount = getTotalItems();
    const newShipping = totalItemsCount === 0 ? 0 : (BASE_SHIPPING_RATES[address.country] || 60) + (totalItemsCount - 1) * 20;
    setClientShipping(newShipping);

    const rate = address.country === 'United States' && address.state ? (STATE_TAX_RATES[address.state] || 0.08) : (SOUTH_AMERICA_TAX_RATES[address.country] || 0);
    const newTax = newSubtotal * rate;
    setClientTax(newTax);

    const newTotal = Math.max(0.01, newSubtotal + newShipping + newTax - (validDiscount?.amount || 0));
    setClientTotal(newTotal);
  }, [cart, address, validDiscount, getTotalPrice, getTotalItems]);

  const handleSaveAndCheck = async () => {
    if (!address.name || !address.street || !address.city || !address.zip) {
      toast.error('Please complete all shipping fields');
      return;
    }
    setIsProcessing(true);
    try {
      const { data: savedAddress, error } = await supabase
        .from('addresses')
        .upsert({
          ...(selectedAddressId ? { id: selectedAddressId } : {}),
          user_id: user?.id,
          ...address,
        })
        .select().single();

      if (error) throw error;
      setSelectedAddressId(savedAddress.id);
      setIsAddressLocked(true);
      toast.success('Address confirmed');
    } catch (err) {
      toast.error('Failed to save address');
    } finally {
      setIsProcessing(false);
    }
  };

  const debouncedUpdateQuantity = useMemo(() => 
    customDebounce((itemId: string, newQuantity: number, userId: string | undefined) => {
      updateQuantity(itemId, newQuantity, userId);
    }, 300),
    [updateQuantity]
  );

  const handleQuantityChange = (itemId: string, value: string) => {
    let newQuantity = parseInt(value, 10);
    if (isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1;
    }
    debouncedUpdateQuantity(itemId, newQuantity, user?.id);
  };

  if (cartLoading) return <div className="min-h-screen flex items-center justify-center tracking-[10px] uppercase text-[10px]">Loading...</div>;

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 px-4 md:px-12 lg:px-20 xl:px-32">
      <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16">
        
        {/* Left Side: Cart & Shipping */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-12">
          <h1 className="text-2xl uppercase tracking-[10px] font-light text-black pl-2">Shopping Bag</h1>
          
          <div className="bg-zinc-50 rounded-[32px] p-8 border border-zinc-100">
            {cart.length === 0 ? (
                <div className="py-20 text-center uppercase tracking-widest text-zinc-400 text-[10px]">Your bag is empty</div>
            ) : (
                cart.map((item: any) => (
                    <div key={item.id} className="flex gap-8 pb-8 mb-8 border-b border-zinc-200 last:border-0 last:mb-0 last:pb-0">
                      <div className="w-24 h-32 relative bg-white rounded-2xl overflow-hidden border border-zinc-100 flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div className="flex justify-between items-start">
                          <h3 className="uppercase tracking-widest text-[11px] font-bold text-black leading-relaxed max-w-[200px]">{item.name}</h3>
                          <span className="text-sm font-medium text-black">{formatPrice(item.price)}</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="flex items-center gap-4 border border-zinc-200 px-3 py-1.5 rounded-full bg-white text-black text-[10px] font-black">
                             <button onClick={() => updateQuantity(item.id, item.quantity - 1, user?.id)} className="w-4 hover:text-zinc-400">-</button>
                             <input 
                               type="number"
                               value={item.quantity}
                               onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                               className="w-12 text-center border-none outline-none bg-transparent"
                               min="1"
                             />
                             <button onClick={() => updateQuantity(item.id, item.quantity + 1, user?.id)} className="w-4 hover:text-zinc-400">+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.id, user?.id)} className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-red-500 transition font-bold underline underline-offset-4 decoration-zinc-200">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))
            )}
          </div>

          <div className="bg-white border border-zinc-200 rounded-[32px] p-8 lg:p-10 text-black">
            <h2 className="text-[10px] uppercase tracking-[4px] font-black mb-10 text-black">Shipping Details</h2>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[8px] uppercase tracking-[2px] text-zinc-500 font-black ml-1">Full Name</label>
                <input 
                  value={address.name} 
                  onChange={e => setAddress({...address, name: e.target.value})}
                  disabled={isAddressLocked}
                  placeholder="NAME"
                  className="w-full border-b border-zinc-200 py-3 px-1 outline-none focus:border-black transition text-[12px] uppercase tracking-widest text-black bg-white disabled:bg-zinc-50 disabled:text-zinc-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[8px] uppercase tracking-[2px] text-zinc-500 font-black ml-1">Street Address</label>
                  <input 
                    value={address.street} 
                    onChange={e => setAddress({...address, street: e.target.value})}
                    disabled={isAddressLocked}
                    className="w-full border-b border-zinc-200 py-3 px-1 outline-none focus:border-black transition text-[12px] uppercase tracking-widest text-black bg-white disabled:bg-zinc-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] uppercase tracking-[2px] text-zinc-500 font-black ml-1">City</label>
                  <input 
                    value={address.city} 
                    onChange={e => setAddress({...address, city: e.target.value})}
                    disabled={isAddressLocked}
                    className="w-full border-b border-zinc-200 py-3 px-1 outline-none focus:border-black transition text-[12px] uppercase tracking-widest text-black bg-white disabled:bg-zinc-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[8px] uppercase tracking-[2px] text-zinc-500 font-black ml-1">Country</label>
                  <select 
                    value={address.country} 
                    onChange={e => setAddress({...address, country: e.target.value})}
                    disabled={isAddressLocked}
                    className="w-full border-b border-zinc-200 py-3 px-1 outline-none bg-white text-[12px] uppercase tracking-widest text-black disabled:bg-zinc-50"
                  >
                    {Object.values(COUNTRY_CODE_MAP).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] uppercase tracking-[2px] text-zinc-500 font-black ml-1">State</label>
                  <input 
                    value={address.state} 
                    onChange={e => setAddress({...address, state: e.target.value})}
                    disabled={isAddressLocked}
                    className="w-full border-b border-zinc-200 py-3 px-1 outline-none focus:border-black transition text-[12px] uppercase tracking-widest text-black bg-white disabled:bg-zinc-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] uppercase tracking-[2px] text-zinc-500 font-black ml-1">Postal Code</label>
                  <input 
                    value={address.zip} 
                    onChange={e => setAddress({...address, zip: e.target.value})}
                    disabled={isAddressLocked}
                    className="w-full border-b border-zinc-200 py-3 px-1 outline-none focus:border-black transition text-[12px] uppercase tracking-widest text-black bg-white disabled:bg-zinc-50"
                  />
                </div>
              </div>

              {!isAddressLocked ? (
                <button 
                  onClick={handleSaveAndCheck}
                  disabled={isProcessing}
                  className="w-full mt-6 bg-black text-white py-5 rounded-2xl text-[10px] uppercase tracking-[4px] font-black hover:bg-zinc-800 transition shadow-xl"
                >
                  {isProcessing ? 'Verifying...' : 'Verify Shipping Info'}
                </button>
              ) : (
                <div className="flex items-center justify-between bg-zinc-900 p-5 rounded-2xl border border-black shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[9px] text-white uppercase tracking-widest font-black">Details Verified</span>
                  </div>
                  <button onClick={() => setIsAddressLocked(false)} className="text-[9px] text-zinc-400 uppercase tracking-widest hover:text-white transition font-bold underline">Edit</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Summary */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-32 bg-zinc-900 text-white rounded-[40px] p-10 shadow-2xl border border-white/5 mb-6">
            <h2 className="text-[10px] uppercase tracking-[4px] font-black mb-12 text-white/30">Order Summary</h2>
            <div className="space-y-6 text-[11px] uppercase tracking-widest mb-12">
              <div className="flex justify-between opacity-70"><span>Subtotal</span><span>{formatPrice(clientSubtotal)}</span></div>
              <div className="flex justify-between opacity-70"><span>Shipping</span><span>{formatPrice(clientShipping)}</span></div>
              <div className="flex justify-between text-green-400 font-bold"><span>Tax Included</span><span>{formatPrice(clientTax)}</span></div>
              <div className="pt-10 border-t border-white/10 flex justify-between font-black text-2xl tracking-tighter">
                <span>Total</span><span>{formatPrice(clientTotal)}</span>
              </div>
            </div>

            {/* PayPal Button Container */}
            <div className="min-h-[150px]">
              {isAddressLocked && cart.length > 0 ? (
                <div className="animate-in fade-in duration-500">
                   <PayPalButtons
                    style={{
                      layout: 'vertical',
                      color: 'white',
                      shape: 'rect',
                      label: 'pay',
                      height: 50
                    }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        intent: 'CAPTURE',
                        purchase_units: [{
                          amount: {
                            currency_code: 'USD',
                            value: clientTotal.toFixed(2),
                          }
                        }]
                      });
                    }}
                    onApprove={async (data, actions) => {
                      const details = await actions.order?.capture();
                      // 修复类型警告：添加安全判断和兜底值
                      const payerName = details?.payer?.name?.given_name || "Guest";
                      toast.success(`Transaction completed by ${payerName}`);
                      router.push('/order-confirmation');
                    }}
                    onError={(err) => {
                      toast.error('Payment failed. Please try again.');
                      console.error(err);
                    }}
                  />
                </div>
              ) : (
                <div className="w-full py-6 rounded-2xl text-[11px] uppercase tracking-[4px] bg-white/5 text-white/20 border border-white/5 font-black text-center">
                  {cart.length === 0 ? 'Bag is empty' : 'Confirm Info First'}
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-[8px] uppercase tracking-[2px] text-white/30 font-medium">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    AES-256 SSL Encrypted Transaction
                </div>
                <p className="text-[7px] uppercase tracking-[1px] text-white/20 text-center leading-relaxed">
                    Complimentary signature packaging included with every order. <br/>
                    Secure checkout powered by PayPal.
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}