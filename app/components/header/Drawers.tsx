'use client';



import React, { useState } from 'react';

import Link from 'next/link';



// --- 1. 搜索遮罩层 (SearchOverlay) ---

export const SearchOverlay = ({

  isOpen, onClose, query, setQuery, loading, suggestions = [], onSearch, onSuggestionClick, inputRef

}: any) => {

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[500] flex flex-col animate-in fade-in duration-500" onClick={onClose}>

      <div className="max-w-[1200px] w-full mx-auto px-6 py-12 md:py-24" onClick={(e) => e.stopPropagation()}>

        <div className="flex justify-end mb-12">

          <button onClick={onClose} className="group flex items-center gap-3 text-[10px] tracking-[4px] uppercase font-light hover:opacity-50 transition-all text-black">

            Close <i className="fas fa-times text-[10px]"></i>

          </button>

        </div>

        <div className="relative border-b border-black pb-4">

          <input

            ref={inputRef}

            type="text"

            placeholder="Search our collections..."

            value={query}

            onChange={(e) => setQuery(e.target.value)}

            onKeyDown={(e) => e.key === 'Enter' && onSearch()}

            className="w-full py-4 text-2xl md:text-5xl font-thin outline-none bg-transparent uppercase tracking-[4px] placeholder-gray-200 text-black"

          />

          {loading && <i className="fas fa-circle-notch fa-spin absolute right-0 top-1/2 -translate-y-1/2 text-gray-400"></i>}

        </div>

       

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mt-16 text-black">

          <div className="md:col-span-1">

            <p className="text-[10px] tracking-[3px] text-gray-400 uppercase mb-8 font-medium">Suggestions</p>

            <ul className="space-y-4">

              {suggestions.map((sug: string, idx: number) => (

                <li key={idx}>

                  <button onClick={() => onSuggestionClick(sug)} className="text-sm font-light tracking-widest text-gray-600 hover:text-black transition-colors uppercase">

                    {sug}

                  </button>

                </li>

              ))}

            </ul>

          </div>

        </div>

      </div>

    </div>

  );

};



// --- 2. 主菜单抽屉 (MenuDrawer) ---

export const MenuDrawer = ({

  isOpen, onClose, menuLevel, mainMenuItems = [], secondaryMenus = {}, currentSecondary, currentTertiary,

  openSecondary, openTertiary, backToMain, backToSecondary, swipeHandlers

}: any) => {

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[500] animate-in fade-in duration-300" onClick={onClose}>

      <div

        className="absolute right-0 top-0 h-full w-full md:max-w-md bg-white shadow-2xl p-8 md:p-12 overflow-y-auto text-black"

        onClick={(e) => e.stopPropagation()}

        {...swipeHandlers}

      >

        <div className="flex justify-end mb-12">

          <button onClick={onClose} className="text-[10px] tracking-[3px] uppercase font-light text-black">Close ✕</button>

        </div>



        {menuLevel === 'main' && (

          <div className="flex flex-col gap-8 text-xl font-light tracking-[3px] uppercase text-black">

            {mainMenuItems.map((item: any) => (

              'href' in item ? (

                <Link key={item.label} href={item.href!} onClick={onClose} className="hover:pl-4 transition-all">{item.label}</Link>

              ) : (

                <button key={item.label} onClick={() => openSecondary(item.key)} className="text-left flex justify-between items-center hover:pl-4 transition-all group">

                  {item.label} <i className="fas fa-chevron-right text-[10px] opacity-30"></i>

                </button>

              )

            ))}

          </div>

        )}



        {menuLevel === 'secondary' && (

          <div className="animate-in slide-in-from-right duration-300 text-black">

            <button onClick={backToMain} className="mb-8 text-[10px] uppercase tracking-[3px] text-gray-400 hover:text-black transition-colors">← Back</button>

            <h2 className="text-2xl font-extralight mb-10 uppercase tracking-[4px] border-b border-black/5 pb-4">{currentSecondary?.label}</h2>

            <div className="flex flex-col gap-8 text-lg font-light tracking-[2px] uppercase">

              {currentSecondary?.items?.map((item: any) => (

                item.sub ? (

                  <button key={item.label} onClick={() => openTertiary(item.sub!, item.label)} className="text-left flex justify-between hover:pl-4 transition-all group">

                    {item.label} <i className="fas fa-chevron-right text-[10px] opacity-30"></i>

                  </button>

                ) : (

                  <Link key={item.label} href={item.href!} onClick={onClose} className="hover:pl-4 transition-all">{item.label}</Link>

                )

              ))}

            </div>

          </div>

        )}



        {menuLevel === 'tertiary' && (

          <div className="animate-in slide-in-from-right duration-300 text-black">

            <button onClick={backToSecondary} className="mb-8 text-[10px] uppercase tracking-[3px] text-gray-400 hover:text-black transition-colors">← Back</button>

            <h2 className="text-2xl font-extralight mb-10 uppercase tracking-[4px] border-b border-black/5 pb-4">{currentTertiary?.label}</h2>

            <div className="flex flex-col gap-8 text-lg font-light tracking-[2px] uppercase">

              {currentTertiary?.items?.map((item: any) => (

                <Link key={item.label} href={item.href} onClick={onClose} className="hover:pl-4 transition-all">{item.label}</Link>

              ))}

            </div>

          </div>

        )}

      </div>

    </div>

  );

};



