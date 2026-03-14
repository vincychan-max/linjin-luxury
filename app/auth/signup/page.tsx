'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  // ==================== 1. 自动重定向逻辑 (防止 Router 报错) ====================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/'); // 根据你的要求跳转到首页
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (session) return null;

  // ==================== 2. 处理函数 ====================
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    const isGoogle = provider === 'google';
    if (isGoogle) setIsGoogleLoading(true);
    else setIsFacebookLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsGoogleLoading(false);
      setIsFacebookLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    setIsMagicLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true,
      },
    });

    if (error) {
      setError('Failed to send link, please try again');
    } else {
      setError('✅ Magic link sent! Check your inbox');
    }
    setIsMagicLoading(false);
  };

  // ==================== 3. UI 渲染 ====================
  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 py-12">
        <div className="max-w-md text-center">
          <div className="text-green-500 text-7xl mb-8">✓</div>
          <h2 className="text-white text-4xl font-light mb-4 text-center tracking-widest uppercase">Account Created</h2>
          <p className="text-zinc-400 mb-10 leading-relaxed text-center">
            We’ve sent a verification email to your inbox.<br />
            Please check your email and click the link to complete registration.
          </p>
          <Link 
            href="/auth/signin"
            className="inline-block bg-white text-black px-10 py-4 rounded-2xl font-medium hover:bg-zinc-100 transition tracking-[2px]"
          >
            GO TO SIGN IN
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-white text-7xl font-thin tracking-[6px]">LINJIN</h1>
          <p className="text-amber-500/70 mt-3 tracking-[4px] text-sm">EST. 2026 • TIMELESS LUXURY</p>
        </div>

        <div className="bg-zinc-900/95 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-zinc-800">
          {/* 顶部 Tab */}
          <div className="flex bg-zinc-800 rounded-2xl p-1 mb-10">
            <Link
              href="/auth/signin"
              className="flex-1 text-center py-4 rounded-[14px] font-medium !text-white hover:bg-zinc-700 transition-all uppercase text-sm tracking-widest"
            >
              Sign In
            </Link>
            <div className="flex-1 text-center py-4 rounded-[14px] font-medium bg-white text-black shadow-sm uppercase text-sm tracking-widest">
              Create Account
            </div>
          </div>

          <h2 className="text-white text-4xl font-light text-center mb-10 tracking-widest uppercase">Join Us</h2>

          {error && (
            <div className={`text-sm p-4 rounded-2xl mb-8 text-center ${error.startsWith('✅') ? 'bg-green-900/20 border border-green-500/30 text-green-400' : 'bg-red-900/20 border border-red-500/30 text-red-400'}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-8">
            <div>
              <label className="text-zinc-400 text-sm block mb-2 font-light">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all duration-300"
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="relative">
              <label className="text-zinc-400 text-sm block mb-2 font-light">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all duration-300 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="text-zinc-400 text-sm block mb-2 font-light">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all duration-300 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-zinc-100 active:scale-[0.985] text-black font-medium tracking-[4px] py-4 rounded-2xl transition-all duration-300 disabled:opacity-50 uppercase"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} /> Creating account...
                </span>
              ) : (
                'CREATE ACCOUNT'
              )}
            </button>
          </form>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[3px]">
                <span className="bg-zinc-900 px-6 text-zinc-500">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={() => handleOAuth('google')}
                disabled={isGoogleLoading}
                className="flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 active:scale-[0.985] text-black border border-zinc-300 rounded-2xl py-3 transition-all duration-300 disabled:opacity-50 font-medium text-[15px]"
              >
                {isGoogleLoading ? <Loader2 className="animate-spin" size={20} /> : <span className="text-[27px] font-black" style={{ background: 'linear-gradient(to right, #4285F4, #EA4335, #FBBC05, #34A853)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>G</span>}
                <span>Google</span>
              </button>

              <button
                onClick={() => handleOAuth('facebook')}
                disabled={isFacebookLoading}
                className="flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166FE5] active:scale-[0.985] text-white rounded-2xl py-3 transition-all duration-300 disabled:opacity-50 font-medium text-[15px]"
              >
                {isFacebookLoading ? <Loader2 className="animate-spin" size={20} /> : <span className="text-[27px] font-black">f</span>}
                <span>Facebook</span>
              </button>
            </div>

            <button
              onClick={handleMagicLink}
              disabled={isMagicLoading}
              className="mt-6 w-full flex items-center justify-center gap-3 border border-zinc-600 hover:border-amber-400 text-white py-3 rounded-2xl transition-all duration-300 disabled:opacity-50 font-light text-[14px] tracking-wide"
            >
              {isMagicLoading ? <Loader2 className="animate-spin" size={20} /> : '✉️'}
              Sign up with Magic Link
            </button>
          </div>

          <div className="text-center mt-10">
            <Link href="/auth/signin" className="text-zinc-400 hover:text-white text-xs transition tracking-[2px] uppercase">
              Already have an account? <span className="underline decoration-1 underline-offset-4 text-white">Sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}