'use client';

import React, { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { useCart } from '../../lib/cartStore';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '../components/providers/SupabaseProvider';
import { useSwipeable } from 'react-swipeable';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'; // 新增：错误边界，确保已安装 npm install react-error-boundary

type SubItem = { label: string; href: string };
type SecondaryItem = { label: string; href?: string; sub?: SubItem[] };
type SecondaryMenu = { label: string; items: SecondaryItem[] };

// ==================== 获取头像辅助函数 ====================
const getAvatarUrl = (user: any) => {
  if (!user) return '/default-avatar.png';
  if (user.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
  if (user.identities?.[0]?.identity_data?.avatar_url) return user.identities[0].identity_data.avatar_url;
  if (user.user_metadata?.picture) return user.user_metadata.picture;
  return '/default-avatar.png';
};

// ==================== 菜单数据 ====================
const secondaryMenus: Record<string, SecondaryMenu> = {
  newIn: {
    label: 'New In',
    items: [
      { label: 'All New Arrivals', href: '/new-in' },
      { label: 'Women’s New Arrivals', sub: [
        { label: 'All Women’s New', href: '/new-in/women' },
        { label: 'Handbags', href: '/new-in/women/handbags' },
        { label: 'Shoes', href: '/new-in/women/shoes' },
        { label: 'Ready-to-Wear', href: '/new-in/women/ready-to-wear' },
        { label: 'Jewelry', href: '/new-in/women/jewelry' },
        { label: 'Accessories', href: '/new-in/women/accessories' },
        { label: 'Small Leather Goods', href: '/new-in/women/small-leather-goods' },
      ]},
      { label: 'Men’s New Arrivals', sub: [
        { label: 'All Men’s New', href: '/new-in/men' },
        { label: 'Bags', href: '/new-in/men/bags' },
        { label: 'Shoes', href: '/new-in/men/shoes' },
        { label: 'Suits & Tailoring', href: '/new-in/men/suits-tailoring' },
        { label: 'Accessories', href: '/new-in/men/accessories' },
        { label: 'Small Leather Goods', href: '/new-in/men/small-leather-goods' },
      ]},
      { label: 'Small Leather Goods', href: '/new-in/small-leather-goods' },
      { label: 'Travel', href: '/new-in/travel-lifestyle' },
      { label: 'Limited Editions', href: '/new-in/limited-editions' },
    ],
  },
  women: { label: 'Women', items: [
    { label: 'Handbags', sub: [
      { label: 'All Handbags', href: '/women/handbags' },
      { label: 'Crossbody', href: '/women/handbags/crossbody' },
      { label: 'Shoulder Bag', href: '/women/handbags/shoulder-bag' },
      { label: 'Mini Bags', href: '/women/handbags/mini-bags' },
      { label: 'Totes', href: '/women/handbags/totes' },
      { label: 'Clutches', href: '/women/handbags/clutches' },
      { label: 'Hobo Bag', href: '/women/handbags/hobo-bag' },
      { label: 'Bucket Bag', href: '/women/handbags/bucket-bag' },
      { label: 'Backpack', href: '/women/handbags/backpack' },
      { label: 'Top Handles', href: '/women/handbags/top-handles' },
      { label: 'Belt Bags', href: '/women/handbags/belt-bags' },
      { label: 'Trunk Inspired', href: '/women/handbags/trunk-inspired' },
    ]},
    { label: 'Shoes', sub: [
      { label: 'All Shoes', href: '/women/shoes' },
      { label: 'Heels', href: '/women/shoes/heels' },
      { label: 'Sneakers', href: '/women/shoes/sneakers' },
      { label: 'Boots', href: '/women/shoes/boots' },
      { label: 'Sandals', href: '/women/shoes/sandals' },
      { label: 'Flats', href: '/women/shoes/flats' },
    ]},
    { label: 'Ready-to-Wear', sub: [
      { label: 'All Ready-to-Wear', href: '/women/ready-to-wear' },
      { label: 'Dresses', href: '/women/ready-to-wear/dresses' },
      { label: 'Tops & Blouses', href: '/women/ready-to-wear/tops-blouses' },
      { label: 'Pants & Skirts', href: '/women/ready-to-wear/pants-skirts' },
      { label: 'Outerwear', href: '/women/ready-to-wear/outerwear' },
      { label: 'Knitwear', href: '/women/ready-to-wear/knitwear' },
    ]},
    { label: 'Jewelry', sub: [
      { label: 'All Jewelry', href: '/women/jewelry' },
      { label: 'Necklaces', href: '/women/jewelry/necklaces' },
      { label: 'Earrings', href: '/women/jewelry/earrings' },
      { label: 'Bracelets', href: '/women/jewelry/bracelets' },
      { label: 'Rings', href: '/women/jewelry/rings' },
      { label: 'Brooches', href: '/women/jewelry/brooches' },
    ]},
    { label: 'Accessories', sub: [
      { label: 'All Accessories', href: '/women/accessories' },
      { label: 'Sunglasses', href: '/women/accessories/sunglasses' },
      { label: 'Scarves & Shawls', href: '/women/accessories/scarves' },
      { label: 'Hats', href: '/women/accessories/hats' },
      { label: 'Belts', href: '/women/accessories/belts' },
      { label: 'Gloves', href: '/women/accessories/gloves' },
    ]},
  ]},
  men: { label: 'Men', items: [
    { label: 'Suits & Tailoring', sub: [
      { label: 'All Suits', href: '/men/suits-tailoring' },
      { label: 'Formal Suits', href: '/men/suits-tailoring/formal' },
      { label: 'Casual Suits', href: '/men/suits-tailoring/casual' },
      { label: 'Blazers', href: '/men/suits-tailoring/blazers' },
      { label: 'Trousers', href: '/men/suits-tailoring/trousers' },
      { label: 'Shirts', href: '/men/suits-tailoring/shirts' },
    ]},
    { label: 'Bags', sub: [
      { label: 'All Bags', href: '/men/bags' },
      { label: 'Briefcases', href: '/men/bags/briefcases' },
      { label: 'Backpacks', href: '/men/bags/backpacks' },
      { label: 'Messenger Bags', href: '/men/bags/messenger-bags' },
      { label: 'Totes', href: '/men/bags/totes' },
      { label: 'Crossbody Bags', href: '/men/bags/crossbody-bags' },
    ]},
    { label: 'Shoes', sub: [
      { label: 'All Shoes', href: '/men/shoes' },
      { label: 'Dress Shoes', href: '/men/shoes/dress' },
      { label: 'Sneakers', href: '/men/shoes/sneakers' },
      { label: 'Boots', href: '/men/shoes/boots' },
      { label: 'Loafers', href: '/men/shoes/loafers' },
      { label: 'Sandals', href: '/men/shoes/sandals' },
    ]},
    { label: 'Accessories', sub: [
      { label: 'All Accessories', href: '/men/accessories' },
      { label: 'Ties', href: '/men/accessories/ties' },
      { label: 'Belts', href: '/men/accessories/belts' },
      { label: 'Wallets', href: '/men/accessories/wallets' },
      { label: 'Sunglasses', href: '/men/accessories/sunglasses' },
      { label: 'Watches', href: '/men/accessories/watches' },
    ]},
  ]},
  smallLeatherGoods: { label: 'Small Leather Goods', items: [
    { label: 'Women', sub: [
      { label: 'All Women\'s SLG', href: '/small-leather-goods/women' },
      { label: 'Wallets', href: '/small-leather-goods/women/wallets' },
      { label: 'Card Holders', href: '/small-leather-goods/women/card-holders' },
      { label: 'Pouches', href: '/small-leather-goods/women/pouches' },
      { label: 'Key Holders', href: '/small-leather-goods/women/key-holders' },
      { label: 'Tech Accessories', href: '/small-leather-goods/women/tech-accessories' },
    ]},
    { label: 'Men', sub: [
      { label: 'All Men\'s SLG', href: '/small-leather-goods/men' },
      { label: 'Wallets', href: '/small-leather-goods/men/wallets' },
      { label: 'Card Holders', href: '/small-leather-goods/men/card-holders' },
      { label: 'Pouches', href: '/small-leather-goods/men/pouches' },
      { label: 'Key Holders', href: '/small-leather-goods/men/key-holders' },
      { label: 'Tech Accessories', href: '/small-leather-goods/men/tech-accessories' },
    ]},
  ]},
  travelLifestyle: { label: 'Travel & Lifestyle', items: [
    { label: 'Luggage', sub: [
      { label: 'All Luggage', href: '/travel-lifestyle/luggage' },
      { label: 'Hard Shell', href: '/travel-lifestyle/luggage/hard-shell' },
      { label: 'Soft Shell', href: '/travel-lifestyle/luggage/soft-shell' },
      { label: 'Carry-On', href: '/travel-lifestyle/luggage/carry-on' },
      { label: 'Checked', href: '/travel-lifestyle/luggage/checked' },
    ]},
    { label: 'Travel Bags', href: '/travel-lifestyle/travel-bags' },
    { label: 'Travel Accessories', href: '/travel-lifestyle/travel-accessories' },
    { label: 'Home & Living', href: '/travel-lifestyle/home-living' },
  ]},
  accessories: { label: 'Accessories', items: [
    { label: 'Women', sub: [
      { label: 'All Women’s Accessories', href: '/accessories/women' },
      { label: 'Belts', href: '/accessories/women/belts' },
      { label: 'Scarves & Shawls', href: '/accessories/women/scarves' },
      { label: 'Sunglasses', href: '/accessories/women/sunglasses' },
      { label: 'Hats & Hair Accessories', href: '/accessories/women/hats' },
      { label: 'Gloves', href: '/accessories/women/gloves' },
      { label: 'Fine Jewelry', href: '/accessories/women/jewelry' },
      { label: 'Tech Accessories', href: '/accessories/women/tech' },
    ]},
    { label: 'Men', sub: [
      { label: 'All Men’s Accessories', href: '/accessories/men' },
      { label: 'Belts', href: '/accessories/men/belts' },
      { label: 'Ties & Pocket Squares', href: '/accessories/men/ties' },
      { label: 'Sunglasses', href: '/accessories/men/sunglasses' },
      { label: 'Hats & Caps', href: '/accessories/men/hats' },
      { label: 'Wallets', href: '/accessories/men/wallets' },
      { label: 'Cufflinks', href: '/accessories/men/cufflinks' },
      { label: 'Gloves', href: '/accessories/men/gloves' },
    ]},
  ]},
  beauty: { label: 'Beauty', items: [
    { label: 'Makeup', sub: [
      { label: 'All Makeup', href: '/beauty/makeup' },
      { label: 'Lipstick', href: '/beauty/makeup/lipstick' },
      { label: 'Foundation & Concealer', href: '/beauty/makeup/foundation' },
      { label: 'Eyeshadow & Eyeliner', href: '/beauty/makeup/eyeshadow' },
      { label: 'Mascara', href: '/beauty/makeup/mascara' },
      { label: 'Blush & Highlighter', href: '/beauty/makeup/blush' },
      { label: 'Nails', href: '/beauty/makeup/nails' },
    ]},
    { label: 'Skincare', sub: [
      { label: 'All Skincare', href: '/beauty/skincare' },
      { label: 'Moisturizers & Creams', href: '/beauty/skincare/moisturizers' },
      { label: 'Serums & Treatments', href: '/beauty/skincare/serums' },
      { label: 'Cleansers & Toners', href: '/beauty/skincare/cleansers' },
      { label: 'Masks & Exfoliators', href: '/beauty/skincare/masks' },
      { label: 'Eye Care', href: '/beauty/skincare/eye-care' },
    ]},
    { label: 'Brushes & Tools', href: '/beauty/tools' },
    { label: 'New Arrivals', href: '/beauty/new-in' },
    { label: 'Best Sellers', href: '/beauty/best-sellers' },
  ]},
  fragrance: { label: 'Fragrance', items: [
    { label: 'All Fragrance', href: '/fragrance' },
    { label: 'Women’s Fragrance', sub: [
      { label: 'All Women’s', href: '/fragrance/women' },
      { label: 'Floral', href: '/fragrance/women/floral' },
      { label: 'Oriental', href: '/fragrance/women/oriental' },
      { label: 'Fresh', href: '/fragrance/women/fresh' },
      { label: 'New Arrivals', href: '/fragrance/women/new-in' },
    ]},
    { label: 'Men’s Fragrance', sub: [
      { label: 'All Men’s', href: '/fragrance/men' },
      { label: 'Woody', href: '/fragrance/men/woody' },
      { label: 'Citrus', href: '/fragrance/men/citrus' },
      { label: 'Spicy', href: '/fragrance/men/spicy' },
      { label: 'New Arrivals', href: '/fragrance/men/new-in' },
    ]},
    { label: 'Unisex Fragrance', href: '/fragrance/unisex' },
    { label: 'Home Fragrance', href: '/fragrance/home' },
    { label: 'Best Sellers', href: '/fragrance/best-sellers' },
  ]},
  limitedEditions: { label: 'Limited Editions', items: [
    { label: 'All Limited Editions', href: '/limited-editions' },
    { label: 'Capsule Collections', sub: [
      { label: 'View All Capsules', href: '/limited-editions/capsule' },
      { label: 'Spring/Summer 2025', href: '/limited-editions/capsule/ss25' },
      { label: 'Fall/Winter 2024', href: '/limited-editions/capsule/fw24' },
      { label: 'Holiday Collection', href: '/limited-editions/capsule/holiday' },
    ]},
    { label: 'Artist Collaborations', sub: [
      { label: 'View All Collaborations', href: '/limited-editions/collaborations' },
      { label: 'With Murakami', href: '/limited-editions/collaborations/murakami' },
      { label: 'With Yayoi Kusama', href: '/limited-editions/collaborations/kusama' },
      { label: 'With Jeff Koons', href: '/limited-editions/collaborations/koons' },
    ]},
    { label: 'Monogram Special Editions', sub: [
      { label: 'View All Special Editions', href: '/limited-editions/special' },
      { label: 'Multicolor Monogram', href: '/limited-editions/special/multicolor' },
      { label: 'Denim Editions', href: '/limited-editions/special/denim' },
      { label: 'Metallic & Exotic Leather', href: '/limited-editions/special/exotic' },
    ]},
    { label: 'New Arrivals', href: '/limited-editions/new-in' },
    { label: 'Coming Soon', href: '/limited-editions/coming-soon' },
  ]},
  giftsPersonalization: { label: 'Gifts & Personalization', items: [
    { label: 'Gift Ideas', href: '/gifts/gift-ideas' },
    { label: 'For Her', href: '/gifts/for-her' },
    { label: 'For Him', href: '/gifts/for-him' },
    { label: 'Monogramming', href: '/personalization/monogramming' },
    { label: 'Engraving', href: '/personalization/engraving' },
  ]},
};

const mainMenuItems = [
  { label: 'New In', key: 'newIn' },
  { label: 'Women', key: 'women' },
  { label: 'Men', key: 'men' },
  { label: 'Small Leather Goods', key: 'smallLeatherGoods' },
  { label: 'Travel & Lifestyle', key: 'travelLifestyle' },
  { label: 'Accessories', key: 'accessories' },
  { label: 'Beauty', key: 'beauty' },
  { label: 'Fragrance', key: 'fragrance' },
  { label: 'Gifts & Personalization', key: 'giftsPersonalization' },
  { label: 'Limited Editions', key: 'limitedEditions' },
  { label: 'World of LJL', href: '/world-of-ljl' },
];

// 新增：错误边界 fallback 组件
const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
  <div role="alert" className="text-red-500 p-4">
    <p>Something went wrong in the header:</p>
    <pre>{(error as Error).message}</pre> // 修改：显式转换为 Error 类型
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);
ErrorFallback.displayName = 'ErrorFallback'; // 添加 displayName 修复 ESLint 报错

// 新增：提取菜单抽屉组件以提升维护性
const MenuDrawer = React.memo(({ menuOpen, menuLevel, currentSecondary, currentTertiary, closeAllMenus, openSecondary, openTertiary, backToMain, backToSecondary, swipeHandlers }: {
  menuOpen: boolean;
  menuLevel: 'main' | 'secondary' | 'tertiary';
  currentSecondary: SecondaryMenu;
  currentTertiary: { label: string; items: SubItem[] };
  closeAllMenus: () => void;
  openSecondary: (key: string) => void;
  openTertiary: (subItems: SubItem[], label: string) => void;
  backToMain: () => void;
  backToSecondary: () => void;
  swipeHandlers: any;
}) => {
  if (!menuOpen) return null;
  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-xl z-[300]" onClick={closeAllMenus}>
      <div 
        className="absolute right-0 top-0 h-full w-full md:max-w-md bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.05)] p-8 md:p-12 overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
        {...swipeHandlers}
        role="menu" // a11y: role
        aria-label="Main Menu"
      >
        <div className="flex justify-end mb-12">
          <button onClick={closeAllMenus} className="group flex items-center gap-2 text-[10px] tracking-[3px] uppercase font-light hover:opacity-50 transition-all text-black outline-none">
            Close <i className="fas fa-times text-[10px]"></i>
          </button>
        </div>

        {menuLevel === 'main' && (
          <div className="flex flex-col gap-8 text-xl font-light tracking-[3px] uppercase text-black">
            {mainMenuItems.map((item) => (
              item.href ? (
                <Link key={item.label} href={item.href} title={item.label} onClick={closeAllMenus} className="hover:pl-4 transition-all outline-none" aria-label={item.label}>{item.label}</Link>
              ) : (
                <button key={item.label} onClick={() => openSecondary(item.key!)} className="text-left flex justify-between items-center hover:pl-4 transition-all group outline-none" aria-label={`Open ${item.label} submenu`}>
                  {item.label} <i className="fas fa-chevron-right text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </button>
              )
            ))}
          </div>
        )}

        {menuLevel === 'secondary' && (
          <div className="animate-in slide-in-from-right">
            <button onClick={backToMain} className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[3px] text-black/40 hover:text-black transition-colors outline-none" aria-label="Back to main menu">
              <i className="fas fa-arrow-left"></i> Back
            </button>
            <h2 className="text-2xl font-extralight mb-10 uppercase tracking-[4px] text-black border-b border-black/10 pb-4">{currentSecondary.label}</h2>
            <div className="flex flex-col gap-8 text-lg font-light tracking-[2px] uppercase text-black">
              {currentSecondary.items.map((item) => (
                item.sub ? (
                  <button key={item.label} onClick={() => openTertiary(item.sub!, item.label)} className="text-left flex justify-between hover:pl-4 transition-all group outline-none" aria-label={`Open ${item.label} submenu`}>
                    {item.label} <i className="fas fa-chevron-right text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
                  </button>
                ) : (
                  <Link key={item.label} href={item.href!} title={item.label} onClick={closeAllMenus} className="hover:pl-4 transition-all outline-none" aria-label={item.label}>{item.label}</Link>
                )
              ))}
            </div>
          </div>
        )}

        {menuLevel === 'tertiary' && (
          <div className="animate-in slide-in-from-right">
            <button onClick={backToSecondary} className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[3px] text-black/40 hover:text-black transition-colors outline-none" aria-label="Back to secondary menu">
              <i className="fas fa-arrow-left"></i> Back
            </button>
            <h2 className="text-2xl font-extralight mb-10 uppercase tracking-[4px] text-black border-b border-black/10 pb-4">{currentTertiary.label}</h2>
            <div className="flex flex-col gap-8 text-lg font-light tracking-[2px] uppercase text-black">
              {currentTertiary.items.map((item) => (
                <Link key={item.label} href={item.href} title={item.label} onClick={closeAllMenus} className="hover:pl-4 transition-all outline-none" aria-label={item.label}>{item.label}</Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
MenuDrawer.displayName = 'MenuDrawer'; // 添加 displayName 修复 ESLint 报错

// 新增：提取用户抽屉组件
const UserDrawer = React.memo(({ userMenuOpen, session, closeAllMenus, handleLogout, swipeHandlers, setUserMenuOpen }: {
  userMenuOpen: boolean;
  session: any;
  closeAllMenus: () => void;
  handleLogout: () => Promise<void>;
  swipeHandlers: any;
  setUserMenuOpen: (open: boolean) => void; // 添加以修复 setUserMenuOpen 未定义
}) => {
  if (!userMenuOpen) return null;
  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-xl z-[400]" onClick={() => setUserMenuOpen(false)}>
      <div 
        className="absolute right-0 top-0 h-full w-full md:max-w-md bg-white p-8 md:p-12 shadow-[-20px_0_50px_rgba(0,0,0,0.05)] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
        {...swipeHandlers}
        role="dialog" // a11y: role
        aria-label="User Account Menu"
      >
        <div className="flex justify-end mb-12">
          <button onClick={() => setUserMenuOpen(false)} className="group flex items-center gap-2 text-[10px] tracking-[3px] uppercase font-light hover:opacity-50 transition-all text-black outline-none" aria-label="Close user menu">
            Close <i className="fas fa-times text-[10px]"></i>
          </button>
        </div>

        <div className="mb-10 text-center">
          <h2 className="text-2xl md:text-3xl font-extralight tracking-[6px] uppercase mb-3 text-black">My Account</h2>
          <div className="w-8 h-[1px] bg-black mx-auto"></div>
        </div>

        <div className="flex flex-col gap-8 text-black">
          {session?.user ? (
            <>
              <div className="flex flex-col items-center gap-4 mb-6">
                <img src={getAvatarUrl(session.user)} className="w-20 h-20 rounded-full border border-black/10 p-1" alt="User Avatar" />
                <div className="text-center">
                  <p className="font-light tracking-[3px] uppercase text-sm">{session.user.user_metadata?.full_name || 'Welcome'}</p>
                  <p className="text-[10px] text-gray-400 tracking-widest mt-2">{session.user.email}</p>
                </div>
              </div>
              <nav className="flex flex-col gap-8 text-[11px] tracking-[4px] uppercase font-light text-center border-t border-black/5 pt-10">
                <Link href="/account/orders" onClick={closeAllMenus} className="hover:opacity-60 transition-opacity outline-none" aria-label="My Orders">My Orders</Link>
                <Link href="/account/settings" onClick={closeAllMenus} className="hover:opacity-60 transition-opacity outline-none" aria-label="Account Settings">Account Settings</Link>
                <Link href="/account/addresses" onClick={closeAllMenus} className="hover:opacity-60 transition-opacity outline-none" aria-label="Address Book">Address Book</Link>
                <Link href="/wishlist" onClick={closeAllMenus} className="hover:opacity-60 transition-opacity outline-none" aria-label="Saved Items">Saved Items</Link>
                {/* 新增的 VIP SERVICES 选项 */}
                <Link 
                  href="/account/vip-services" 
                  onClick={closeAllMenus} 
                  className="hover:opacity-60 transition-opacity outline-none" 
                  aria-label="VIP Services"
                >
                  VIP Services
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="text-red-500 hover:opacity-60 transition-opacity pt-4 outline-none"
                  aria-label="Sign Out"
                >
                  Sign Out
                </button>
              </nav>
            </>
          ) : (
            <div className="text-center space-y-10 py-8">
              <p className="text-[11px] font-light text-gray-500 tracking-widest leading-loose px-4">
                Sign in to manage your orders, track deliveries and update your preferences.
              </p>
              <div className="space-y-4 pt-4">
                <Link href="/auth/signin" onClick={closeAllMenus} className="block w-full py-4 bg-black text-white text-[10px] tracking-[4px] uppercase font-light hover:bg-black/80 transition-colors outline-none" aria-label="Sign In">
                  Sign In
                </Link>
                <Link href="/auth/signup" onClick={closeAllMenus} className="block w-full py-4 border border-black text-[10px] tracking-[4px] uppercase font-light hover:bg-black hover:text-white transition-colors outline-none" aria-label="Create Account">
                  Create Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
UserDrawer.displayName = 'UserDrawer'; // 添加 displayName 修复 ESLint 报错

// 新增：提取 Contact 抽屉组件
const ContactDrawer = React.memo(({ contactMenuOpen, setContactMenuOpen, setWhatsappOpen, swipeHandlers }: {
  contactMenuOpen: boolean;
  setContactMenuOpen: (open: boolean) => void;
  setWhatsappOpen: (open: boolean) => void;
  swipeHandlers: any;
}) => {
  if (!contactMenuOpen) return null;
  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-xl z-[400]" onClick={() => setContactMenuOpen(false)}>
      <div 
        className="absolute right-0 top-0 h-full w-full md:max-w-md bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.05)] p-8 md:p-12 flex flex-col" 
        onClick={(e) => e.stopPropagation()}
        {...swipeHandlers}
        role="dialog"
        aria-label="Contact Us"
      >
        <div className="flex justify-end mb-8 md:mb-12">
          <button onClick={() => setContactMenuOpen(false)} className="group flex items-center gap-2 text-[10px] tracking-[3px] uppercase font-light hover:opacity-50 transition-all text-black outline-none" aria-label="Close contact menu">
            Close <i className="fas fa-times text-[10px]"></i>
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-start pt-4 max-w-[320px] mx-auto w-full">
          <div className="mb-10 md:mb-14 text-center">
            <h2 className="text-2xl md:text-3xl font-extralight tracking-[6px] md:tracking-[8px] uppercase mb-3 text-black">Contact Us</h2>
            <div className="w-8 h-[1px] bg-black mx-auto"></div>
          </div>

          <div className="space-y-10 md:space-y-12 text-black">
            <div className="group text-center">
              <p className="text-[9px] tracking-[2px] uppercase text-gray-400 mb-2 font-light">By Phone</p>
              <a href="tel:+18774822430" className="text-base md:text-lg font-light tracking-widest hover:text-gray-500 transition-colors outline-none" aria-label="Call +1 (877) 482-2430">
                +1 (877) 482-2430
              </a>
              <div className="mt-3 text-[10px] leading-relaxed text-gray-400 font-extralight tracking-wider">
                Monday – Saturday: 10am – 10pm (EST)<br/>
                Sunday: 10am – 9pm (EST)
              </div>
            </div>

            <div className="group text-center">
              <p className="text-[9px] tracking-[2px] uppercase text-gray-400 mb-2 font-light">Online Service</p>
              <button 
                onClick={() => {
                  if ((window as any).Tawk_API) {
                    (window as any).Tawk_API.showWidget();
                    (window as any).Tawk_API.maximize();
                  }
                }}
                className="text-base md:text-lg font-light tracking-widest border-b border-black/10 pb-1 hover:border-black transition-all outline-none"
                aria-label="Start Live Chat"
              >
                Start Live Chat
              </button>
            </div>

            <div className="group text-center border-t border-black/5 pt-10">
              <p className="text-[9px] tracking-[2px] uppercase text-gray-400 mb-4 font-light">Social Messenger</p>
              <button 
                onClick={() => { setContactMenuOpen(false); setWhatsappOpen(true); }}
                className="px-8 py-3 border border-black text-[10px] tracking-[3px] uppercase font-light hover:bg-black hover:text-white transition-all duration-500 outline-none"
                aria-label="Message Us on Social"
              >
                Message Us
              </button>
            </div>
          </div>
        </div>

        <div className="mt-auto text-center pb-4">
          <p className="text-[8px] tracking-[4px] uppercase text-gray-300 font-light">
            Linjin Client Service
          </p>
        </div>
      </div>
    </div>
  );
});
ContactDrawer.displayName = 'ContactDrawer'; // 添加 displayName 修复 ESLint 报错

// 新增：提取 WhatsApp 抽屉组件
const WhatsappDrawer = React.memo(({ whatsappOpen, setWhatsappOpen, setContactMenuOpen, swipeHandlers }: {
  whatsappOpen: boolean;
  setWhatsappOpen: (open: boolean) => void;
  setContactMenuOpen: (open: boolean) => void;
  swipeHandlers: any;
}) => {
  if (!whatsappOpen) return null;
  return (
    <div className="fixed inset-0 bg-white/60 backdrop-blur-xl z-[500]" onClick={() => setWhatsappOpen(false)}>
      <div 
        className="absolute right-0 top-0 h-full w-full md:max-w-md bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.05)] p-8 md:p-12" 
        onClick={(e) => e.stopPropagation()}
        {...swipeHandlers}
        role="dialog"
        aria-label="WhatsApp Contact"
      >
        <div className="flex items-center justify-between mb-16 text-black">
          <button 
            onClick={() => { setWhatsappOpen(false); setContactMenuOpen(true); }} 
            className="flex items-center gap-3 text-[10px] tracking-[3px] uppercase font-light opacity-70 hover:opacity-100 transition outline-none"
            aria-label="Back to Contact Menu"
          >
            <i className="fas fa-arrow-left text-[10px]"></i> Back
          </button>
          <button onClick={() => setWhatsappOpen(false)} className="text-xl hover:opacity-50 transition outline-none" aria-label="Close WhatsApp menu">
            <i className="fas fa-times text-[10px]"></i>
          </button>
        </div>
        
        <div className="text-center space-y-10 text-black pt-4">
          <div className="mb-12">
            <h3 className="text-2xl font-extralight uppercase tracking-[6px] mb-4">WhatsApp</h3>
            <div className="w-8 h-[1px] bg-black mx-auto"></div>
          </div>
          
          <p className="text-[12px] text-gray-500 font-light tracking-wide leading-relaxed">
            Scan the QR code with your smartphone to connect with our Client Service directly.
          </p>
          
          <div className="w-56 h-56 bg-gray-50 mx-auto flex items-center justify-center border border-black/5 rounded-sm shadow-inner">
            <span className="text-[9px] tracking-[4px] text-gray-300 uppercase">QR Code</span>
          </div>
          
          <div className="pt-8">
            <p className="text-[10px] font-light tracking-wider text-gray-400">
              Alternatively, access via <a href="https://wa.me/8617817026596?text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20your%20products." target="_blank" className="text-black underline underline-offset-4 hover:opacity-60 transition outline-none" aria-label="Access WhatsApp Web">WhatsApp Web</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
WhatsappDrawer.displayName = 'WhatsappDrawer'; // 添加 displayName 修复 ESLint 报错

// 新增：组件 props 类型定义，支持 SSR/ISR 传入初始数据
interface HeaderProps {
  initialUser?: any; // 来自 SSR 的初始用户数据
  initialCartTotal?: number; // 来自 SSR 的初始购物车总数
  geo?: { country: string; city: string }; // 来自 SSR 的 GEO 数据
}

export default function Header({ initialUser, initialCartTotal = 0, geo }: HeaderProps = {}) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const isTransparentPage = pathname === '/' || pathname.startsWith('/product/') || pathname.startsWith('/[gender]/[category]/[subCategory]'); // 修改：添加列表页路径为透明

  // ==================== Supabase & Stores ====================
  const { session } = useSupabase();
  const { fetchCart, getTotalItems } = useCart();
  const { wishlistIds, fetchWishlistIds } = useWishlistStore();

  // ==================== 状态 ====================
  const [menuLevel, setMenuLevel] = useState<'main' | 'secondary' | 'tertiary'>('main');
  const [currentSecondary, setCurrentSecondary] = useState<SecondaryMenu>({ label: '', items: [] });
  const [currentTertiary, setCurrentTertiary] = useState<{ label: string; items: SubItem[] }>({ label: '', items: [] });
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [contactMenuOpen, setContactMenuOpen] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currency, setCurrency] = useState('USD'); // 新增：基于 GEO 的货币

  // 【新增】：修复 Hydration 错误的关键状态
  const [isMounted, setIsMounted] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const cartTotal = getTotalItems();
  const hasWishlistItems = Array.isArray(wishlistIds) && wishlistIds.length > 0;

  // ==================== 合并 useEffect 以优化性能 ====================
  useEffect(() => {
    setIsMounted(true);
    if (geo?.country) {
      setCurrency(geo.country === 'US' ? 'USD' : 'EUR');
    }
    if (searchOpen) {
      searchInputRef.current?.focus(); // a11y: 焦点管理
    }
    if (menuOpen || searchOpen || contactMenuOpen || whatsappOpen || userMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [geo, searchOpen, menuOpen, contactMenuOpen, whatsappOpen, userMenuOpen]);

  // ==================== Header 透明 → 实心（添加 debounce） ====================
  const [headerSolid, setHeaderSolid] = useState(false); // 修改：初始始终透明，只基于滚动

  const customDebounce = <T extends (...args: any[]) => void>(func: T, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleScroll = () => {
    setHeaderSolid(window.scrollY > 300);
  };

  const debouncedScroll = useCallback(customDebounce(handleScroll, 100), []);

  useEffect(() => {
    window.addEventListener('scroll', debouncedScroll);
    return () => window.removeEventListener('scroll', debouncedScroll);
  }, [debouncedScroll]);

  // ==================== 登录同步 + 本地合并 + Realtime ====================
  useEffect(() => {
    if (!session?.user?.id) {
      useCart.setState({ cart: [] });
      useWishlistStore.setState({ wishlistIds: [] });
      return;
    }

    const mergeAndLoad = async () => {
      try {
        const localItems = useCart.getState().cart || [];
        if (localItems.length > 0) {
          for (const item of localItems) {
            const docId = `${session.user.id}_${item.id}_${item.color}_${item.size}`;
            const { id: _, ...itemWithoutId } = item;
            const { data: existing } = await supabase
              .from('cart_items')
              .select('quantity')
              .eq('id', docId)
              .single();

            if (existing) {
              await supabase
                .from('cart_items')
                .update({ quantity: existing.quantity + item.quantity })
                .eq('id', docId);
            } else {
              await supabase
                .from('cart_items')
                .insert({ id: docId, user_id: session.user.id, ...itemWithoutId });
            }
          }
          useCart.getState().clearCart();
        }

        fetchCart(session.user.id);
        if (typeof fetchWishlistIds === 'function') fetchWishlistIds();
      } catch (err) {
        console.error('Error merging cart/wishlist:', err);
        // 可添加 toast 通知用户
      }
    };

    mergeAndLoad();

    const cartSub = supabase
      .channel('cart-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cart_items', filter: `user_id=eq.${session.user.id}` },
        () => fetchCart(session.user.id)
      )
      .subscribe();

    const wishlistSub = supabase
      .channel('wishlist-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wishlist', filter: `user_id=eq.${session.user.id}` },
        () => fetchWishlistIds()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(cartSub);
      supabase.removeChannel(wishlistSub);
    };
  }, [session?.user?.id, fetchCart, fetchWishlistIds]);

  // ==================== 搜索防抖 ====================
  const fetchSuggestions = useCallback(
    customDebounce(async (query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query.trim())}`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error('Search suggestions error:', err);
        setSuggestions([]);
        // 可添加 toast 通知
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchSuggestions(searchQuery);
  }, [searchQuery, fetchSuggestions]);

  // ==================== 菜单控制 ====================
  const openSecondary = useCallback((key: string) => {
    setCurrentSecondary(secondaryMenus[key]);
    setMenuLevel('secondary');
  }, []);

  const openTertiary = useCallback((subItems: SubItem[], label: string) => {
    setCurrentTertiary({ label, items: subItems });
    setMenuLevel('tertiary');
  }, []);

  const backToMain = useCallback(() => setMenuLevel('main'), []);
  const backToSecondary = useCallback(() => setMenuLevel('secondary'), []);

  const closeAllMenus = useCallback(() => {
    setMenuOpen(false);
    setContactMenuOpen(false);
    setWhatsappOpen(false);
    setUserMenuOpen(false);
    setMenuLevel('main');
    setSearchOpen(false);
  }, []);

  // ==================== 搜索 & 登出 ====================
  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setSuggestions([]);
    }
  }, [searchQuery, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    closeAllMenus();
  };

  // 新增：swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => closeAllMenus(),
    trackMouse: true,
  });

  // useMemo 优化 suggestions 列表
  const memoizedSuggestions = React.useMemo(() => suggestions, [suggestions]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {/* ==================== 顶部导航栏 ==================== */}
      <header 
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ease-in-out
          ${headerSolid 
            ? 'bg-white/95 backdrop-blur-md py-6 border-b border-black/5 shadow-sm' 
            : 'bg-transparent py-6 border-b border-transparent'
          }`}
        role="navigation" // a11y: role
        aria-label="Main Navigation"
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-4 md:py-5 flex items-center justify-between text-black">
          
          <div className="flex items-center gap-6 lg:gap-12">
            <button 
              onClick={() => setMenuOpen(true)} 
              className="group flex items-center gap-4 hover:opacity-70 transition-all outline-none"
              aria-label="Open Menu"
            >
              <div className="flex flex-col gap-1.5 items-start">
                <span className="w-6 h-[1px] bg-black group-hover:w-10 transition-all duration-300"></span>
                <span className="w-10 h-[1px] bg-black"></span>
                <span className="w-6 h-[1px] bg-black group-hover:w-10 transition-all duration-300"></span>
              </div>
              <span className="hidden md:block text-[10px] tracking-[4px] font-light uppercase">Menu</span>
            </button>

            <button 
              onClick={() => setContactMenuOpen(true)} 
              className="flex items-center hover:opacity-70 transition outline-none"
              aria-label="Open Contact Menu"
            >
              <span className="text-[10px] md:text-xs tracking-[4px] font-light uppercase">Contact</span>
            </button>
          </div>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 outline-none" aria-label="Home">
            <h1 className="text-3xl md:text-5xl font-thin tracking-[10px] md:tracking-[15px]">LINJIN</h1>
          </Link>

          <div className="flex items-center gap-4 md:gap-10">
            <button 
              onClick={() => setSearchOpen(true)} 
              className="p-2 outline-none"
              aria-label="Search"
            >
              <i className="fas fa-search text-xl md:text-2xl font-light hover:opacity-70 transition-opacity"></i>
            </button>
            
            {/* 收藏夹：增加 isMounted 判断 */}
            <Link href="/wishlist" className="relative p-2 group hover:opacity-70 transition-opacity outline-none" aria-label="Wishlist">
              <i className={`${hasWishlistItems ? 'fas fa-heart text-red-500' : 'far fa-heart text-black'} text-xl md:text-2xl transition-colors duration-300`}></i>
              {isMounted && hasWishlistItems && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </Link>

            {/* 购物车：增加 isMounted 判断 */}
            <Link href="/cart" className="relative p-2 hover:opacity-70 transition-opacity outline-none" aria-label="Cart">
              <i className="fas fa-shopping-bag text-xl md:text-2xl font-light"></i>
              {isMounted && cartTotal > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {cartTotal}
                </span>
              )}
            </Link>

            {/* 用户中心按钮 */}
            <button 
              onClick={() => setUserMenuOpen(true)} 
              className="p-2 hover:opacity-70 transition-opacity outline-none"
              aria-label={session?.user ? 'User Profile' : 'Sign In'}
            >
              {session?.user ? (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-black/10 flex items-center justify-center">
                  <img src={getAvatarUrl(session.user)} alt="User Avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <i className="far fa-user text-xl md:text-2xl font-light"></i>
              )}
            </button>

            {/* GEO-based 货币显示 */}
            {geo && (
              <span className="text-[10px] tracking-[4px] font-light uppercase ml-4 hidden md:block">
                {currency}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ==================== 搜索 Overlay ==================== */}
      {searchOpen && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[200] flex flex-col transition-all duration-300" onClick={() => setSearchOpen(false)}>
          <div className="max-w-[1000px] w-full mx-auto px-6 py-12 md:py-24" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end mb-12">
              <button onClick={() => setSearchOpen(false)} className="group flex items-center gap-3 text-[11px] tracking-[4px] uppercase font-light hover:opacity-50 transition-all text-black outline-none" aria-label="Close Search">
                Close <i className="fas fa-times text-xs"></i>
              </button>
            </div>
            <div className="relative border-b border-black pb-4">
              <i className="fas fa-search absolute left-0 top-1/2 -translate-y-1/2 text-xl opacity-50"></i>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-4 py-4 text-2xl md:text-4xl font-light outline-none bg-transparent uppercase tracking-wider placeholder-gray-300 text-black"
                aria-label="Search Input"
              />
              {loading && <i className="fas fa-circle-notch fa-spin absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i>}
            </div>
            {memoizedSuggestions.length > 0 && (
              <ul className="mt-8 space-y-4 text-left">
                {memoizedSuggestions.map((sug, idx) => (
                  <li key={idx}>
                    <button onClick={() => handleSuggestionClick(sug)} className="text-lg font-light tracking-wide text-gray-600 hover:text-black transition-colors uppercase outline-none" aria-label={`Select suggestion: ${sug}`}>
                      {sug}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ==================== 抽屉组件 ==================== */}
      <MenuDrawer
        menuOpen={menuOpen}
        menuLevel={menuLevel}
        currentSecondary={currentSecondary}
        currentTertiary={currentTertiary}
        closeAllMenus={closeAllMenus}
        openSecondary={openSecondary}
        openTertiary={openTertiary}
        backToMain={backToMain}
        backToSecondary={backToSecondary}
        swipeHandlers={swipeHandlers}
      />

      <UserDrawer
        userMenuOpen={userMenuOpen}
        session={session}
        closeAllMenus={closeAllMenus}
        handleLogout={handleLogout}
        swipeHandlers={swipeHandlers}
        setUserMenuOpen={setUserMenuOpen}
      />

      <ContactDrawer
        contactMenuOpen={contactMenuOpen}
        setContactMenuOpen={setContactMenuOpen}
        setWhatsappOpen={setWhatsappOpen}
        swipeHandlers={swipeHandlers}
      />

      <WhatsappDrawer
        whatsappOpen={whatsappOpen}
        setWhatsappOpen={setWhatsappOpen}
        setContactMenuOpen={setContactMenuOpen}
        swipeHandlers={swipeHandlers}
      />
    </ErrorBoundary>
  );
}