'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createBrowserClient } from '@supabase/ssr';

interface ValidationResult {
  result: {
    verdict: {
      inputGranularity: string;
      validationGranularity: string;
      addressComplete: boolean;
      hasUnconfirmedComponents: boolean;
    };
    address: {
      formattedAddress: string;
      addressComponents: any[];
    };
    uspsData?: any;
  } | null;
  suggestions?: any[];
}

export default function AddressBookPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 表单状态管理
  const [form, setForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States'
  });

  const [validating, setValidating] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // ==================== 数据加载 ====================
  const loadAddresses = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading addresses:', error.message);
      toast.error('Failed to load addresses');
    } else {
      setAddresses(data || []);
    }
    setLoading(false);
  }, [supabase]);

  // ==================== 初始化与实时监听 ====================
  useEffect(() => {
    let channel: any = null;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/signin');
        return;
      }
      const userId = session.user.id;
      setCurrentUserId(userId);
      await loadAddresses(userId);

      channel = supabase
        .channel(`addresses-realtime-${userId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'addresses',
          filter: `user_id=eq.${userId}`
        }, () => loadAddresses(userId))
        .subscribe();
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/auth/signin');
      } else if (session) {
        setCurrentUserId(session.user.id);
        loadAddresses(session.user.id);
      }
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router, loadAddresses]);

  // ==================== 地址验证 API 调用 ====================
  const validateAddress = async (): Promise<boolean> => {
    if (!form.street.trim() || !form.city.trim() || !form.zip.trim()) {
      toast.error('Please fill street, city and zip for validation');
      return false;
    }

    setValidating(true);
    try {
      const res = await fetch('/api/validate-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Validation error');

      setValidationResult({ 
        result: data.result, 
        suggestions: data.result?.suggestions || [] 
      });

      const verdict = data.result?.verdict;
      if (verdict?.addressComplete && !verdict?.hasUnconfirmedComponents) {
        toast.success('Address verified');
        return true;
      } else {
        setShowValidationModal(true);
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || 'Validation failed. Please check manually.');
      return false;
    } finally {
      setValidating(false);
    }
  };

  // ==================== 最终保存逻辑 ====================
  const performSave = async () => {
    if (!currentUserId) return;

    const payload = {
      user_id: currentUserId,
      name: form.name.trim(),
      phone: form.phone.trim(),
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state.trim() || null,
      zip: form.zip.trim(),
      country: form.country,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('addresses')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Address updated successfully');
      } else {
        const { error } = await supabase
          .from('addresses')
          .insert({ ...payload, created_at: new Date().toISOString() });
        if (error) throw error;
        toast.success('New address saved');
      }
      resetForm();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSaveClick = async () => {
    // 基础必填校验
    if (!form.name.trim() || !form.phone.trim() || !form.street.trim() || !form.city.trim() || !form.zip.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    // 电话格式简单校验 (允许数字、加号、中横线，长度 6-20)
    const phoneRegex = /^[0-9+\-\s()]{6,20}$/;
    if (!phoneRegex.test(form.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    const isValid = await validateAddress();
    if (isValid) await performSave();
  };

  // ==================== 辅助功能 ====================
  const deleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    await supabase.from('addresses').delete().eq('id', id);
  };

  const setDefault = async (id: string) => {
    if (!currentUserId) return;
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', currentUserId);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
  };

  const startEdit = (addr: any) => {
    setForm({
      name: addr.name || '',
      phone: addr.phone || '',
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      zip: addr.zip || '',
      country: addr.country || 'United States'
    });
    setEditingId(addr.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm({ name: '', phone: '', street: '', city: '', state: '', zip: '', country: 'United States' });
    setShowForm(false);
    setEditingId(null);
    setValidationResult(null);
    setShowValidationModal(false);
  };

  const handleApplySuggestion = (suggested: any) => {
    // 使用 prev 确保不覆盖 name 和 phone
    setForm(prev => ({
      ...prev,
      street: suggested.addressLines?.[0] || prev.street,
      city: suggested.locality || prev.city,
      state: suggested.administrativeArea || prev.state,
      zip: suggested.postalCode || prev.zip,
    }));
    setShowValidationModal(false);
    setValidationResult(null);
    toast.success('Applied suggested address');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[10px] uppercase tracking-[10px] animate-pulse">Loading Atelier...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <h1 className="text-2xl uppercase tracking-[15px] text-center mb-16 font-light">Address Book</h1>

        <div className="max-w-3xl mx-auto space-y-12">
          {showForm ? (
            <div className="bg-zinc-50 p-8 md:p-12 rounded-[32px] border border-zinc-100 animate-in fade-in slide-in-from-top-4 duration-500">
              <h2 className="text-[10px] uppercase tracking-[4px] font-black mb-10">
                {editingId ? 'Edit Address' : 'New Address'}
              </h2>

              <div className="grid gap-10">
                {/* 姓名 & 电话 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-[2px] text-zinc-400 font-bold ml-1">Full Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full border-b border-zinc-200 py-3 outline-none focus:border-black transition text-sm uppercase tracking-widest bg-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-[2px] text-zinc-400 font-bold ml-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={form.phone}
                      placeholder="+1 (555) 000-0000"
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full border-b border-zinc-200 py-3 outline-none focus:border-black transition text-sm uppercase tracking-widest bg-transparent"
                    />
                  </div>
                </div>

                {/* 街道地址 */}
                <div className="space-y-2">
                  <label className="text-[8px] uppercase tracking-[2px] text-zinc-400 font-bold ml-1">Street Address *</label>
                  <input
                    type="text"
                    value={form.street}
                    onChange={e => setForm({ ...form, street: e.target.value })}
                    className="w-full border-b border-zinc-200 py-3 outline-none focus:border-black transition text-sm uppercase tracking-widest bg-transparent"
                  />
                </div>

                {/* 城市 & 国家 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-[2px] text-zinc-400 font-bold ml-1">City *</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                      className="w-full border-b border-zinc-200 py-3 outline-none focus:border-black transition text-sm uppercase tracking-widest bg-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-[2px] text-zinc-400 font-bold ml-1">Country *</label>
                    <select
                      value={form.country}
                      onChange={e => setForm({ ...form, country: e.target.value, state: '' })}
                      className="w-full border-b border-zinc-200 py-3 outline-none bg-transparent text-sm uppercase tracking-widest cursor-pointer"
                    >
                      <option value="United States">United States</option>
                      <option value="China">China</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Hong Kong">Hong Kong</option>
                    </select>
                  </div>
                </div>

                {/* 州/省 & 邮编 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-[2px] text-zinc-400 font-bold ml-1">State / Region</label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={e => setForm({ ...form, state: e.target.value })}
                      className="w-full border-b border-zinc-200 py-3 outline-none focus:border-black transition text-sm uppercase tracking-widest bg-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase tracking-[2px] text-zinc-400 font-bold ml-1">Zip Code *</label>
                    <input
                      type="text"
                      value={form.zip}
                      onChange={e => setForm({ ...form, zip: e.target.value })}
                      className="w-full border-b border-zinc-200 py-3 outline-none focus:border-black transition text-sm uppercase tracking-widest bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* 按钮组 */}
              <div className="flex flex-col md:flex-row gap-4 mt-16">
                <button
                  onClick={handleSaveClick}
                  disabled={validating}
                  className="flex-1 bg-black text-white py-5 rounded-2xl text-[10px] uppercase tracking-[4px] font-black hover:bg-zinc-800 transition disabled:opacity-30"
                >
                  {validating ? 'Verifying...' : 'Save Address'}
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 bg-zinc-200 text-black py-5 rounded-2xl text-[10px] uppercase tracking-[4px] font-black hover:bg-zinc-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full border-2 border-dashed border-zinc-200 text-zinc-400 py-12 rounded-[32px] text-[10px] uppercase tracking-[5px] font-bold hover:border-zinc-400 hover:text-black transition"
            >
              + Add New Address
            </button>
          )}

          {/* 地址列表 */}
          <div className="grid gap-8">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white p-8 md:p-10 rounded-[32px] border border-zinc-100 shadow-sm relative group hover:shadow-md transition">
                {addr.is_default && (
                  <span className="absolute top-8 right-8 bg-black text-white px-4 py-1 text-[8px] uppercase tracking-[2px] font-black rounded-full">
                    Default
                  </span>
                )}
                
                <div className="space-y-4 mb-10">
                  <p className="text-sm font-black uppercase tracking-widest">{addr.name}</p>
                  <div className="text-[11px] text-zinc-500 uppercase tracking-widest leading-relaxed">
                    <p>{addr.street}</p>
                    <p>{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zip}</p>
                    <p>{addr.country}</p>
                    <p className="mt-2 text-zinc-400 font-medium">Tel: {addr.phone}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-6 border-t border-zinc-50">
                  <button onClick={() => startEdit(addr)} className="text-[9px] uppercase tracking-[2px] font-black text-zinc-400 hover:text-black transition underline underline-offset-8 decoration-zinc-200">Edit</button>
                  <button onClick={() => deleteAddress(addr.id)} className="text-[9px] uppercase tracking-[2px] font-black text-zinc-400 hover:text-red-500 transition underline underline-offset-8 decoration-zinc-200">Delete</button>
                  {!addr.is_default && (
                    <button onClick={() => setDefault(addr.id)} className="text-[9px] uppercase tracking-[2px] font-black text-zinc-400 hover:text-black transition underline underline-offset-8 decoration-zinc-200">Set as Default</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ====================== 验证结果提示弹窗 ====================== */}
      {showValidationModal && validationResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[40px] max-w-lg w-full p-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-zinc-100">
            <h3 className="text-[11px] uppercase tracking-[4px] font-black mb-8">Address Check</h3>
            <div className="space-y-6">
              <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                <p className="text-[8px] uppercase tracking-[2px] text-zinc-400 font-bold mb-3">Suggested format:</p>
                <p className="text-[11px] uppercase tracking-widest leading-relaxed text-black font-medium">
                  {validationResult.result?.address?.formattedAddress}
                </p>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed uppercase tracking-widest">
                Our system found a more accurate format. Would you like to use the suggestion or keep yours?
              </p>
            </div>
            <div className="flex flex-col gap-3 mt-12">
              <button 
                onClick={() => performSave()} 
                className="w-full bg-black text-white py-5 rounded-2xl text-[10px] uppercase tracking-[4px] font-black hover:bg-zinc-800 transition"
              >
                Save Anyway
              </button>
              <button 
                onClick={() => { setShowValidationModal(false); setValidationResult(null); }} 
                className="w-full bg-zinc-100 text-black py-5 rounded-2xl text-[10px] uppercase tracking-[4px] font-black hover:bg-zinc-200 transition"
              >
                Go Back & Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}