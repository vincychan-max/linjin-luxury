'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cartStore';

export function CartHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // 客户端挂载后，手动触发 Zustand 的水合
    useCart.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  // 这个组件不渲染任何可见 UI，只负责在后台静默恢复状态
  return null; 
}