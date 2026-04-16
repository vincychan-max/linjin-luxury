'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const navItems = [
  { name: '仪表盘', href: '/admin' },
  { name: '所有订单', href: '/admin/orders' },
  { name: '退款管理', href: '/admin/refunds' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 侧边栏 */}
      <div className="w-72 bg-white border-r border-gray-200 p-8 flex flex-col">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-2xl">L</div>
          <div>
            <p className="font-bold text-2xl tracking-widest">LINJIN</p>
            <p className="text-xs text-gray-500 -mt-1">ADMIN</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-6 py-4 rounded-2xl text-lg font-medium transition ${
                pathname === item.href
                  ? 'bg-black text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-4 text-red-600 hover:bg-red-50 rounded-2xl mt-auto"
        >
          <LogOut size={20} />
          <span>退出登录</span>
        </button>
      </div>

      {/* 主内容 */}
      <div className="flex-1 p-12 overflow-auto">
        {children}
      </div>
    </div>
  );
}