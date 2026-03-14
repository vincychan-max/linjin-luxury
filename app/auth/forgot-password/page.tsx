'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!email) {
      setError('请输入邮箱地址');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`, // 重置成功后跳转的页面
    });

    if (error) {
      setError('发送失败，请检查邮箱是否正确');
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="text-green-500 text-7xl mb-8">✓</div>
          <h2 className="text-white text-4xl font-light mb-4">邮件已发送</h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            重置密码链接已发送至您的邮箱<br />
            请查收邮件并点击链接完成重置
          </p>
          <Link 
            href="/auth/signin"
            className="mt-10 inline-block border border-white/30 hover:border-white text-white px-10 py-4 rounded-2xl transition"
          >
            返回登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-white text-6xl font-thin tracking-[4px]">LINJIN</h1>
          <p className="text-zinc-500 mt-2 tracking-widest">LUXURY</p>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-10">
          <h2 className="text-white text-3xl font-light text-center mb-8">Forgot Password</h2>

          {error && (
            <div className="bg-red-900/30 text-red-400 text-sm p-4 rounded-2xl mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-white transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-medium tracking-widest py-4 rounded-2xl hover:bg-zinc-200 transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'SEND RESET LINK'}
            </button>
          </form>

          <div className="text-center mt-8">
            <Link href="/auth/signin" className="text-zinc-400 hover:text-white text-sm transition">
              Remember your password? <span className="underline">Sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}