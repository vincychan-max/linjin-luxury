'use client'

import { supabase } from '../../lib/supabase'  // 你的相对路径（根据之前调整）
import { useState, useEffect } from 'react'

export default function AuthButtons() {
  const [user, setUser] = useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signInWithGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google' })
  const signInWithEmail = async () => {
    const email = prompt('请输入邮箱接收 magic link')
    if (email) {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) alert('发送失败: ' + error.message)
      else alert('Magic link 已发送到邮箱，请检查！')
    }
  }
  const signOut = () => supabase.auth.signOut()

  if (user) {
    return (
      <div className="flex items-center gap-4 text-white opacity-80">
        <span className="text-base">Hi, {user.email || user.user_metadata?.full_name || 'My Account'}</span>
        <button onClick={signOut} className="text-base hover:opacity-100 transition">
          Logout
        </button>
      </div>
    )
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
                  signInWithGoogle()
                  setDropdownOpen(false)
                }}
                className="block w-full py-3 hover:bg-yellow-400/10 transition rounded"
              >
                Continue with Google
              </button>
              <button
                onClick={() => {
                  signInWithEmail()
                  setDropdownOpen(false)
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
  )
}