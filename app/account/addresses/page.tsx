'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

  const [form, setForm] = useState({
    name: '', street: '', city: '', state: '', zip: '', country: 'United States'
  });

  const [validating, setValidating] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [forceSave, setForceSave] = useState(false);

  // ==================== 初始化 + 实时监听 ====================
  useEffect(() => {
    let channel: any = null;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to manage addresses');
        router.push('/auth/signin');
        return;
      }

      setCurrentUserId(session.user.id);
      await loadAddresses(session.user.id);

      channel = supabase
        .channel(`addresses-${session.user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'addresses',
          filter: `user_id=eq.${session.user.id}`
        }, () => loadAddresses(session.user.id))
        .subscribe();
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) router.push('/auth/signin');
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  const loadAddresses = async (userId: string) => {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) toast.error('Failed to load addresses');
    else setAddresses(data || []);
    setLoading(false);
  };

  // ==================== 地址验证 ====================
  const validateAddress = async (): Promise<boolean> => {
    if (!form.street.trim() || !form.city.trim() || !form.zip.trim()) {
      toast.error('Please fill complete address for validation');
      return false;
    }

    setValidating(true);
    try {
      const res = await fetch('/api/validate-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          street: form.street,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Validation service error');
        return false;
      }

      setValidationResult({
        result: data.result,
        suggestions: data.result?.suggestions || []
      });

      const verdict = data.result?.verdict;
      if (verdict?.addressComplete && !verdict?.hasUnconfirmedComponents) {
        toast.success('✅ Address verified successfully');
        setValidationResult(null);
        return true;
      } else {
        setShowValidationModal(true);
        return false;
      }
    } catch {
      toast.error('Validation failed, please try again');
      return false;
    } finally {
      setValidating(false);
    }
  };

  // ==================== 实际保存 ====================
  const performSave = async () => {
    const payload = {
      user_id: currentUserId!,
      name: form.name.trim(),
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state.trim() || null,
      zip: form.zip.trim(),
      country: form.country,
    };

    if (editingId) {
      await supabase
        .from('addresses')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', editingId);
      toast.success('Address updated');
    } else {
      await supabase
        .from('addresses')
        .insert({ ...payload, created_at: new Date().toISOString() });
      toast.success('Address added');
    }
    resetForm();
  };

  // ==================== 保存入口 ====================
  const saveAddress = async () => {
    if (!currentUserId) return;

    if (!form.name.trim() || !form.street.trim() || !form.city.trim() || !form.zip.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!forceSave) {
      const isValid = await validateAddress();
      if (!isValid) return;
    }

    await performSave();
    setForceSave(false);
  };

  const deleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    await supabase.from('addresses').delete().eq('id', id);
    toast.success('Address deleted');
  };

  const setDefault = async (id: string) => {
    if (!currentUserId) return;
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', currentUserId);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    toast.success('Default address updated');
  };

  const startEdit = (addr: any) => {
    setForm({
      name: addr.name || '',
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      zip: addr.zip || '',
      country: addr.country || 'United States'
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ name: '', street: '', city: '', state: '', zip: '', country: 'United States' });
    setShowForm(false);
    setEditingId(null);
    setForceSave(false);
    setValidationResult(null);
  };

  const useSuggestedAddress = (suggested: any) => {
    setForm({
      ...form,
      street: suggested.addressLines?.[0] || form.street,
      city: suggested.locality || form.city,
      state: suggested.administrativeArea || form.state,
      zip: suggested.postalCode || form.zip,
    });
    setShowValidationModal(false);
    setValidationResult(null);
    toast.success('Suggested address applied');
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
          {/* ====================== 添加/编辑表单 ====================== */}
          {showForm ? (
            <div className="bg-white p-8 md:p-16 rounded-2xl shadow-lg">
              <h2 className="text-3xl md:text-4xl uppercase tracking-widest mb-12">
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h2>

              <div className="grid gap-8 text-xl md:text-2xl">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Street Address *"
                  value={form.street}
                  onChange={e => setForm({ ...form, street: e.target.value })}
                  className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500"
                />
                <input
                  type="text"
                  placeholder="City *"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500"
                />

                {/* 国家选择 */}
                <select
                  value={form.country}
                  onChange={e => setForm({ ...form, country: e.target.value, state: '' })}
                  className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Italy">Italy</option>
                  <option value="Spain">Spain</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Belgium">Belgium</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Austria">Austria</option>
                  <option value="Sweden">Sweden</option>
                  <option value="Norway">Norway</option>
                  <option value="Denmark">Denmark</option>
                  <option value="Finland">Finland</option>
                  <option value="Ireland">Ireland</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Japan">Japan</option>
                  <option value="South Korea">South Korea</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Hong Kong">Hong Kong</option>
                  <option value="China">China</option>
                  <option value="Mexico">Mexico</option>
                  <option value="Brazil">Brazil</option>
                  <option value="India">India</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                </select>

                {/* 美国州 + ZIP */}
                {form.country === 'United States' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <select
                      value={form.state}
                      onChange={e => setForm({ ...form, state: e.target.value })}
                      className="border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black"
                    >
                      <option value="">Select State *</option>
                      <option value="AL">Alabama</option>
                      <option value="AK">Alaska</option>
                      <option value="AZ">Arizona</option>
                      <option value="AR">Arkansas</option>
                      <option value="CA">California</option>
                      <option value="CO">Colorado</option>
                      <option value="CT">Connecticut</option>
                      <option value="DE">Delaware</option>
                      <option value="DC">District of Columbia</option>
                      <option value="FL">Florida</option>
                      <option value="GA">Georgia</option>
                      <option value="HI">Hawaii</option>
                      <option value="ID">Idaho</option>
                      <option value="IL">Illinois</option>
                      <option value="IN">Indiana</option>
                      <option value="IA">Iowa</option>
                      <option value="KS">Kansas</option>
                      <option value="KY">Kentucky</option>
                      <option value="LA">Louisiana</option>
                      <option value="ME">Maine</option>
                      <option value="MD">Maryland</option>
                      <option value="MA">Massachusetts</option>
                      <option value="MI">Michigan</option>
                      <option value="MN">Minnesota</option>
                      <option value="MS">Mississippi</option>
                      <option value="MO">Missouri</option>
                      <option value="MT">Montana</option>
                      <option value="NE">Nebraska</option>
                      <option value="NV">Nevada</option>
                      <option value="NH">New Hampshire</option>
                      <option value="NJ">New Jersey</option>
                      <option value="NM">New Mexico</option>
                      <option value="NY">New York</option>
                      <option value="NC">North Carolina</option>
                      <option value="ND">North Dakota</option>
                      <option value="OH">Ohio</option>
                      <option value="OK">Oklahoma</option>
                      <option value="OR">Oregon</option>
                      <option value="PA">Pennsylvania</option>
                      <option value="RI">Rhode Island</option>
                      <option value="SC">South Carolina</option>
                      <option value="SD">South Dakota</option>
                      <option value="TN">Tennessee</option>
                      <option value="TX">Texas</option>
                      <option value="UT">Utah</option>
                      <option value="VT">Vermont</option>
                      <option value="VA">Virginia</option>
                      <option value="WA">Washington</option>
                      <option value="WV">West Virginia</option>
                      <option value="WI">Wisconsin</option>
                      <option value="WY">Wyoming</option>
                    </select>
                    <input
                      type="text"
                      placeholder="ZIP Code *"
                      value={form.zip}
                      onChange={e => setForm({ ...form, zip: e.target.value })}
                      className="border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500"
                    />
                  </div>
                )}

                {/* 非美国 ZIP */}
                {form.country !== 'United States' && (
                  <input
                    type="text"
                    placeholder="ZIP / Postal Code *"
                    value={form.zip}
                    onChange={e => setForm({ ...form, zip: e.target.value })}
                    className="w-full border-b-2 border-gray-300 py-4 focus:border-black outline-none transition text-black placeholder:text-gray-500"
                  />
                )}
              </div>

              <div className="flex gap-8 mt-12">
                <button
                  onClick={saveAddress}
                  disabled={validating}
                  className="flex-1 bg-black text-white py-6 text-2xl uppercase tracking-wide hover:opacity-90 transition disabled:opacity-50"
                >
                  {validating ? 'Validating...' : 'Save Address'}
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-black py-6 text-2xl uppercase tracking-wide hover:opacity-90 transition"
                >
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

          {/* ====================== 地址列表 ====================== */}
          {addresses.length === 0 ? (
            <p className="text-center text-2xl opacity-70">No saved addresses yet</p>
          ) : (
            <div className="space-y-12">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-white p-8 md:p-16 rounded-2xl shadow-lg relative">
                  {addr.is_default && (
                    <span className="absolute top-4 right-4 bg-black text-white px-6 py-2 text-sm uppercase tracking-widest">
                      Default
                    </span>
                  )}
                  <div className="text-xl md:text-2xl space-y-4">
                    <p className="font-medium">{addr.name}</p>
                    <p>{addr.street}</p>
                    <p>{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zip}</p>
                    <p>{addr.country}</p>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={() => startEdit(addr)}
                      className="flex-1 bg-gray-200 text-black py-4 text-xl uppercase tracking-wide hover:opacity-90 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="flex-1 bg-red-600 text-white py-4 text-xl uppercase tracking-wide hover:opacity-90 transition"
                    >
                      Delete
                    </button>
                    {!addr.is_default && (
                      <button
                        onClick={() => setDefault(addr.id)}
                        className="flex-1 bg-black text-white py-4 text-xl uppercase tracking-wide hover:opacity-90 transition"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

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

      {/* ====================== 验证结果 Modal ====================== */}
      {showValidationModal && validationResult && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 md:p-12">
            <h3 className="text-3xl uppercase tracking-widest mb-8">Address Verification Result</h3>

            <div className="space-y-6 text-xl">
              {validationResult.result?.verdict?.hasUnconfirmedComponents && (
                <p className="text-red-600">⚠️ Address has uncertain parts. We recommend using the corrected version below.</p>
              )}

              <div className="bg-gray-100 p-6 rounded-2xl">
                <p className="font-medium">Google Suggested Address:</p>
                <p className="mt-2 whitespace-pre-wrap">{validationResult.result?.address?.formattedAddress}</p>
              </div>

              {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                <div>
                  <p className="font-medium mb-3">Other Suggestions:</p>
                  {validationResult.suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => useSuggestedAddress(s)}
                      className="block w-full text-left border border-gray-300 hover:border-black p-4 rounded-2xl mb-3 transition"
                    >
                      {s.formattedAddress}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-12">
              <button
                onClick={() => {
                  setForceSave(true);
                  setShowValidationModal(false);
                  saveAddress();
                }}
                className="flex-1 bg-gray-200 text-black py-6 text-2xl uppercase tracking-wide hover:opacity-90 transition"
              >
                Save Anyway
              </button>
              <button
                onClick={() => {
                  setShowValidationModal(false);
                  setValidationResult(null);
                }}
                className="flex-1 bg-black text-white py-6 text-2xl uppercase tracking-wide hover:opacity-90 transition"
              >
                Edit Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}