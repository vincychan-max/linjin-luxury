'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { toast } from 'sonner';

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDoc,
  getDocs,
  increment,
  orderBy
} from "firebase/firestore";

// 地址类型定义（修复 isDefault 类型错误）
interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  isDefault?: boolean;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [address, setAddress] = useState({
    name: '', street: '', city: '', state: '', zip: '', country: 'United States'
  });
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  // 优惠码状态
  const [coupon, setCoupon] = useState('');
  const [validDiscount, setValidDiscount] = useState<{ amount: number; code: string } | null>(null);

  // 用 ref 存储 unsubscribe 函数，避免重复订阅
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        toast.error('Please sign in to view your bag');
        router.push('/auth/signin');
        return;
      }

      // 加载购物车
      const cartQ = query(collection(db, "cart_items"), where("user_id", "==", user.uid));
      const unsubscribeCart = onSnapshot(cartQ, (snapshot) => {
        const itemsMap = new Map<string, any>();
        snapshot.forEach((doc) => {
          const data = doc.data();
          itemsMap.set(doc.id, { docId: doc.id, ...data });
        });

        const sortedNewItems = Array.from(itemsMap.values())
          .sort((a, b) => a.docId.localeCompare(b.docId));

        setCartItems((prevItems) => {
          const sortedPrev = [...prevItems].sort((a, b) => a.docId.localeCompare(b.docId));

          if (sortedPrev.length !== sortedNewItems.length) {
            return sortedNewItems;
          }

          for (let i = 0; i < sortedPrev.length; i++) {
            if (JSON.stringify(sortedPrev[i]) !== JSON.stringify(sortedNewItems[i])) {
              return sortedNewItems;
            }
          }

          return prevItems;
        });
      });

      // 加载地址列表
      const addressesRef = collection(db, "users", user.uid, "addresses");
      const addressesQ = query(addressesRef, orderBy("created_at", "desc"));
      const unsubscribeAddresses = onSnapshot(addressesQ, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Address));
        setAddresses(list);

        // 自动选中默认地址
        const defaultAddr = list.find(a => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setAddress({
            name: defaultAddr.name,
            street: defaultAddr.street,
            city: defaultAddr.city,
            state: defaultAddr.state || '',
            zip: defaultAddr.zip,
            country: defaultAddr.country
          });
        }

        setLoading(false);
      });

      unsubscribeRef.current = () => {
        unsubscribeCart();
        unsubscribeAddresses();
      };
    });

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
      unsubscribeAuth();
    };
  }, [router]);

  // 当选择地址时填充表单
  useEffect(() => {
    if (selectedAddressId) {
      const selected = addresses.find(a => a.id === selectedAddressId);
      if (selected) {
        setAddress({
          name: selected.name,
          street: selected.street,
          city: selected.city,
          state: selected.state || '',
          zip: selected.zip,
          country: selected.country
        });
      }
    }
  }, [selectedAddressId, addresses]);

  // 计算小计
  const subtotal = cartItems.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    return sum + price * item.quantity;
  }, 0);

  // 美国州税率表
  const stateTaxRates: Record<string, number> = {
    CA: 0.0875, NY: 0.08875, TX: 0.0825, FL: 0.07, IL: 0.0925,
    PA: 0.06, OH: 0.0725, GA: 0.07, NC: 0.0675, NJ: 0.06625,
    // 加更多州...
  };

  // 动态税率（非美国 0%）
  let taxRate = 0;
  if (address.country === 'United States' && address.state) {
    taxRate = stateTaxRates[address.state] || 0.08;
  }
  const tax = subtotal * taxRate;

  // 国家运费表
  const shippingRates: Record<string, number> = {
    'United States': 50,
    'Canada': 50,
    'United Kingdom': 50,
    'France': 50,
    'Germany': 50,
    'Italy': 50,
    'Spain': 50,
    'Japan': 50,
    'Australia': 50,
    'China': 50,
    'South Korea': 50,
    'Singapore': 50,
    'Hong Kong': 50,
    'India': 50,
    'Indonesia': 50,
    'Thailand': 30,
    'Malaysia': 30,
    'Philippines': 30,
    'Vietnam': 30,
    'Myanmar': 30,
    'Cambodia': 30,
    'Laos': 30,
    'Brunei': 30,
    'East Timor': 30,
    'Brazil': 120,
    'Argentina': 120,
    'Chile': 120,
    'Colombia': 120,
    'Peru': 120,
    'Venezuela': 120,
    'Ecuador': 120,
    'Uruguay': 120,
    'Bolivia': 120,
    'Paraguay': 120,
    'Guyana': 120,
    'Suriname': 120,
    'French Guiana': 120,
    'South Africa': 110,
    'Nigeria': 110,
    'Egypt': 110,
    'Kenya': 110,
    'Ghana': 110,
    'Morocco': 110,
    'Algeria': 110,
    'Ethiopia': 110,
    'Tanzania': 110,
    'Uganda': 110,
    'Angola': 110,
    'Ivory Coast': 110,
    'Sudan': 110,
  };

  let shipping = shippingRates[address.country] || 60;

  const discount = validDiscount?.amount || 0;

  const total = subtotal + shipping + tax - discount;

  // 应用优惠码
  const applyCoupon = async () => {
    const code = coupon.toUpperCase().trim();
    if (!code) {
      toast.error('Please enter a coupon code');
      return;
    }

    if (!auth.currentUser) {
      toast.error('Please sign in to use coupon');
      return;
    }

    try {
      const couponRef = doc(db, "coupons", code);
      const couponDoc = await getDoc(couponRef);

      if (!couponDoc.exists()) {
        toast.error('Invalid coupon code');
        setValidDiscount(null);
        return;
      }

      const data = couponDoc.data();
      const now = new Date();

      if (data.expires && data.expires.toDate() < now) {
        toast.error('Coupon expired');
        setValidDiscount(null);
        return;
      }

      if (data.min_subtotal && subtotal < data.min_subtotal) {
        toast.error(`Minimum subtotal $${data.min_subtotal} required`);
        setValidDiscount(null);
        return;
      }

      if (data.max_uses !== null && data.used_count >= data.max_uses) {
        toast.error('Coupon usage limit reached');
        setValidDiscount(null);
        return;
      }

      const perUserLimit = data.per_user_limit || 1;
      const usesRef = collection(db, "coupons", code, "uses");
      const userUsesQuery = query(usesRef, where("user_id", "==", auth.currentUser.uid));
      const userUsesSnap = await getDocs(userUsesQuery);

      if (userUsesSnap.size >= perUserLimit) {
        toast.error(`This coupon can only be used ${perUserLimit} time${perUserLimit > 1 ? 's' : ''} per customer`);
        setValidDiscount(null);
        return;
      }

      let discountAmount = 0;
      if (data.type === 'percent') {
        discountAmount = subtotal * data.discount;
      } else if (data.type === 'fixed') {
        discountAmount = data.discount;
      }

      setValidDiscount({ amount: discountAmount, code });
      toast.success(`${code} applied! ${data.type === 'percent' ? `${(data.discount * 100).toFixed(0)}%` : `$${data.discount}`} off`);
      setCoupon('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to validate coupon');
      setValidDiscount(null);
    }
  };

  // 更新数量
  const updateQuantity = async (item: any, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      removeItem(item);
      return;
    }

    try {
      await updateDoc(doc(db, "cart_items", item.docId), {
        quantity: newQuantity,
      });
      toast.success('Quantity updated');
    } catch (error) {
      toast.error('Update failed');
    }
  };

  // 删除商品
  const removeItem = async (item: any) => {
    try {
      await deleteDoc(doc(db, "cart_items", item.docId));
      toast.success('Removed from bag');
    } catch (error) {
      toast.error('Remove failed');
    }
  };

  // 地址验证
  const validateAddress = () => {
    if (!address.name.trim()) toast.error('Full Name is required');
    if (!address.street.trim()) toast.error('Street Address is required');
    if (!address.city.trim()) toast.error('City is required');
    if (!address.zip.trim()) toast.error('ZIP Code is required');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-4xl uppercase tracking-widest">Loading your bag...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white py-32 text-center">
        <h2 className="text-4xl uppercase tracking-widest mb-12">Your Bag is Empty</h2>
        <Link href="/" className="inline-block bg-black text-white px-16 py-6 text-xl uppercase tracking-wide transition-transform hover:scale-105 drop-shadow-md">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 md:py-24">
      <div className="w-full px-6 md:px-16 lg:px-24">
        <h1 className="text-5xl uppercase tracking-widest text-center mb-16">Your Bag</h1>

        {/* 商品列表 */}
        <div className="space-y-12 mb-24">
          {cartItems.map((item) => {
            const price = Number(item.price) || 0;
            return (
              <div key={item.docId} className="flex flex-col md:flex-row gap-8 pb-12 border-b border-gray-200">
                <div className="w-full md:w-48 lg:w-64 h-64 md:h-80 flex-shrink-0">
                  <Image
                    src={item.image || '/images/placeholder.jpg'}
                    alt={item.name}
                    width={500}
                    height={600}
                    className="w-full h-full object-cover rounded-xl shadow-lg"
                    placeholder="blur"
                    blurDataURL="/images/placeholder-blur.jpg"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl uppercase tracking-widest">{item.name}</h3>
                  <p className="text-xl mt-2 opacity-80">Color: {item.color}</p>
                  <p className="text-xl opacity-80">Size: {item.size}</p>
                  <p className="text-2xl md:text-3xl mt-4">${price.toFixed(2)}</p>

                  <div className="flex items-center gap-6 mt-8">
                    <button onClick={() => updateQuantity(item, -1)} className="text-3xl hover:scale-110 transition-transform">-</button>
                    <div className="w-12 text-center">
                      <span className="text-xl font-medium tabular-nums">{item.quantity}</span>
                    </div>
                    <button onClick={() => updateQuantity(item, 1)} className="text-3xl hover:scale-110 transition-transform">+</button>

                    <button onClick={() => removeItem(item)} className="ml-auto text-lg uppercase tracking-widest opacity-70 hover:opacity-100 transition">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 结账区 */}
        <div className="space-y-24">
          {/* Shipping Address */}
          <div className="bg-white p-8 md:p-16 rounded-2xl shadow-lg">
            <h2 className="text-3xl md:text-4xl uppercase tracking-widest mb-12">Shipping Address</h2>

            {addresses.length > 0 ? (
              <div className="mb-12">
                <select 
                  value={selectedAddressId || ''} 
                  onChange={(e) => setSelectedAddressId(e.target.value || null)}
                  className="w-full border-b-2 border-gray-300 py-4 text-xl md:text-2xl focus:border-black outline-none transition text-black"
                >
                  <option value="">Select saved address</option>
                  {addresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.isDefault && '★ Default - '}{addr.name} - {addr.city}, {addr.country}
                    </option>
                  ))}
                </select>

                <p className="text-center mt-6 opacity-70">
                  <Link href="/account/addresses" className="underline hover:opacity-100">
                    Manage addresses →
                  </Link>
                </p>
              </div>
            ) : (
              <p className="text-xl opacity-70 mb-8 text-center">
                No saved addresses. <Link href="/account/addresses" className="underline">Add one in Address Book</Link>
              </p>
            )}

            {/* 手动输入表单 */}
            <div className="grid gap-8 text-xl md:text-2xl">
              <input type="text" placeholder="Full Name *" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" />
              <input type="text" placeholder="Street Address *" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" />
              <input type="text" placeholder="City *" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" />

              <select 
                value={address.country} 
                onChange={e => setAddress({...address, country: e.target.value, state: '', zip: ''})}
                className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black"
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="France">France</option>
                <option value="Germany">Germany</option>
                <option value="Italy">Italy</option>
                <option value="Spain">Spain</option>
                <option value="Japan">Japan</option>
                <option value="Australia">Australia</option>
                <option value="China">China</option>
                <option value="South Korea">South Korea</option>
                <option value="Singapore">Singapore</option>
                <option value="Hong Kong">Hong Kong</option>
                <option value="India">India</option>

                <optgroup label="Southeast Asia">
                  <option value="Indonesia">Indonesia</option>
                  <option value="Thailand">Thailand</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Philippines">Philippines</option>
                  <option value="Vietnam">Vietnam</option>
                  <option value="Myanmar">Myanmar</option>
                  <option value="Cambodia">Cambodia</option>
                  <option value="Laos">Laos</option>
                  <option value="Brunei">Brunei</option>
                  <option value="East Timor">East Timor</option>
                </optgroup>

                <optgroup label="South America">
                  <option value="Brazil">Brazil</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Chile">Chile</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Venezuela">Venezuela</option>
                  <option value="Ecuador">Ecuador</option>
                  <option value="Uruguay">Uruguay</option>
                  <option value="Bolivia">Bolivia</option>
                  <option value="Paraguay">Paraguay</option>
                  <option value="Guyana">Guyana</option>
                  <option value="Suriname">Suriname</option>
                  <option value="French Guiana">French Guiana</option>
                </optgroup>

                <optgroup label="Africa">
                  <option value="South Africa">South Africa</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Egypt">Egypt</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Morocco">Morocco</option>
                  <option value="Algeria">Algeria</option>
                  <option value="Ethiopia">Ethiopia</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Uganda">Uganda</option>
                  <option value="Angola">Angola</option>
                  <option value="Ivory Coast">Ivory Coast</option>
                  <option value="Sudan">Sudan</option>
                </optgroup>

                <option value="Other">Other Countries</option>
              </select>

              {address.country === 'United States' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <select 
                    value={address.state} 
                    onChange={e => setAddress({...address, state: e.target.value})}
                    className="border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black"
                  >
                    <option value="">Select State *</option>
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                    <option value="TX">Texas</option>
                    <option value="FL">Florida</option>
                    <option value="IL">Illinois</option>
                    <option value="PA">Pennsylvania</option>
                    <option value="OH">Ohio</option>
                    <option value="GA">Georgia</option>
                    <option value="NC">North Carolina</option>
                    <option value="NJ">New Jersey</option>
                    {/* 加更多州 */}
                  </select>
                  <input type="text" placeholder="ZIP Code *" value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} className="border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" />
                </div>
              )}

              {address.country !== 'United States' && (
                <input type="text" placeholder="ZIP / Postal Code" value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" />
              )}
            </div>
          </div>

          {/* Coupon Code */}
          <div className="bg-white p-8 md:p-16 rounded-2xl shadow-lg">
            <h3 className="text-3xl md:text-4xl uppercase tracking-widest mb-12">Coupon Code</h3>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder={validDiscount ? `Applied: ${validDiscount.code}` : "Enter code"} 
                  value={coupon} 
                  onChange={e => setCoupon(e.target.value)} 
                  disabled={!!validDiscount}
                  className="w-full border-b-2 border-gray-300 py-4 text-xl md:text-2xl focus:border-black outline-none transition text-black placeholder:text-gray-500 disabled:opacity-50" 
                />
                {validDiscount && (
                  <button 
                    onClick={() => {
                      setValidDiscount(null);
                      toast.info('Coupon removed');
                    }}
                    className="absolute right-0 top-4 text-sm uppercase tracking-wide opacity-70 hover:opacity-100"
                  >
                    Remove
                  </button>
                )}
              </div>
              <button 
                onClick={applyCoupon} 
                disabled={!!validDiscount}
                className="bg-black text-white px-16 py-6 text-xl md:text-2xl uppercase tracking-wide hover:opacity-90 transition w-full md:w-auto disabled:opacity-50"
              >
                {validDiscount ? 'Applied' : 'Apply'}
              </button>
            </div>
          </div>

          {/* Order Summary + PayPal */}
          <div className="bg-white p-8 md:p-16 rounded-2xl shadow-lg">
            <h2 className="text-3xl md:text-4xl uppercase tracking-widest mb-12">Order Summary</h2>
            <div className="space-y-6 text-xl md:text-2xl">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>${shipping.toFixed(2)} {address.country === 'United States' ? '(Domestic)' : '(International)'}</span></div>
              <div className="flex justify-between"><span>Tax {taxRate > 0 ? `(${(taxRate * 100).toFixed(2)}%)` : ''}</span><span>${tax.toFixed(2)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({validDiscount?.code || ''})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-2xl md:text-3xl pt-8 border-t border-gray-200"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>

            {/* 国际税费提示 */}
            {address.country !== 'United States' && (
              <div className="mt-12 text-center">
                <p className="text-lg md:text-xl opacity-80 leading-relaxed max-w-3xl mx-auto">
                  International orders may be subject to import duties, taxes, and customs fees, 
                  which are levied by your local customs authority once the package arrives in your country. 
                  These additional charges are the buyer's responsibility and are not included in the total amount shown.
                </p>
                <p className="text-lg md:text-xl opacity-80 leading-relaxed mt-6 max-w-3xl mx-auto">
                  国际订单可能需支付进口关税、增值税及海关费用，这些费用由目的地国家海关收取， 
                  买家自行承担，不包含在本页面显示的总金额中。
                </p>
              </div>
            )}

            <div className="mt-12">
              <PayPalButtons
                style={{
                  shape: 'rect',
                  color: 'black',
                  layout: 'vertical',
                  label: 'paypal',
                  height: 55,
                  tagline: false
                }}
                fundingSource="paypal"
                disable-funding="credit,card"
                createOrder={(data, actions) => {
                  validateAddress();

                  if (total <= 0) {
                    toast.error('Invalid order amount');
                    throw new Error('Invalid order amount');
                  }

                  return actions.order.create({
                    intent: "CAPTURE",  // 修复类型错误：加 intent
                    purchase_units: [{
                      amount: {
                        value: total.toFixed(2),
                        currency_code: 'USD',
                        breakdown: {
                          item_total: { value: subtotal.toFixed(2), currency_code: 'USD' },
                          shipping: { value: shipping.toFixed(2), currency_code: 'USD' },
                          tax_total: { value: tax.toFixed(2), currency_code: 'USD' },
                        }
                      },
                      description: 'Linjin Luxury Premium Order'
                    }]
                  });
                }}
                onApprove={async (data, actions) => {
                  try {
                    const order = await actions.order.capture();
                    toast.success('Payment successful! Order confirmed.');

                    if (validDiscount) {
                      const couponRef = doc(db, "coupons", validDiscount.code);
                      
                      await updateDoc(couponRef, {
                        used_count: increment(1)
                      });

                      await addDoc(collection(db, "coupons", validDiscount.code, "uses"), {
                        user_id: auth.currentUser?.uid,
                        order_id: order.id,
                        used_at: new Date()
                      });
                    }

                    await addDoc(collection(db, "orders"), {
                      user_id: auth.currentUser?.uid,
                      paypal_order_id: order.id,
                      items: cartItems.map(item => ({
                        id: item.product_id || item.id,
                        name: item.name,
                        price: Number(item.price) || 0,
                        color: item.color,
                        size: item.size,
                        quantity: item.quantity,
                        image: item.image
                      })),
                      address,
                      subtotal,
                      shipping,
                      tax,
                      discount,
                      coupon_code: validDiscount?.code || null,
                      total,
                      status: 'paid',
                      created_at: new Date(),
                    });

                    await Promise.all(cartItems.map(item => deleteDoc(doc(db, "cart_items", item.docId))));

                    router.push('/my-orders');
                  } catch (error) {
                    console.error(error);
                    toast.error('Payment capture failed');
                  }
                }}
                onError={(err) => {
                  console.error(err);
                  toast.error('PayPal error. Please try again.');
                }}
                onCancel={() => toast.info('Payment cancelled')}
              />
            </div>

            <p className="text-center mt-8 text-sm opacity-70">
              Secure payment • Express shipping worldwide
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}