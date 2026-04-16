'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { useCart } from '@/lib/cartStore';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '../providers/SupabaseProvider';
import { useSwipeable } from 'react-swipeable';
import { ErrorBoundary } from 'react-error-boundary';

// 引入数据与组件
import { mainMenuItems, secondaryMenus } from './menuData';
import type { SubItem, SecondaryMenu } from './menuData';
import { SearchOverlay, MenuDrawer, UserDrawer, ContactDrawer } from './Drawers';

interface HeaderProps {
  forcedTheme?: 'dark' | 'light';
}

export default function Header({ forcedTheme }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useSupabase();
  const { getTotalItems } = useCart();
  const { wishlistIds, fetchWishlistIds } = useWishlistStore();

  const [isMounted, setIsMounted] = useState(false);
  const [menuLevel, setMenuLevel] = useState<'main' | 'secondary' | 'tertiary'>('main');
  const [currentSecondary, setCurrentSecondary] = useState<SecondaryMenu>({ label: '', items: [] });
  const [currentTertiary, setCurrentTertiary] = useState<{ label: string; items: SubItem[] }>({ label: '', items: [] });
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [contactMenuOpen, setContactMenuOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [headerSolid, setHeaderSolid] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const initialTheme = forcedTheme || (pathname === '/' ? 'dark' : 'light');
  const isWhiteText = !headerSolid && initialTheme === 'dark';

  const textColor = isWhiteText ? 'text-white' : 'text-black';
  const iconColor = isWhiteText ? 'text-white' : 'text-black';
  const burgerColor = isWhiteText ? 'bg-white' : 'bg-black';

  const textShadowStyle = isWhiteText ? { textShadow: '0px 1px 4px rgba(0,0,0,0.25)' } : {};

  const closeAllMenus = useCallback(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
    setContactMenuOpen(false);
    setMenuLevel('main');
    if (typeof document !== 'undefined') document.body.style.overflow = '';
  }, []);

  useEffect(() => {
    setIsMounted(true);
    if (fetchWishlistIds) fetchWishlistIds();
  }, [fetchWishlistIds]);

  useEffect(() => {
    const handleScroll = () => setHeaderSolid(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openSecondary = (key: string) => {
    if (secondaryMenus && secondaryMenus[key]) {
      setCurrentSecondary(secondaryMenus[key]);
      setMenuLevel('secondary');
    }
  };

  const openTertiary = (subItems: SubItem[], label: string) => {
    setCurrentTertiary({ label, items: subItems });
    setMenuLevel('tertiary');
  };

  const swipeHandlers = useSwipeable({ onSwipedRight: closeAllMenus });

  return (
    <ErrorBoundary fallback={<div className="p-4 text-center">Navigation Error</div>}>
      <header 
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700
          ${headerSolid ? 'bg-white/95 backdrop-blur-md py-4 border-b border-black/5 shadow-sm' : 'bg-transparent py-7'}`}
      >
        {isWhiteText && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none -z-10 h-32" />
        )}

        <div className={`max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between transition-colors duration-500 ${textColor}`}>
          
          {/* 1. 左侧：Menu (优化后的交互动画) */}
          <div className="flex items-center gap-6 md:gap-10 flex-1">
            <button 
              onClick={() => setMenuOpen(true)} 
              className="group flex items-center gap-3 outline-none"
              aria-label="Open Menu"
            >
              <div className="flex flex-col gap-[7px] items-start w-8 overflow-hidden">
                {/* 第一横：旋转动效预备 */}
                <span className={`h-[1px] transition-all duration-500 ease-in-out ${burgerColor} 
                  ${headerSolid ? 'w-6' : 'w-8'} group-hover:w-8`}></span>
                
                {/* 第二横：向左滑动淡出动效 */}
                <span className={`h-[1px] transition-all duration-500 ease-in-out ${burgerColor} 
                  ${headerSolid ? 'w-4' : 'w-5'} group-hover:translate-x-[-100%] group-hover:opacity-0`}></span>
                
                {/* 第三横：旋转动效预备 */}
                <span className={`h-[1px] transition-all duration-500 ease-in-out ${burgerColor} 
                  ${headerSolid ? 'w-6' : 'w-8'} group-hover:w-8`}></span>
              </div>
              <span style={textShadowStyle} className="hidden lg:block text-[10px] tracking-[4px] font-medium uppercase opacity-80 group-hover:opacity-100 transition-opacity">
                Menu
              </span>
            </button>

            <button 
              onClick={() => setContactMenuOpen(true)}
              style={textShadowStyle}
              className="hidden md:block text-[10px] tracking-[4px] font-medium uppercase hover:opacity-50 transition-opacity outline-none"
            >
              Contact
            </button>
          </div>

          {/* 2. 中间：Logo (响应式字号与字距优化) */}
          <div className="flex justify-center transition-all duration-700">
            <Link href="/" className="outline-none">
              <h1 
                style={textShadowStyle}
                className={`font-thin transition-all duration-700 text-center leading-none
                ${headerSolid 
                  ? 'text-xl md:text-3xl tracking-[12px] md:tracking-[22px]' 
                  : 'text-2xl md:text-5xl tracking-[15px] md:tracking-[28px]'
                }`}>
                LINJIN
              </h1>
            </Link>
          </div>

          {/* 右侧：图标区 */}
          <div className={`flex items-center gap-4 md:gap-8 flex-1 justify-end ${iconColor}`}>
            <button onClick={() => setSearchOpen(true)} className="p-1.5 hover:opacity-50 transition-opacity">
              <i style={textShadowStyle} className="fas fa-search text-xl"></i>
            </button>

            <Link href="/wishlist" className="relative p-1.5 hover:opacity-50 transition-opacity hidden md:block">
              <i style={textShadowStyle} className="far fa-heart text-xl"></i>
              {isMounted && wishlistIds.length > 0 && (
                <span 
                  className="absolute top-1.5 right-1 w-2 h-2 rounded-full border border-white"
                  style={{ backgroundColor: '#ff0000', display: 'block' }} 
                />
              )}
            </Link>
            
            <Link href="/cart" className="relative p-1.5 hover:opacity-50 transition-opacity">
              <i style={textShadowStyle} className="fas fa-shopping-bag text-xl"></i>
              {isMounted && getTotalItems() > 0 && (
                <span className={`absolute -top-1 -right-1 ${headerSolid ? 'bg-black text-white' : 'bg-white text-black'} text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold transition-colors shadow-sm`}>
                  {getTotalItems()}
                </span>
              )}
            </Link>

            <button onClick={() => setUserMenuOpen(true)} className="p-1.5 hover:opacity-50 transition-opacity">
               {session?.user ? (
                 <div className="w-6 h-6 rounded-full overflow-hidden border border-black/10">
                   <img src={session.user.user_metadata?.avatar_url || '/default-avatar.png'} alt="User" className="w-full h-full object-cover" />
                 </div>
               ) : (
                 <i style={textShadowStyle} className="far fa-user text-xl"></i>
               )}
            </button>
          </div>
        </div>
      </header>

      {/* 弹窗组件逻辑保持不变 */}
      <SearchOverlay isOpen={searchOpen} onClose={closeAllMenus} query={searchQuery} setQuery={setSearchQuery} onSearch={() => {
        if (searchQuery.trim()) { router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`); closeAllMenus(); }
      }} suggestions={[]} inputRef={searchInputRef} />
      <MenuDrawer isOpen={menuOpen} onClose={closeAllMenus} menuLevel={menuLevel} mainMenuItems={mainMenuItems} secondaryMenus={secondaryMenus} currentSecondary={currentSecondary} currentTertiary={currentTertiary} openSecondary={openSecondary} openTertiary={openTertiary} backToMain={() => setMenuLevel('main')} backToSecondary={() => setMenuLevel('secondary')} swipeHandlers={swipeHandlers} />
      <UserDrawer isOpen={userMenuOpen} onClose={closeAllMenus} session={session} onLogout={async () => { await supabase.auth.signOut(); closeAllMenus(); router.refresh(); }} />
      <ContactDrawer isOpen={contactMenuOpen} onClose={closeAllMenus} onOpenWhatsapp={() => {}} />
    </ErrorBoundary>
  );
}