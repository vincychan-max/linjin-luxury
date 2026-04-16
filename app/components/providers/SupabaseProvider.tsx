'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Session } from '@supabase/supabase-js';
import { useWishlistStore } from '@/lib/store/useWishlistStore';

type SupabaseContextType = {
  supabase: ReturnType<typeof createBrowserClient>;
  session: Session | null;
  isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ==================== 调试环境变量 ====================
  const [supabase] = useState(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('🔍 Supabase Environment Check:');
    console.log('NEXT_PUBLIC_SUPABASE_URL =', url ? url.substring(0, 50) + '...' : '❌ UNDEFINED');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists =', !!key);

    if (!url) {
      console.error('❌ 严重错误：NEXT_PUBLIC_SUPABASE_URL 未定义！');
    }
    if (!key) {
      console.error('❌ 严重错误：NEXT_PUBLIC_SUPABASE_ANON_KEY 未定义！');
    }

    return createBrowserClient(url || '', key || '');
  });

  const fetchWishlistIds = useWishlistStore((state) => state.fetchWishlistIds);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(session);
          if (session?.user) fetchWishlistIds();
        }
      } catch (err) {
        console.error('Initial session error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      setSession(session);

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session?.user) fetchWishlistIds();
      } else if (event === 'SIGNED_OUT') {
        clearWishlist();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchWishlistIds, clearWishlist]);

  return (
    <SupabaseContext.Provider value={{ supabase, session, isLoading }}>
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