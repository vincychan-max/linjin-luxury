'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../../lib/firebase'; // 你的 firebase 路径（或直接用 getAuth()）

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 新增：密码显示状态
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      setError('Email or password incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err: any) {
      setError('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <h1 className="text-4xl md:text-5xl font-thin tracking-widest text-center mb-16 opacity-90">
          LINJIN<br />LUXURY
        </h1>

        {/* 标题 */}
        <h2 className="text-3xl md:text-4xl font-thin tracking-widest text-center mb-12">Sign In</h2>

        {/* 错误提示 */}
        {error && (
          <p className="text-red-500 text-center mb-8 text-lg">{error}</p>
        )}

        {/* 表单 */}
        <form onSubmit={handleEmailSignIn} className="space-y-12">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full bg-transparent border-b-2 border-white/50 text-2xl md:text-3xl font-thin tracking-widest placeholder-white/50 focus:border-white focus:outline-none py-4 transition"
          />

          {/* 密码输入框 + 眼图标 */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full bg-transparent border-b-2 border-white/50 text-2xl md:text-3xl font-thin tracking-widest placeholder-white/50 focus:border-white focus:outline-none py-4 pr-14 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-2xl`}></i>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black text-xl md:text-2xl uppercase tracking-widest py-6 hover:bg-gray-200 transition font-medium disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Google 登录 */}
        <div className="mt-12">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full border border-white text-xl md:text-2xl uppercase tracking-widest py-6 hover:bg-white/10 transition"
          >
            Continue with Google
          </button>
        </div>

        {/* 注册链接 */}
        <p className="text-center mt-12 text-lg opacity-80">
          New to Linjin Luxury?{' '}
          <Link href="/auth/signup" className="underline hover:opacity-60">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}