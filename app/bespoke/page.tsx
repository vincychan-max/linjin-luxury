'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { toast } from 'sonner';

export default function BespokePage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    material: 'calfskin',
    details: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 使用你之前的 Formspree ID: xeerzdyj
      const response = await fetch("https://formspree.io/f/xeerzdyj", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          subject: "New Bespoke Inquiry",
          ...form
        }),
      });

      if (response.ok) {
        toast.success('Your bespoke inquiry has been sent. Our master artisan will contact you shortly.');
        setForm({ name: '', email: '', material: 'calfskin', details: '' });
      } else {
        toast.error('Submission failed. Please try again.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-white min-h-screen pt-40 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* 第一部分：视觉宣言 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <div className="space-y-8 order-2 lg:order-1">
            <p className="text-[10px] uppercase tracking-[0.6em] text-stone-400 italic">One of One</p>
            <h1 className="text-5xl md:text-7xl font-serif italic text-stone-900 leading-tight">
              The Soul of <br /> Bespoke
            </h1>
            <p className="text-stone-500 font-light leading-relaxed text-lg max-w-md">
              Beyond the collection lies a world of pure creation. Our bespoke service is an intimate dialogue between you and our master artisans, where every stitch tells your story.
            </p>
          </div>
          <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden order-1 lg:order-2">
            <Image 
              src="https://images.unsplash.com/photo-1590564310418-66304f55a2c2?q=80&w=2070" 
              alt="Bespoke Craftsmanship"
              fill
              className="object-cover"
              priority
            />
          </div>
        </section>

        {/* 第二部分：定制维度 (三列展示) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-40 py-20 border-t border-stone-100">
          {[
            { title: "Material Sourcing", desc: "We source premium Box, Epsom, and exotic leathers directly from specialized tanneries. Each hide is personally inspected to ensure the natural grain and structural integrity meet our production standards." },
            { title: "Workshop Craft", desc: "Every piece is finished with traditional saddle stitching and hand-painted edges. We focus on the precision of each stitch and the smoothness of the edge oil, ensuring the item remains durable for years to come." },
            { title: "Personalization", desc: "From custom dimensions to hot-stamping and hardware selection. We work directly with you to ensure the final product reflects your specific functional and aesthetic requirements." }
          ].map((item, i) => (
            <div key={i} className="space-y-6 text-center md:text-left">
              <h3 className="text-xl font-serif italic text-stone-900">{item.title}</h3>
              <p className="text-sm text-stone-500 font-light leading-relaxed uppercase tracking-wider">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* 第三部分：咨询表单 */}
        <section id="inquiry" className="max-w-4xl mx-auto">
          <div className="bg-[#FAF9F6] p-10 md:p-24 rounded-[3rem]">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif italic text-stone-900 mb-4">Start Your Creation</h2>
              <p className="text-stone-400 text-sm uppercase tracking-widest">Private Consultant Inquiry</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <input 
                  type="text" 
                  placeholder="Full Name *" 
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="bg-transparent border-b border-stone-200 py-4 focus:border-stone-900 outline-none transition text-stone-900 placeholder:text-stone-300 uppercase text-xs tracking-widest"
                />
                <input 
                  type="email" 
                  placeholder="Email Address *" 
                  required
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="bg-transparent border-b border-stone-200 py-4 focus:border-stone-900 outline-none transition text-stone-900 placeholder:text-stone-300 uppercase text-xs tracking-widest"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-stone-400">Preferred Leather</label>
                <select 
                  value={form.material}
                  onChange={e => setForm({...form, material: e.target.value})}
                  className="w-full bg-transparent border-b border-stone-200 py-4 focus:border-stone-900 outline-none transition text-stone-900 uppercase text-xs tracking-widest"
                >
                  <option value="calfskin">Togo / Epsom Calfskin</option>
                  <option value="box">Box Calf (Smooth)</option>
                  <option value="exotic">Exotic Skins (Crocodile/Lizard)</option>
                  <option value="unsure">Not sure yet</option>
                </select>
              </div>

              <textarea 
                placeholder="Tell us about your dream piece..." 
                rows={4}
                value={form.details}
                onChange={e => setForm({...form, details: e.target.value})}
                className="w-full bg-transparent border-b border-stone-200 py-4 focus:border-stone-900 outline-none transition text-stone-900 placeholder:text-stone-300 uppercase text-xs tracking-widest resize-none"
              />

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-stone-900 text-white py-6 uppercase tracking-[0.4em] text-[10px] hover:bg-stone-800 transition shadow-lg disabled:bg-stone-300"
              >
                {isSubmitting ? 'Sending...' : 'Request Consultation'}
              </button>
            </form>
          </div>
        </section>

        {/* 返回页脚 */}
        <div className="mt-32 text-center">
          <Link href="/" className="text-[10px] uppercase tracking-[0.3em] text-stone-400 border-b border-stone-200 pb-2 hover:text-stone-900 hover:border-stone-900 transition-all">
            Return to Collection
          </Link>
        </div>
      </div>
    </main>
  );
}