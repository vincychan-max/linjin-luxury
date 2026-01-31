'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getDocs, updateDoc } from "firebase/firestore";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  getDocs
} from "firebase/firestore";

export default function AddressBookPage() {
  const router = useRouter();
  const auth = getAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // 表单状态
  const [form, setForm] = useState({
    name: '', street: '', city: '', state: '', zip: '', country: 'United States'
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        toast.error('Please sign in to manage addresses');
        router.push('/auth/signin');
        return;
      }

      const addressesRef = collection(db, "users", user.uid, "addresses");
      const q = query(addressesRef, orderBy("created_at", "desc"));

      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAddresses(list);
        setLoading(false);
      }, (error) => {
        console.error("Load addresses error:", error);
        toast.error('Failed to load addresses');
        setLoading(false);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, [router]);

  // 保存地址（新增或编辑）
  const saveAddress = async () => {
    if (!auth.currentUser) return;

    if (!form.name.trim() || !form.street.trim() || !form.city.trim() || !form.zip.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const addressesRef = collection(db, "users", auth.currentUser.uid, "addresses");

      if (editingId) {
        // 编辑
        await updateDoc(doc(addressesRef, editingId), {
          ...form,
          updated_at: new Date()
        });
        toast.success('Address updated');
      } else {
        // 新增
        await addDoc(addressesRef, {
          ...form,
          created_at: new Date(),
          updated_at: new Date()
        });
        toast.success('Address added');
      }

      // 重置表单
      setForm({ name: '', street: '', city: '', state: '', zip: '', country: 'United States' });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      toast.error('Save failed');
    }
  };

  // 删除地址
  const deleteAddress = async (id: string) => {
    if (!auth.currentUser) return;

    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "addresses", id));
      toast.success('Address deleted');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  // 设置默认地址
  const setDefault = async (id: string) => {
    if (!auth.currentUser) return;

    try {
      const addressesRef = collection(db, "users", auth.currentUser.uid, "addresses");
      const snapshot = await getDocs(addressesRef);

      const batchUpdates = snapshot.docs.map(async (d) => {
        await updateDoc(d.ref, { isDefault: d.id === id });
      });

      await Promise.all(batchUpdates);
      toast.success('Default address updated');
    } catch (error) {
      toast.error('Update failed');
    }
  };

  // 编辑地址
  const startEdit = (addr: any) => {
    setForm({
      name: addr.name,
      street: addr.street,
      city: addr.city,
      state: addr.state || '',
      zip: addr.zip,
      country: addr.country
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-4xl uppercase tracking-widest">Loading addresses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 md:py-24">
      <div className="w-full px-6 md:px-16 lg:px-24">
        <h1 className="text-5xl uppercase tracking-widest text-center mb-16">Address Book</h1>

        <div className="max-w-5xl mx-auto space-y-12">
          {/* 添加/编辑表单 */}
          {showForm ? (
            <div className="bg-white p-8 md:p-16 rounded-2xl shadow-lg">
              <h2 className="text-3xl md:text-4xl uppercase tracking-widest mb-12">
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h2>
              <div className="grid gap-8 text-xl md:text-2xl">
                <input type="text" placeholder="Full Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" />
                <input type="text" placeholder="Street Address *" value={form.street} onChange={e => setForm({...form, street: e.target.value})} className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" />
                <input type="text" placeholder="City *" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" />

                {/* 国家选择（同 CartPage） */}
                <select 
                  value={form.country} 
                  onChange={e => setForm({...form, country: e.target.value, state: ''})}
                  className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black"
                >
                  {/* 同 CartPage 的国家列表，省略重复，复制粘贴 */}
                  <option value="United States">United States</option>
                  {/* ... 其他国家 ... */}
                </select>

                {form.country === 'United States' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <select value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black">
                      <option value="">Select State *</option>
                      {/* 同 CartPage 州列表 */}
                    </select>
                    <input type="text" placeholder="ZIP Code *" value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} className="border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" />
                  </div>
                )}

                {form.country !== 'United States' && (
                  <input type="text" placeholder="ZIP / Postal Code" value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500" />
                )}
              </div>

              <div className="flex gap-8 mt-12">
                <button onClick={saveAddress} className="flex-1 bg-black text-white py-6 text-2xl uppercase tracking-wide hover:opacity-90 transition">
                  Save Address
                </button>
                <button onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm({ name: '', street: '', city: '', state: '', zip: '', country: 'United States' });
                }} className="flex-1 bg-gray-200 text-black py-6 text-2xl uppercase tracking-wide hover:opacity-90 transition">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowForm(true)}
              className="w-full bg-black text-white py-8 text-3xl uppercase tracking-widest hover:opacity-90 transition"
            >
              + Add New Address
            </button>
          )}

          {/* 地址列表 */}
          {addresses.length === 0 ? (
            <p className="text-center text-2xl opacity-70">No saved addresses yet</p>
          ) : (
            <div className="space-y-12">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-white p-8 md:p-16 rounded-2xl shadow-lg relative">
                  {addr.isDefault && (
                    <span className="absolute top-4 right-4 bg-black text-white px-6 py-2 text-sm uppercase tracking-widest">
                      Default
                    </span>
                  )}
                  <div className="text-xl md:text-2xl space-y-4">
                    <p className="font-medium">{addr.name}</p>
                    <p>{addr.street}</p>
                    <p>{addr.city}, {addr.state} {addr.zip}</p>
                    <p>{addr.country}</p>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button onClick={() => startEdit(addr)} className="flex-1 bg-gray-200 text-black py-4 text-xl uppercase tracking-wide hover:opacity-90 transition">
                      Edit
                    </button>
                    <button onClick={() => deleteAddress(addr.id)} className="flex-1 bg-red-600 text-white py-4 text-xl uppercase tracking-wide hover:opacity-90 transition">
                      Delete
                    </button>
                    {!addr.isDefault && (
                      <button onClick={() => setDefault(addr.id)} className="flex-1 bg-black text-white py-4 text-xl uppercase tracking-wide hover:opacity-90 transition">
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 返回链接 */}
          <div className="text-center space-y-8 mt-24">
            <Link href="/account" className="block text-2xl uppercase tracking-widest hover:opacity-80 transition">
              ← Back to My Account
            </Link>
            <Link href="/" className="block text-xl opacity-80 hover:opacity-100 transition">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}