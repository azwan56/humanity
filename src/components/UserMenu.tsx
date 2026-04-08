import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { logoutFirebase } from '../services/firebaseService';
import { navigateWithSSO } from '../services/ssoHelper';

interface UserMenuProps {
  user: User | null;
  onOpenAuth: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onOpenAuth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCrossAppNav = (e: React.MouseEvent, href: string) => {
    if (user) {
      e.preventDefault();
      navigateWithSSO(href, true);
    }
    // If not logged in, let the <a> tag work normally
  };

  if (!user) {
    return (
      <div className="flex gap-2">
        <button 
          onClick={onOpenAuth} 
          className="bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/50 text-white px-5 py-2 rounded-full font-bold transition-all shadow-md active:scale-95 text-sm sm:text-base"
        >
          注册 / 登录
        </button>
      </div>
    );
  }

  let displayName = user.displayName || user.phoneNumber || user.email || '学者';
  if (displayName.length > 15) displayName = displayName.substring(0, 15) + '...';

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-2 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-all outline-none border border-white/40"
      >
        <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-sm overflow-hidden shadow-inner">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          )}
        </div>
        <span className="font-bold text-white pr-2 hidden md:block text-sm">{displayName}</span>
        <svg className="w-4 h-4 text-white pr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white flex-col overflow-hidden z-50">
          <div className="px-4 py-3 bg-pink-50 border-b border-pink-100">
              <p className="text-xs text-pink-600 font-bold uppercase tracking-wider mb-1">我的生态矩阵</p>
          </div>
          <a 
            href="https://mathgenius.vanpower.live" 
            target="_blank" 
            rel="noreferrer" 
            onClick={(e) => handleCrossAppNav(e, 'https://mathgenius.vanpower.live')}
            className="px-4 py-4 hover:bg-slate-50 flex items-center gap-3 text-slate-700 font-bold border-b border-slate-100 group"
          >
            <span className="text-sky-500 p-2 bg-sky-100 rounded-lg group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </span> 
            MathGenius数学天才
          </a>
          <a 
            href="https://wordsmith.vanpower.live" 
            target="_blank" 
            rel="noreferrer" 
            onClick={(e) => handleCrossAppNav(e, 'https://wordsmith.vanpower.live')}
            className="px-4 py-4 hover:bg-slate-50 flex items-center gap-3 text-slate-700 font-bold border-b border-slate-100 group"
          >
            <span className="text-red-500 p-2 bg-red-100 rounded-lg group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
            </span> 
            Wordsmith单词大师
          </a>
          <a 
            href="https://vanpower.live" 
            target="_blank" 
            rel="noreferrer" 
            className="px-4 py-4 hover:bg-slate-50 flex items-center gap-3 text-slate-700 font-bold border-b border-slate-100 group"
          >
            <span className="text-orange-500 p-2 bg-orange-100 rounded-lg group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </span> 
            Vanpower主站
          </a>
          <button 
            onClick={logoutFirebase} 
            className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-600 font-bold w-full flex justify-center items-center gap-2 mt-0 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            退出登录
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
