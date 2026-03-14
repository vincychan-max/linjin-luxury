'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
// 1. 导入新的 Store
import { useWishlistStore } from '@/lib/store/useWishlistStore';

type SupabaseContextType = {
  session: Session | null;
  isLoading: boolean;
  supabase: typeof supabase;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. 从 Store 中提取必要的方法
  const fetchWishlistIds = useWishlistStore((state) => state.fetchWishlistIds);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  useEffect(() => {
    // 获取初始 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchWishlistIds(); // 如果初始就有 session，同步心愿单
      setIsLoading(false);
    });

    // 监听登录状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        // 登录成功：去后端拉取该用户的收藏 ID
        fetchWishlistIds();
      } else if (event === 'SIGNED_OUT') {
        // 退出登录：清空前端缓存的红心状态
        clearWishlist();
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchWishlistIds, clearWishlist]);

  return (
    <SupabaseContext.Provider value={{ session, isLoading, supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};