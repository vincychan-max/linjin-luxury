'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  const handleReset = async () => {
    if (!email) {
      setError('请输入邮箱');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('重置密码邮件已发送，请检查邮箱（包括垃圾邮件）');
    } catch (err: any) {
      setError(err.message || '发送失败，请检查邮箱是否注册');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-12">
      <div className="max-w-md w-full p-12 border rounded-xl shadow-2xl">
        <h1 className="text-5xl font-thin tracking-widest text-center mb-16">重置密码</h1>
        {error && <p className="text-red-600 text-center mb-8">{error}</p>}
        {success && <p className="text-green-500 text-center mb-8">{success}</p>}

        <input
          type="email"
          placeholder="注册邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent border-b border-white/50 py-4 mb-12 text-xl focus:outline-none"
        />
        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-white text-black py-4 text-xl uppercase tracking-widest mb-8 disabled:opacity-50"
        >
          {loading ? '发送中...' : '发送重置邮件'}
        </button>

        <p className="text-center mt-8 opacity-60">
          想起密码了？ <Link href="/auth/signin" className="underline hover:opacity-100">登录</Link>
        </p>
      </div>
    </div>
  );
}