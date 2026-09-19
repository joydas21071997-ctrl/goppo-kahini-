import React from 'react';
import {
  ShieldCheck,
  Crown,
  LogOut,
  ArrowLeft,
  Flame,
  CheckCircle2,
  Bell,
  Sparkles,
  ExternalLink,
  Sun,
  Moon
} from 'lucide-react';
import { CreatorSession, AudienceUser } from '../../types';

interface AdminHeaderProps {
  creatorSession: CreatorSession | null;
  currentUser?: AudienceUser | null;
  onLogout: () => void;
  onClose?: () => void;
  pendingPaymentsCount: number;
  pendingAuditionsCount: number;
  newLifeStoriesCount: number;
  unreadInboxCount: number;
  themeMode?: 'slate' | 'light';
  onToggleTheme?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  creatorSession,
  currentUser,
  onLogout,
  onClose,
  pendingPaymentsCount,
  pendingAuditionsCount,
  newLifeStoriesCount,
  unreadInboxCount,
  themeMode = 'slate',
  onToggleTheme,
}) => {
  const isSuperAdmin =
    creatorSession?.role === 'super_admin' ||
    currentUser?.email === 'joydas.21071997@gmail.com' ||
    currentUser?.role === 'admin';

  const isLight = themeMode === 'light';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md px-4 sm:px-6 py-3.5 transition-all ${
      isLight 
        ? 'bg-white/95 border-b border-slate-200 shadow-sm text-slate-800' 
        : 'bg-slate-900/95 border-b border-slate-800 shadow-md text-white'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 min-w-0">
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="শ্রোতা পোর্টালে ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">শ্রোতা ভিউ</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className={`text-base sm:text-lg font-bold tracking-tight truncate font-serif-story ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  গপ্পো কাহিনী অ্যাডমিন পোর্টাল
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ক্লাউড ফায়ারবেস সংযুক্ত
                </span>
              </div>
              <p className={`text-[11px] truncate hidden sm:block ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Joy Super Admin Dashboard • কন্ট্রোল সেন্টার
              </p>
            </div>
          </div>
        </div>

        {/* Right: Joy Admin User Info, Theme Toggle & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title={isLight ? 'স্লেট ডার্ক মোডে পরিবর্তন করুন' : 'লাইট মোডে পরিবর্তন করুন'}
            >
              {isLight ? (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden md:inline text-xs">স্লেট মোড</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline text-xs">লাইট মোড</span>
                </>
              )}
            </button>
          )}

          {/* Notifications / Alerts Badges */}
          <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs ${
            isLight
              ? 'bg-slate-100 border-slate-200 text-slate-700'
              : 'bg-slate-800/80 border-slate-700 text-slate-300'
          }`}>
            {pendingPaymentsCount > 0 ? (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-300 font-medium">
                {pendingPaymentsCount}টি পেমেন্ট বাকি
              </span>
            ) : null}
            {unreadInboxCount > 0 ? (
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-600 dark:text-rose-300 font-medium">
                {unreadInboxCount}টি নতুন বার্তা
              </span>
            ) : null}
            {pendingAuditionsCount > 0 ? (
              <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-600 dark:text-pink-300 font-medium">
                {pendingAuditionsCount}টি অডিশন
              </span>
            ) : null}
            {newLifeStoriesCount > 0 ? (
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-medium">
                {newLifeStoriesCount}টি জমা কথা
              </span>
            ) : null}
            {pendingPaymentsCount === 0 && pendingAuditionsCount === 0 && newLifeStoriesCount === 0 && unreadInboxCount === 0 && (
              <span className="text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> সব কিছু আপ-টু-ডেট
              </span>
            )}
          </div>

          {/* Admin User Chip */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
            isLight
              ? 'bg-slate-100 border-slate-200'
              : 'bg-slate-800 border-slate-700'
          }`}>
            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 dark:text-amber-300 text-xs font-bold">
              J
            </div>
            <div className="text-left hidden sm:block">
              <div className={`text-xs font-bold flex items-center gap-1 ${
                isLight ? 'text-slate-800' : 'text-white'
              }`}>
                জয় (Joy)
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                joydas.21071997@gmail.com
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 hover:text-red-500 border border-red-500/30 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="লগআউট করুন"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">লগআউট</span>
          </button>
        </div>
      </div>
    </header>
  );
};
