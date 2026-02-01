'use client';

import { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User, sendSignInLinkToEmail } from "firebase/auth";
import { auth } from '@/lib/firebase';  // 你的 Firebase 初始化文件（确保导出了 auth = getAuth(app)）

export default function AuthButtons() {
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setDropdownOpen(false);
    } catch (error) {
      console.error('Google sign in error:', error);
      alert('Google 登录失败，请重试');
    }
  };

  const signInWithEmail = async () => {
    const email = prompt('请输入邮箱接收登录链接');
    if (!email) return;

    try {
      const actionCodeSettings = {
        url: window.location.origin + '/auth/finish-signin',  // 需要创建一个 finish-signin 页面处理链接（或用 /）
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);  // 保存邮箱用于确认
      alert('登录链接已发送到邮箱，请检查！');
      setDropdownOpen(false);
    } catch (error) {
      console.error('Email sign in error:', error);
      alert('发送失败: ' + (error as Error).message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-4 text-white opacity-80">
        <span className="text-base">Hi, {user.displayName || user.email || 'My Account'}</span>
        <button onClick={handleSignOut} className="text-base hover:opacity-100 transition">
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 未登录：显示人头图标，点击弹出 dropdown */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="hover:opacity-100 transition text-2xl"
      >
        <i className="fas fa-user"></i>
      </button>

      {/* Dropdown 菜单（高端黑色+金色，只留 Google 和 Email） */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-4 w-64 bg-black text-white rounded-lg shadow-2xl z-50 border border-yellow-400/20">
          <div className="py-6 px-8 text-center">
            <h3 className="text-xl font-thin tracking-widest text-yellow-400 mb-6">SIGN IN</h3>
            <div className="space-y-4">
              <button
                onClick={() => {
                  signInWithGoogle();
                }}
                className="block w-full py-3 hover:bg-yellow-400/10 transition rounded"
              >
                Continue with Google
              </button>
              <button
                onClick={() => {
                  signInWithEmail();
                }}
                className="block w-full py-3 hover:bg-yellow-400/10 transition rounded"
              >
                Continue with Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 点击其他地方关闭 dropdown */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
      )}
    </div>
  );
}