// --- 3. 用户账号抽屉 (UserDrawer) 修复版 ---
export const UserDrawer = ({ isOpen, onClose, session, onLogout, swipeHandlers }: any) => {
  if (!isOpen) return null;

  // 优先级：用户元数据头像 > 默认占位图
  const avatarUrl = session?.user?.user_metadata?.avatar_url;
  const userName = session?.user?.user_metadata?.full_name || 'Member';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[500] animate-in fade-in duration-300" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-full md:max-w-md bg-white p-8 md:p-12 shadow-2xl overflow-y-auto no-scrollbar text-black flex flex-col" onClick={(e) => e.stopPropagation()} {...swipeHandlers}>
        
        {/* 关闭按钮 */}
        <div className="flex justify-end mb-16">
          <button onClick={onClose} className="group flex items-center gap-4 outline-none">
            <span className="text-[10px] tracking-[4px] uppercase font-light text-black opacity-60">Close</span>
            <div className="relative w-6 h-6 flex items-center justify-center">
              <span className="absolute h-[1px] w-6 bg-black rotate-45"></span>
              <span className="absolute h-[1px] w-6 bg-black -rotate-45"></span>
            </div>
          </button>
        </div>

        <div className="mb-14 text-center">
          <h2 className="text-2xl font-thin tracking-[8px] uppercase mb-4 text-black">My Account</h2>
          <div className="w-10 h-[1px] bg-black/10 mx-auto"></div>
        </div>

        {session?.user ? (
          <div className="flex flex-col items-center gap-8 text-black">
            {/* 修复后的头像显示逻辑 */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-100 bg-neutral-50 flex items-center justify-center shadow-sm">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 如果图片加载失败，隐藏图片并显示文字
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.classList.add('bg-neutral-800');
                  }}
                />
              ) : (
                <span className="text-2xl font-extralight tracking-widest text-neutral-400">{userInitial}</span>
              )}
            </div>

            <div className="text-center">
              <p className="font-light tracking-[4px] uppercase text-sm">{userName}</p>
              <p className="text-[10px] text-gray-400 tracking-widest mt-3 lowercase">{session.user.email}</p>
            </div>

            <nav className="w-full flex flex-col gap-7 text-[11px] tracking-[4px] uppercase font-light text-center border-t border-black/5 pt-12 mt-4">
              <Link href="/account/orders" onClick={onClose} className="hover:opacity-50">My Orders</Link>
              <Link href="/account/addresses" onClick={onClose} className="hover:opacity-50 transition-all">Addresses</Link>
              <Link href="/account/settings" onClick={onClose} className="hover:opacity-50 transition-all">Settings</Link>
              <Link href="/account/vip-services" onClick={onClose} className="hover:opacity-50 transition-all text-neutral-400">VIP Services</Link>
              <Link href="/wishlist" onClick={onClose} className="hover:opacity-50">Saved Items</Link>
              <button onClick={onLogout} className="text-red-500 pt-6 opacity-80 hover:opacity-100 transition-opacity">Sign Out</button>
            </nav>
          </div>
        ) : (
          <div className="text-center space-y-12 py-8 text-black">
            <p className="text-[11px] font-light text-gray-400 tracking-[3px] leading-relaxed px-6">SIGN IN TO ACCESS YOUR PERSONALIZED SELECTION AND ORDERS.</p>
            <div className="space-y-4">
              <Link href="/auth/signin" onClick={onClose} className="block w-full py-5 bg-black text-white text-[10px] tracking-[5px] uppercase font-light">Sign In</Link>
              <Link href="/auth/signup" onClick={onClose} className="block w-full py-5 border border-black text-black text-[10px] tracking-[5px] uppercase font-light">Create Account</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



// --- 4. 联系与 WhatsApp 抽屉 (全功能版) ---

export const ContactDrawer = ({ isOpen, onClose, swipeHandlers }: any) => {

  const [showQR, setShowQR] = useState(false);



  // tawk.to 触发逻辑

  const handleLiveChat = () => {

    if (typeof window !== 'undefined' && (window as any).Tawk_API) {

      (window as any).Tawk_API.maximize();

      onClose(); // 点击后关闭抽屉以展示聊天窗

    } else {

      console.warn("Tawk.to is not loaded yet.");

    }

  };



  if (!isOpen) return null;



  return (

    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[500] animate-in fade-in" onClick={onClose}>

      <div

        className="absolute right-0 top-0 h-full w-full md:max-w-md bg-white p-8 md:p-12 shadow-2xl text-black flex flex-col"

        onClick={e => e.stopPropagation()}

        {...swipeHandlers}

      >

        <div className="flex justify-end">

          <button onClick={onClose} className="text-[10px] tracking-[3px] text-black hover:opacity-50 transition-opacity">CLOSE ✕</button>

        </div>

       

        <div className="mt-16 text-center flex-1 overflow-y-auto no-scrollbar">

          <h2 className="text-2xl font-extralight tracking-[6px] uppercase text-black mb-12">Contact Us</h2>

         

          <div className="space-y-12">

            {/* 1. Live Chat - 黑色高级感按钮 */}

            <div className="space-y-4">

              <p className="text-[9px] text-gray-400 tracking-widest uppercase">Direct Assistance</p>

              <button

                onClick={handleLiveChat}

                className="w-full flex items-center justify-center gap-3 py-4 bg-black text-white text-[10px] tracking-[3px] uppercase hover:bg-gray-900 transition-all shadow-lg"

              >

                <span className="relative flex h-2 w-2">

                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>

                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>

                </span>

                Start Live Chat

              </button>

            </div>



            {/* 2. 邮箱项目 */}

            <div className="space-y-2">

              <p className="text-[9px] text-gray-400 tracking-widest uppercase">Email</p>

              <p className="text-sm font-light tracking-widest text-black select-all uppercase">linjinluxury@gmail.com</p>

            </div>



            {/* 3. 电话项目 */}

            <div className="space-y-2">

              <p className="text-[9px] text-gray-400 tracking-widest uppercase">Phone / Whatsapp</p>

              <p className="text-sm font-light tracking-widest text-black">+86 13435206582</p>

            </div>



            {/* 4. WhatsApp 二维码 */}

            <div className="space-y-4 pt-4 px-4">

              <p className="text-[9px] text-gray-400 tracking-widest uppercase">Social Chat</p>

             

              {!showQR ? (

                <button

                  onClick={() => setShowQR(true)}

                  className="w-full py-4 border border-black text-black text-[10px] tracking-[3px] uppercase hover:bg-black hover:text-white transition-all duration-500"

                >

                  WhatsApp QR Code

                </button>

              ) : (

                <div className="animate-in zoom-in duration-300 flex flex-col items-center gap-4 bg-gray-50 p-6 rounded-sm">

                  <div className="w-40 h-40 bg-white p-2 border border-gray-100 shadow-sm">

                    <img

                      src="/images/whatsapp-qr.png"

                      alt="WhatsApp QR Code"

                      className="w-full h-full object-contain"

                    />

                  </div>

                  <button

                    onClick={() => setShowQR(false)}

                    className="text-[9px] tracking-[2px] underline uppercase text-gray-500 hover:text-black"

                  >

                    Back to options

                  </button>

                </div>

              )}

            </div>

          </div>

        </div>



        {/* 底部社交媒体图标 */}

        <div className="pt-10 border-t border-black/5 mt-auto bg-white">

          <p className="text-[10px] text-gray-400 tracking-widest uppercase mb-6 font-light text-center">Follow the World of LJL</p>

          <div className="flex justify-center gap-10 text-black text-xl">

             <i className="fab fa-instagram hover:opacity-50 cursor-pointer"></i>

             <i className="fab fa-weixin hover:opacity-50 cursor-pointer"></i>

             <i className="fab fa-tiktok hover:opacity-50 cursor-pointer"></i>

          </div>

        </div>

      </div>

    </div>

  );

};