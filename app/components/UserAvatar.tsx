import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { User } from 'lucide-react';

export default async function UserAvatar() {
  const supabase = await createClient();
  // 使用 getUser 确保数据从服务端实时校验
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <User className="text-zinc-400" size={24} />;

  // 1. 尝试从元数据中获取头像地址
  // Google 和 Facebook 登录通常会映射到 avatar_url
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  
  // 2. 获取用户显示名称（用于魔法链接或无头像用户显示首字母）
  const displayName = user.user_metadata?.full_name || user.email || 'U';
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative group cursor-pointer">
      {avatarUrl ? (
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-800 group-hover:border-amber-500 transition-all duration-300">
          <Image
            src={avatarUrl}
            alt="User Avatar"
            width={40}
            height={40}
            className="object-cover"
            // 增加未加载成功时的兜底逻辑
            unoptimized={avatarUrl.includes('facebook.com')} 
          />
        </div>
      ) : (
        // 魔法链接登录用户显示的占位头像
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center border-2 border-zinc-800 text-amber-500 font-bold group-hover:border-amber-500 transition-all">
          {firstLetter}
        </div>
      )}

      {/* 悬浮菜单 */}
      <div className="absolute right-0 mt-3 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 opacity-0 group-hover:opacity-100 transition-all shadow-2xl z-50 invisible group-hover:visible">
        <div className="px-3 py-2 border-b border-zinc-800">
          <p className="text-xs text-zinc-500 truncate">{user.email}</p>
        </div>
        <button className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-zinc-800 rounded-xl mt-1 transition">
          Sign Out
        </button>
      </div>
    </div>
  );
}