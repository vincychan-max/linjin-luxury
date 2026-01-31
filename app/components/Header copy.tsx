'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [megaTimeout, setMegaTimeout] = useState<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const openMega = (key: string) => {
    if (megaTimeout) clearTimeout(megaTimeout);
    setActiveMega(key);
  };

  const closeMegaDelayed = () => {
    if (megaTimeout) clearTimeout(megaTimeout);
    const timeout = setTimeout(() => {
      setActiveMega(null);
    }, 800);
    setMegaTimeout(timeout);
  };

  const stayOpen = () => {
    if (megaTimeout) clearTimeout(megaTimeout);
  };

  // 自动聚焦 + ESC 关闭
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    if (searchOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [searchOpen]);

  // 实时搜索建议数据（示例，可替换为真实API）
  const allSuggestions = [
    'Handbags',
    'Classic Handbags',
    'Mini Bags',
    'Totes',
    'Clutches',
    'Limited Edition',
    'New Arrivals',
    'Shoes',
    'Heels',
    'Dresses',
    'Evening Gowns',
    'Suits',
    'Shirts',
    'Watches',
    'Jewelry',
    'Sunglasses',
  ];

  // 过滤建议
  const filteredSuggestions = searchQuery
    ? allSuggestions.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    : allSuggestions.slice(0, 8); // 无输入时显示热门8条

  // 提交搜索
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Enter 键提交
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-black z-50">
      <div className="px-12 pt-4 pb-1">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div className="mt-2">
            <Link href="/">
              <h1 className="text-3xl md:text-4xl font-thin tracking-widest leading-tight text-white opacity-90">
                LINJIN<br />
                LUXURY
              </h1>
            </Link>
          </div>

          <div className="mt-3 flex items-center gap-5 text-2xl text-white opacity-80">
            <button
              onClick={() => setSearchOpen(true)}
              className="hover:opacity-100 transition"
              aria-label="Open search"
            >
              <i className="fas fa-magnifying-glass"></i>
            </button>

            <Link href="/wishlist" className="hover:opacity-100 transition">
              <i className="far fa-heart"></i>
            </Link>
            <Link href="/account" className="hover:opacity-100 transition">
              <i className="fas fa-user"></i>
            </Link>
            <Link href="/cart" className="relative hover:opacity-100 transition">
              <i className="fas fa-shopping-bag"></i>
              <span className="absolute -top-1.5 -right-1.5 bg-white text-black w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                0
              </span>
            </Link>

            <button className="md:hidden text-2xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <i className={mobileMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
            </button>
          </div>
        </div>
      </div>

      {/* 导航保持不变 */}
      <nav className="hidden md:block px-12 pt-1 pb-4 relative z-50">
        {/* ... 你的导航代码保持不变 ... */}
      </nav>

      {/* 搜索模态 - 添加实时建议 */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="px-12 pt-8 pb-12">
            <div className="max-w-5xl mx-auto flex items-center gap-8">
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                className="text-4xl text-white opacity-80 hover:opacity-100 transition"
                aria-label="Close search"
              >
                <i className="fas fa-times"></i>
              </button>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search for products, collections..."
                className="flex-1 bg-transparent border-b-2 border-white text-white text-4xl md:text-5xl font-thin tracking-widest placeholder-white/50 focus:outline-none focus:border-white/80 transition"
              />
              <button onClick={handleSearch} className="text-4xl text-white opacity-80 hover:opacity-100 transition">
                <i className="fas fa-magnifying-glass"></i>
              </button>
            </div>
          </div>

          {/* 实时搜索建议 */}
          <div className="flex-1 px-12 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              {filteredSuggestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        handleSearch();
                      }}
                      className="text-left text-white text-2xl hover:opacity-80 transition py-4 border-b border-white/20"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-white/60 text-2xl">No results found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 移动菜单 + Mega Menu 保持不变 */}
      {/* ... 你的原代码保持 ... */}
    </header>
  );
}