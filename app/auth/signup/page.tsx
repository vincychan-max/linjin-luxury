'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../../lib/firebase';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      setError('Registration failed');
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
        <h1 className="text-4xl md:text-5xl font-thin tracking-widest text-center mb-16 opacity-90">
          LINJIN<br />LUXURY
        </h1>

        <h2 className="text-3xl md:text-4xl font-thin tracking-widest text-center mb-12">Create Account</h2>

        {error && <p className="text-red-500 text-center mb-8 text-lg">{error}</p>}

        <form onSubmit={handleSignUp} className="space-y-12">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full bg-transparent border-b-2 border-white/50 text-2xl md:text-3xl font-thin tracking-widest placeholder-white/50 focus:border-white focus:outline-none py-4 transition"
          />

          {/* 密码 + 眼图标 */}
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

          {/* 确认密码 + 眼图标 */}
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
              className="w-full bg-transparent border-b-2 border-white/50 text-2xl md:text-3xl font-thin tracking-widest placeholder-white/50 focus:border-white focus:outline-none py-4 pr-14 transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
            >
              <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-2xl`}></i>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black text-xl md:text-2xl uppercase tracking-widest py-6 hover:bg-gray-200 transition font-medium disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-12">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full border border-white text-xl md:text-2xl uppercase tracking-widest py-6 hover:bg-white/10 transition"
          >
            Continue with Google
          </button>
        </div>

        <p className="text-center mt-12 text-lg opacity-80">
          Already have an account?{' '}
          <Link href="/auth/signin" className="underline hover:opacity-60">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}