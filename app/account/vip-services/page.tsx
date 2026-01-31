'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from '@/lib/firebase';
import { doc, getDoc } from "firebase/firestore";
import { addDoc, collection } from "firebase/firestore";

export default function VIPServicesPage() {
  const auth = getAuth();
  const [user, setUser] = useState<any>(null);
  const [vipLevel, setVipLevel] = useState('Silver');
  const [vipSpent, setVipSpent] = useState(0);
  const [nextLevel, setNextLevel] = useState({ name: 'Gold', threshold: 10000 });
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: '',
    email: '',
    service: 'personal-styling',
    message: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // 未登录也可查看页面，但表单需登录
        setLoading(false);
        return;
      }

      setUser(currentUser);
      setForm({
        name: currentUser.displayName || '',
        email: currentUser.email || '',
        service: 'personal-styling',
        message: ''
      });

      // 加载 VIP 数据
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      let spent = 0;
      let level = 'Silver';

      if (userSnap.exists()) {
        spent = userSnap.data().vip_spent_annual || 0;

        if (spent >= 50000) level = 'Diamond';
        else if (spent >= 25000) level = 'Platinum';
        else if (spent >= 10000) level = 'Gold';
        else level = 'Silver';
      }

      setVipSpent(spent);
      setVipLevel(level);

      // 下一级
      if (level === 'Silver') setNextLevel({ name: 'Gold', threshold: 10000 });
      else if (level === 'Gold') setNextLevel({ name: 'Platinum', threshold: 25000 });
      else if (level === 'Platinum') setNextLevel({ name: 'Diamond', threshold: 50000 });
      else setNextLevel({ name: 'Diamond', threshold: 50000 });

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!user) {
      toast.error('Please sign in to submit request');
      return;
    }

    try {
      await addDoc(collection(db, "vip_requests"), {
        user_id: user.uid,
        ...form,
        status: 'new',
        created_at: new Date()
      });
      toast.success('Your request has been submitted. Our team will contact you soon.');
      setForm({ ...form, message: '' });
    } catch (error) {
      toast.error('Submission failed. Please try again.');
    }
  };

  // VIP 权益 + 图标
  const levelIcon = {
    Silver: '⭐',
    Gold: '🥇',
    Platinum: '💎',
    Diamond: '👑'
  };

  const vipBenefits = {
    Silver: ['Birthday $100 exclusive coupon', '48-hour early access to new collections'],
    Gold: ['All Silver benefits', 'Exclusive 8% discount code (one-time)', 'Priority 1-day shipping', '2 personal styling sessions per year'],
    Platinum: ['All Gold benefits', 'Exclusive 12% discount code (one-time)', 'Free global express shipping', 'Priority bespoke customization'],
    Diamond: ['All Platinum benefits', 'Exclusive 15% discount code (one-time)', 'Dedicated personal shopper', 'Annual limited-edition gift', 'Lifetime Diamond status']
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-4xl uppercase tracking-widest">Loading VIP Services...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 md:py-32">
      <div className="w-full px-6 md:px-16 lg:px-24">
        {/* VIP 等级大卡片 - 高端黑金渐变 */}
        <div className="max-w-5xl mx-auto mb-32">
          <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white p-16 md:p-24 rounded-3xl shadow-2xl text-center">
            <h1 className="text-5xl md:text-7xl uppercase tracking-widest mb-12">Your VIP Status</h1>
            
            <div className="text-9xl mb-8">{levelIcon[vipLevel as keyof typeof levelIcon] ?? '默认图标'}</div>
            <p className="text-5xl md:text-6xl uppercase tracking-widest mb-8">{vipLevel}</p>
            
            <p className="text-2xl md:text-3xl opacity-90 mb-12">
              Annual Spend: ${vipSpent.toFixed(0)}
            </p>

            {vipLevel !== 'Diamond' && (
              <p className="text-xl md:text-2xl opacity-80 mb-12">
                Spend ${nextLevel.threshold - vipSpent} more to reach {nextLevel.name}
              </p>
            )}

            {/* 优雅进度条 */}
            <div className="w-full bg-gray-800 rounded-full h-6 mb-16 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full transition-all duration-1000"
                style={{ width: `${vipLevel === 'Diamond' ? '100%' : Math.min((vipSpent / nextLevel.threshold) * 100, 100)}%` }}
              />
            </div>

            {/* 权益列表 - 极简高端 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
              {vipBenefits[vipLevel].map((benefit, i) => (
                <p key={i} className="text-lg md:text-xl opacity-90 flex items-center gap-4">
                  <span className="text-2xl">✓</span> {benefit}
                </p>
              ))}
            </div>

            {vipLevel !== 'Silver' && (
              <p className="text-xl md:text-2xl opacity-90 mt-16">
                Your exclusive one-time coupon: <span className="font-bold text-yellow-400">
                  {vipLevel === 'Gold' ? 'LINJINGOLD8' : vipLevel === 'Platinum' ? 'LINJINPLAT12' : 'LINJINDIAM15'}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* 服务介绍 - 更优雅 */}
        <div className="max-w-5xl mx-auto text-center space-y-16 mb-32">
          <h2 className="text-4xl md:text-6xl uppercase tracking-widest">
            Exclusive Personalized Services
          </h2>
          <p className="text-xl md:text-2xl opacity-70 leading-relaxed max-w-3xl mx-auto">
            As a valued Linjin member, enjoy dedicated virtual consultations, priority access to limited collections, 
            and bespoke guidance tailored to your refined taste.
          </p>

          {/* Hero 图 - 更大更沉浸 */}
          <div className="relative h-screen max-h-screen overflow-hidden rounded-3xl shadow-2xl">
            <Image
              src="/images/vip-hero.jpg"
              alt="Linjin VIP Experience"
              fill
              className="object-cover"
              placeholder="blur"
              blurDataURL="/images/placeholder-blur.jpg"
            />
          </div>
        </div>

        {/* 服务列表 - 更大间距更高端 */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20 mb-32">
          <div className="text-center space-y-8">
            <div className="text-9xl">👔</div>
            <h3 className="text-4xl uppercase tracking-widest">Personal Styling</h3>
            <p className="text-xl opacity-70 leading-relaxed">One-on-one virtual consultations with our expert stylists</p>
          </div>
          <div className="text-center space-y-8">
            <div className="text-9xl">✂️</div>
            <h3 className="text-4xl uppercase tracking-widest">Bespoke Guidance</h3>
            <p className="text-xl opacity-70 leading-relaxed">Customized recommendations and exclusive design options</p>
          </div>
          <div className="text-center space-y-8">
            <div className="text-9xl">⭐</div>
            <h3 className="text-4xl uppercase tracking-widest">Priority Access</h3>
            <p className="text-xl opacity-70 leading-relaxed">Early access to limited editions and special collections</p>
          </div>
        </div>

        {/* 咨询表单 - 更宽大高端 */}
        <div className="max-w-5xl mx-auto bg-white p-12 md:p-24 rounded-3xl shadow-2xl">
          <h2 className="text-4xl md:text-6xl uppercase tracking-widest text-center mb-16">
            Request Exclusive Service
          </h2>
          <form onSubmit={handleSubmit} className="grid gap-12 text-xl md:text-2xl">
            <input type="text" placeholder="Full Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border-b-2 border-gray-300 py-6 focus:border-black outline-none transition text-black placeholder:text-gray-500" />
            <input type="email" placeholder="Email *" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border-b-2 border-gray-300 py-6 focus:border-black outline-none transition text-black placeholder:text-gray-500" />
            
            <select value={form.service} onChange={e => setForm({...form, service: e.target.value})} className="w-full border-b-2 border-gray-300 py-6 focus:border-black outline-none transition text-black">
              <option value="personal-styling">Personal Styling Consultation</option>
              <option value="bespoke">Bespoke Customization Guidance</option>
              <option value="priority">Priority Collection Access</option>
              <option value="exclusive">Exclusive Offers Inquiry</option>
              <option value="other">Other Request</option>
            </select>

            <textarea placeholder="Your Message / Requirements *" value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={10} className="w-full border-b-2 border-gray-300 py-6 focus:border-black outline-none transition text-black placeholder:text-gray-500 resize-none" />

            <button type="submit" className="bg-black text-white py-8 text-3xl uppercase tracking-widest hover:opacity-90 transition">
              Submit Request
            </button>
          </form>
        </div>

        {/* 联系方式 - 更大 */}
        <div className="text-center mt-32 space-y-12">
          <p className="text-3xl uppercase tracking-widest">Contact Our VIP Team</p>
          <p className="text-2xl opacity-70">
            WhatsApp: +86 17817026596<br />
            Email: linjinluxury@gmail.com<br />
            
          </p>
        </div>

        {/* 返回 */}
        <div className="text-center mt-32">
          <Link href="/account" className="text-2xl uppercase tracking-widest hover:opacity-80 transition">
            ← Back to My Account
          </Link>
        </div>
      </div>
    </div>
  );
}