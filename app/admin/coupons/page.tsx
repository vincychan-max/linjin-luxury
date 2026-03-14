'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSupabase } from '../../components/providers/SupabaseProvider';

interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  discount: number;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  min_order_amount: number;
  active: boolean;
  created_at: string;
}

export default function AdminCouponsPage() {
  const { supabase } = useSupabase();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [form, setForm] = useState({
    code: '',
    type: 'percent' as 'percent' | 'fixed',
    discount: 0,
    max_uses: 9999,
    expires_at: '',
    min_order_amount: 0,
    active: true,
  });

  // 加载优惠券
  const loadCoupons = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) toast.error('加载失败');
    else setCoupons(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  // 打开弹窗
  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setForm({
        code: coupon.code,
        type: coupon.type,
        discount: coupon.discount,
        max_uses: coupon.max_uses,
        expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
        min_order_amount: coupon.min_order_amount,
        active: coupon.active,
      });
    } else {
      setEditingCoupon(null);
      setForm({
        code: '',
        type: 'percent',
        discount: 0,
        max_uses: 9999,
        expires_at: '',
        min_order_amount: 0,
        active: true,
      });
    }
    setShowModal(true);
  };

  // 保存
  const saveCoupon = async () => {
    if (!form.code.trim() || form.discount <= 0) {
      toast.error('优惠码和折扣不能为空');
      return;
    }

    const payload = {
      code: form.code.toUpperCase().trim(),
      type: form.type,
      discount: form.discount,
      max_uses: form.max_uses,
      expires_at: form.expires_at || null,
      min_order_amount: form.min_order_amount,
      active: form.active,
    };

    let error;
    if (editingCoupon) {
      ({ error } = await supabase.from('coupons').update(payload).eq('id', editingCoupon.id));
    } else {
      ({ error } = await supabase.from('coupons').insert([payload]));
    }

    if (error) toast.error(error.message);
    else {
      toast.success(editingCoupon ? '修改成功' : '创建成功');
      setShowModal(false);
      loadCoupons();
    }
  };

  // 删除
  const deleteCoupon = async (id: string) => {
    if (!confirm('确定删除此优惠券吗？')) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) toast.error('删除失败');
    else {
      toast.success('删除成功');
      loadCoupons();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">优惠券管理</h1>
        <button
          onClick={() => openModal()}
          className="bg-black text-white px-8 py-4 rounded-2xl hover:bg-zinc-800"
        >
          + 新建优惠券
        </button>
      </div>

      <div className="bg-white rounded-3xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-8 py-5 text-left">优惠码</th>
              <th className="px-8 py-5 text-left">类型</th>
              <th className="px-8 py-5 text-left">折扣</th>
              <th className="px-8 py-5 text-left">使用情况</th>
              <th className="px-8 py-5 text-left">最低金额</th>
              <th className="px-8 py-5 text-left">过期时间</th>
              <th className="px-8 py-5 text-left">状态</th>
              <th className="px-8 py-5 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => (
              <tr key={coupon.id} className="border-t hover:bg-zinc-50">
                <td className="px-8 py-5 font-mono font-bold">{coupon.code}</td>
                <td className="px-8 py-5">{coupon.type === 'percent' ? '百分比' : '固定金额'}</td>
                <td className="px-8 py-5 font-medium">
                  {coupon.type === 'percent' ? `${coupon.discount}%` : `¥${coupon.discount}`}
                </td>
                <td className="px-8 py-5">{coupon.used_count} / {coupon.max_uses}</td>
                <td className="px-8 py-5">¥{coupon.min_order_amount}</td>
                <td className="px-8 py-5 text-sm">
                  {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : '永久'}
                </td>
                <td className="px-8 py-5">
                  <span className={`px-4 py-1 rounded-full text-xs ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {coupon.active ? '启用' : '禁用'}
                  </span>
                </td>
                <td className="px-8 py-5 text-right space-x-4">
                  <button onClick={() => openModal(coupon)} className="text-blue-600 hover:underline">编辑</button>
                  <button onClick={() => deleteCoupon(coupon.id)} className="text-red-600 hover:underline">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 新建/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-8">
            <h3 className="text-2xl font-bold mb-6">
              {editingCoupon ? '编辑优惠券' : '新建优惠券'}
            </h3>

            <div className="space-y-6">
              <input
                type="text"
                placeholder="优惠码"
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full border border-zinc-200 rounded-2xl px-5 py-4"
              />

              <div className="grid grid-cols-2 gap-6">
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value as 'percent' | 'fixed' })}
                  className="border border-zinc-200 rounded-2xl px-5 py-4"
                >
                  <option value="percent">百分比</option>
                  <option value="fixed">固定金额</option>
                </select>
                <input
                  type="number"
                  placeholder="折扣值"
                  value={form.discount}
                  onChange={e => setForm({ ...form, discount: Number(e.target.value) })}
                  className="border border-zinc-200 rounded-2xl px-5 py-4"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <input
                  type="number"
                  placeholder="最大使用次数"
                  value={form.max_uses}
                  onChange={e => setForm({ ...form, max_uses: Number(e.target.value) })}
                  className="border border-zinc-200 rounded-2xl px-5 py-4"
                />
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={e => setForm({ ...form, expires_at: e.target.value })}
                  className="border border-zinc-200 rounded-2xl px-5 py-4"
                />
              </div>

              <input
                type="number"
                placeholder="最低消费金额"
                value={form.min_order_amount}
                onChange={e => setForm({ ...form, min_order_amount: Number(e.target.value) })}
                className="w-full border border-zinc-200 rounded-2xl px-5 py-4"
              />

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                启用
              </label>
            </div>

            <div className="flex gap-4 mt-10">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 border border-zinc-300 rounded-2xl">取消</button>
              <button onClick={saveCoupon} className="flex-1 py-4 bg-black text-white rounded-2xl">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}