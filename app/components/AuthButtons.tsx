'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// 使用最新的 SSR 包
import { createBrowserClient } from '@supabase/ssr';

// 初始化客户端
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function SignInPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [magicMessage, setMagicMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const email = watch('email');

  // 初始化 session 并监听状态变化
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      // 当检测到登录状态时，自动跳转到首页
      if (currentUser) {
        router.push('/');
        router.refresh();
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  // 普通邮箱+密码登录
  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    
    if (error) {
      setError('root', { message: error.message });
    } else {
      // 登录成功手动跳转到首页
      router.push('/');
      router.refresh();
    }
  };

  // OAuth 登录 (Google / Facebook)
  const handleOAuth = async (provider: 'google' | 'facebook') => {
    setLoadingProvider(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { 
        // 重定向到 callback 处理 Session
        redirectTo: `${window.location.origin}/auth/callback` 
      },
    });
    
    if (error) {
      setError('root', { message: error.message });
      setLoadingProvider(null);
    }
  };

  // 魔法链接登录
  const handleMagicLink = async () => {
    if (!email) {
      setError('email', { message: 'Please enter your email first' });
      return;
    }
    setLoadingProvider('magic');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    
    if (error) {
      setError('root', { message: 'Failed to send magic link' });
    } else {
      setMagicMessage('✅ Magic link sent! Check your inbox.');
    }
    setLoadingProvider(null);
  };

  // 如果已登录，则不渲染表单
  if (user) return null;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-white text-7xl font-thin tracking-[6px]">LINJIN</h1>
          <p className="text-amber-500/70 mt-3 tracking-[4px] text-sm">EST. 2026 • TIMELESS LUXURY</p>
        </div>

        <div className="bg-zinc-900/95 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-zinc-800">
          {/* 顶部切换按钮 */}
          <div className="flex bg-zinc-800 rounded-2xl p-1 mb-10">
            <div className="flex-1 text-center py-4 rounded-[14px] font-medium bg-white text-black shadow-sm">
              Sign In
            </div>
            <Link
              href="/auth/signup"
              className="flex-1 text-center py-4 rounded-[14px] font-medium text-white hover:bg-zinc-700 transition-all"
            >
              Create an Account
            </Link>
          </div>

          <h2 className="text-white text-4xl font-light text-center mb-10 tracking-wide">Sign In</h2>

          {errors.root && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 text-sm p-4 rounded-2xl mb-8 text-center">
              {errors.root.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <label className="text-zinc-400 text-sm block mb-2">Email Address</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all duration-300"
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <label className="text-zinc-400 text-sm block mb-2">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all duration-300 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white hover:bg-zinc-100 active:scale-[0.985] text-black font-medium tracking-widest py-4 rounded-2xl transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} /> Signing in...
                </span>
              ) : (
                'SIGN IN'
              )}
            </button>

            <div className="text-left mt-1 pl-1">
              <Link href="/auth/forgot-password" className="text-white hover:text-amber-400 text-sm transition">
                Forgot Password?
              </Link>
            </div>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-6 text-zinc-500">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <button
              onClick={() => handleOAuth('google')}
              disabled={loadingProvider === 'google'}
              className="flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 active:scale-[0.985] text-black border border-zinc-300 rounded-2xl py-3 transition-all duration-300 disabled:opacity-50 font-medium text-[15px]"
            >
              {loadingProvider === 'google' ? <Loader2 className="animate-spin" size={20} /> : <span className="font-bold text-lg">G</span>}
              <span>Google</span>
            </button>

            <button
              onClick={() => handleOAuth('facebook')}
              disabled={loadingProvider === 'facebook'}
              className="flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166FE5] active:scale-[0.985] text-white rounded-2xl py-3 transition-all duration-300 disabled:opacity-50 font-medium text-[15px]"
            >
              {loadingProvider === 'facebook' ? <Loader2 className="animate-spin" size={20} /> : <span className="font-bold text-lg">f</span>}
              <span>Facebook</span>
            </button>
          </div>

          <button
            onClick={handleMagicLink}
            disabled={loadingProvider === 'magic'}
            className="mt-6 w-full flex items-center justify-center gap-3 border border-zinc-600 hover:border-amber-400 text-white py-3 rounded-2xl transition-all duration-300 disabled:opacity-50 font-light text-[15px]"
          >
            {loadingProvider === 'magic' ? <Loader2 className="animate-spin" size={20} /> : '✉️ Magic Link'}
          </button>
          {magicMessage && <p className="text-green-400 text-sm mt-2 text-center">{magicMessage}</p>}
        </div>
      </div>
    </div>
  );
}