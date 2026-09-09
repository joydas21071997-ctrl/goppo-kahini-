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
  ExternalLink
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
}) => {
  const isSuperAdmin =
    creatorSession?.role === 'super_admin' ||
    currentUser?.email === 'joydas.21071997@gmail.com' ||
    currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-[#160b24]/95 backdrop-blur-md border-b border-purple-900/40 px-4 sm:px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 min-w-0">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-800/40 transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer"
              title="শ্রোতা পোর্টালে ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">শ্রোতা ভিউ</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate font-serif-story">
                  গপ্পো কাহিনী অ্যাডমিন পোর্টাল
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ক্লাউড ফায়ারবেস সংযুক্ত
                </span>
              </div>
              <p className="text-[11px] text-purple-300/70 truncate hidden sm:block">
                Joy Super Admin Dashboard • কন্ট্রোল সেন্টার
              </p>
            </div>
          </div>
        </div>

        {/* Right: Joy Admin User Info & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notifications / Alerts Badges */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/50 border border-purple-800/30 text-xs text-purple-300">
            {pendingPaymentsCount > 0 ? (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-medium">
                {pendingPaymentsCount}টি পেমেন্ট বাকি
              </span>
            ) : null}
            {pendingAuditionsCount > 0 ? (
              <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 font-medium">
                {pendingAuditionsCount}টি অডিশন
              </span>
            ) : null}
            {newLifeStoriesCount > 0 ? (
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-medium">
                {newLifeStoriesCount}টি জমা কথা
              </span>
            ) : null}
            {pendingPaymentsCount === 0 && pendingAuditionsCount === 0 && newLifeStoriesCount === 0 && (
              <span className="text-purple-400/80 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> সব কিছু আপ-টু-ডেট
              </span>
            )}
          </div>

          {/* Admin User Chip */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/60 to-pink-900/30 border border-purple-700/40">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-xs font-bold">
              J
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-white flex items-center gap-1">
                জয় (Joy)
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-[10px] text-purple-300/80 font-mono truncate max-w-[140px]">
                joydas.21071997@gmail.com
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/30 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
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
