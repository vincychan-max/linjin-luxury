'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function VIPServicesPage() {
  // 模拟 VIP 状态（部署后可根据 Supabase 登录状态进行扩展）
  const [vipLevel, setVipLevel] = useState<'Silver' | 'Gold' | 'Platinum' | 'Diamond'>('Silver');
  const [vipSpent, setVipSpent] = useState(0);
  const [nextLevel, setNextLevel] = useState({ name: 'Gold', threshold: 10000 });
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: '',
    email: '',
    service: 'personal-styling',
    message: ''
  });

  // 模拟加载效果，确保页面渲染平滑
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      // ✅ 使用你提供的 Formspree ID: xeerzdyj
      const response = await fetch("https://formspree.io/f/xeerzdyj", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        toast.success('Your request has been submitted. Our VIP team will contact you soon.');
        setForm({ ...form, message: '' }); // 提交成功后清空留言板
      } else {
        toast.error('Submission failed. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please check your connection.');
    }
  };

  const levelIcon = {
    Silver: '⭐',
    Gold: '🥇',
    Platinum: '💎',
    Diamond: '👑'
  } as const;

  const vipBenefits = {
    Silver: ['Birthday $100 exclusive coupon', '48-hour early access to new collections'],
    Gold: ['All Silver benefits', 'Exclusive 8% discount code', 'Priority 1-day shipping', '2 personal styling sessions per year'],
    Platinum: ['All Gold benefits', 'Exclusive 12% discount code', 'Free global express shipping', 'Priority bespoke customization'],
    Diamond: ['All Platinum benefits', 'Exclusive 15% discount code', 'Dedicated personal shopper', 'Annual limited-edition gift', 'Lifetime Diamond status']
  } as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-2xl uppercase tracking-[0.3em] animate-pulse">Loading VIP Services...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 md:py-32">
      <div className="w-full px-6 md:px-16 lg:px-24">
        
        {/* VIP 状态卡片 - 采用黑金视觉方案 - 这部分保持原样，白字是正确的 */}
        <div className="max-w-5xl mx-auto mb-32">
          <div className="bg-gradient-to-br from-[#1a1a1a] via-[#333333] to-black text-white p-12 md:p-24 rounded-[2rem] shadow-2xl text-center border border-white/10">
            <h1 className="text-4xl md:text-6xl uppercase tracking-[0.2em] font-light mb-12">Membership Status</h1>
            
            <div className="text-8xl mb-8 leading-none">{levelIcon[vipLevel]}</div>
            <p className="text-4xl md:text-5xl uppercase tracking-[0.3em] font-medium mb-8 text-[#d4af37]">{vipLevel}</p>
            
            <div className="max-w-md mx-auto mb-12">
              <p className="text-xl opacity-70 mb-4 uppercase tracking-widest">Annual Spend: ${vipSpent}</p>
              {/* 进度条 */}
              <div className="w-full bg-white/10 rounded-full h-2 mb-4 overflow-hidden">
                <div 
                  className="bg-[#d4af37] h-full transition-all duration-1000"
                  style={{ width: `${Math.min((vipSpent / nextLevel.threshold) * 100, 100)}%` }}
                />
              </div>
              <p className="text-sm opacity-50 uppercase tracking-widest">
                ${nextLevel.threshold - vipSpent} more to reach {nextLevel.name}
              </p>
            </div>

            {/* 权益列表 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left border-t border-white/10 pt-12">
              {vipBenefits[vipLevel].map((benefit, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="text-[#d4af37] mt-1">✦</span>
                  <p className="text-lg opacity-80 font-light">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 核心服务介绍 - 修正了 h2 标题为 black */}
        <div className="max-w-5xl mx-auto text-center mb-32">
          <h2 className="text-3xl md:text-5xl uppercase tracking-[0.2em] font-light mb-12 text-black">
            Personalized Concierge
          </h2>
          <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-20 font-light">
            As a Linjin member, you gain access to our dedicated stylists and priority services, ensuring your experience is as unique as your style.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { icon: '👔', title: 'Styling', desc: 'One-on-one virtual consultations' },
              { icon: '✂️', title: 'Bespoke', desc: 'Customized guidance for unique pieces' },
              { icon: '⭐', title: 'Priority', desc: 'Early access to limited releases' }
            ].map((s, idx) => (
              <div key={idx} className="space-y-6">
                <div className="text-6xl">{s.icon}</div>
                <h3 className="text-xl uppercase tracking-widest font-medium text-black">{s.title}</h3>
                <p className="text-gray-400 font-light">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 🎯 表单区域 - 重点修复部分 🎯 */}
        <div id="request-form" className="max-w-4xl mx-auto bg-[#fafafa] p-8 md:p-20 rounded-[2rem] border border-gray-100 shadow-sm">
          {/* ✅ 修复 1: Inquiry Request 标题显式设为 black */}
          <h2 className="text-3xl md:text-5xl uppercase tracking-[0.15em] text-center font-light mb-16 text-black">
            Inquiry Request
          </h2>
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* ✅ 修复 2: Input 输入框文字和 placeholder 显式设为 black/gray-400 */}
              <input 
                type="text" 
                placeholder="Full Name *" 
                required
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                className="bg-transparent border-b border-gray-300 py-4 focus:border-black outline-none transition uppercase tracking-widest text-sm text-black placeholder:text-gray-400" 
              />
              <input 
                type="email" 
                placeholder="Email Address *" 
                required
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                className="bg-transparent border-b border-gray-300 py-4 focus:border-black outline-none transition uppercase tracking-widest text-sm text-black placeholder:text-gray-400" 
              />
            </div>
            
            <div className="space-y-4">
              <label className="uppercase tracking-[0.2em] text-xs text-gray-400">Select Service</label>
              {/* ✅ 修复 3: Select 下拉框文字显式设为 black */}
              <select 
                value={form.service} 
                onChange={e => setForm({...form, service: e.target.value})} 
                className="w-full bg-transparent border-b border-gray-300 py-4 focus:border-black outline-none transition uppercase tracking-widest text-sm text-black"
              >
                <option value="personal-styling">Personal Styling</option>
                <option value="bespoke">Bespoke Customization</option>
                <option value="priority">Priority Collection Access</option>
                <option value="other">General Inquiry</option>
              </select>
            </div>

            {/* ✅ 修复 4: Textarea 文字显式设为 black */}
            <textarea 
              placeholder="Your Message / Requirements *" 
              required
              value={form.message} 
              onChange={e => setForm({...form, message: e.target.value})} 
              rows={4} 
              className="w-full bg-transparent border-b border-gray-300 py-4 focus:border-black outline-none transition uppercase tracking-widest text-sm text-black placeholder:text-gray-400 resize-none" 
            />

            <button 
              type="submit" 
              className="w-full bg-black text-white py-6 uppercase tracking-[0.3em] text-sm hover:bg-gray-800 transition shadow-xl"
            >
              Send Request
            </button>
          </form>
        </div>

        {/* 页脚联系信息 - 保持原样，这里的 black 是正确的 */}
        <div className="text-center mt-32 space-y-8">
          <div className="w-12 h-[1px] bg-black mx-auto mb-8"></div>
          <p className="text-sm uppercase tracking-[0.3em] font-medium text-black">Linjin Luxury VIP Team</p>
          <div className="text-gray-400 space-y-2 font-light tracking-widest text-xs">
            <p>WhatsApp: +86 17817026596</p>
            <p>Email: linjinluxury@gmail.com</p>
          </div>
          <div className="pt-16">
            <Link href="/account" className="text-xs uppercase tracking-[0.2em] border-b border-black pb-1 hover:opacity-50 transition text-black">
              Back to My Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}