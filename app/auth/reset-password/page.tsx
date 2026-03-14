'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';           // ← 必须加上这一行
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要 6 个字符');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError('重置失败，请稍后重试');
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="text-green-500 text-7xl mb-8">✓</div>
          <h2 className="text-white text-4xl font-light mb-4">密码重置成功</h2>
          <p className="text-zinc-400 text-lg">正在跳转到登录页面...</p>
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
          <h2 className="text-white text-3xl font-light text-center mb-8">Set New Password</h2>

          {error && (
            <div className="bg-red-900/30 text-red-400 text-sm p-4 rounded-2xl mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-white transition"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-white transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-medium tracking-widest py-4 rounded-2xl hover:bg-zinc-200 transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'UPDATE PASSWORD'}
            </button>
          </form>

          <div className="text-center mt-8">
            <Link href="/auth/signin" className="text-zinc-400 hover:text-white text-sm transition">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}