import React from 'react';
import {
  CreditCard,
  Music,
  Users,
  Radio,
  Clock,
  Mic,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Database,
  Upload
} from 'lucide-react';
import { AdminTab } from '../types';

interface AdminOverviewStatsProps {
  totalRevenueINR: number;
  totalRevenueBDT: number;
  verifiedSubscribersCount: number;
  storiesCount: number;
  podcastsCount: number;
  pendingPaymentsCount: number;
  pendingAuditionsCount: number;
  newLifeStoriesCount: number;
  onNavigate: (tab: AdminTab) => void;
  onSyncFirestore: () => void;
  isSyncing: boolean;
  syncSuccessMessage?: string | null;
  themeMode?: 'slate' | 'light';
}

export const AdminOverviewStats: React.FC<AdminOverviewStatsProps> = ({
  totalRevenueINR,
  totalRevenueBDT,
  verifiedSubscribersCount,
  storiesCount,
  podcastsCount,
  pendingPaymentsCount,
  pendingAuditionsCount,
  newLifeStoriesCount,
  onNavigate,
  onSyncFirestore,
  isSyncing,
  syncSuccessMessage,
  themeMode = 'slate',
}) => {
  const isLight = themeMode === 'light';

  return (
    <div className="space-y-6">
      {/* Top Banner with Joy Super Admin Greeting */}
      <div className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all shadow-lg ${
        isLight
          ? 'bg-gradient-to-r from-indigo-50 via-rose-50 to-amber-50 border-indigo-200 text-slate-900'
          : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/20 text-white'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> সুপার অ্যাডমিন
              </span>
              <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                গপ্পো কাহিনী এন্টারটেইনমেন্ট
              </span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold font-serif-story tracking-wide ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              স্বাগতম, জয়! আজকের পোর্টাল পর্যবেক্ষণ
            </h2>
            <p className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}>
              আপনার অডিও গল্প প্ল্যাটফর্মের গ্রাহক পেমেন্ট, স্টোরি আপলোড, কথক অডিশন ও ইউজারদের জীবনের গল্প এক জায়গা থেকে পরিচালনা করুন।
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => onNavigate('stories')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              নতুন গল্প আপলোড
            </button>

            <button
              onClick={onSyncFirestore}
              disabled={isSyncing}
              className={`px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="ফায়ারবেস ক্লাউডে গল্প ব্যাকআপ ও সিঙ্ক করুন"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'ফায়ারবেস সিঙ্ক'}</span>
            </button>
          </div>
        </div>

        {syncSuccessMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{syncSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className={`rounded-2xl border p-4 relative overflow-hidden group transition-all shadow-md ${
          isLight
            ? 'bg-white border-slate-200 hover:border-indigo-400'
            : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/40'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>মোট সংগৃহীত আয়</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            ₹{totalRevenueINR}
          </div>
          <div className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            + {totalRevenueBDT} BDT (বিকাশ/নগদ)
          </div>
        </div>

        {/* Verified Subscribers */}
        <div className={`rounded-2xl border p-4 relative overflow-hidden group transition-all shadow-md ${
          isLight
            ? 'bg-white border-slate-200 hover:border-emerald-400'
            : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>ভেরিফাইড সাবস্ক্রাইবার</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {verifiedSubscribersCount} জন
          </div>
          <div className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            সক্রিয় পেইড গ্রাহক লিড
          </div>
        </div>

        {/* Total Audio Stories */}
        <div className={`rounded-2xl border p-4 relative overflow-hidden group transition-all shadow-md ${
          isLight
            ? 'bg-white border-slate-200 hover:border-amber-400'
            : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>অনলাইন অডিও গল্প</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Music className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {storiesCount} টি
          </div>
          <div className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            কাহিনি ক্যাটালগে লাইভ
          </div>
        </div>

        {/* Life Stories Podcasts */}
        <div className={`rounded-2xl border p-4 relative overflow-hidden group transition-all shadow-md ${
          isLight
            ? 'bg-white border-slate-200 hover:border-indigo-400'
            : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/40'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>মানুষের জীবন কথা</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {podcastsCount} পর্ব
          </div>
          <div className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            পডকাস্ট ও মানুষের বাস্তব কথা
          </div>
        </div>
      </div>

      {/* Actionable Urgent Attention Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Payments */}
        <div className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all shadow-md ${
          isLight
            ? 'bg-amber-50/70 border-amber-200 text-slate-800'
            : 'bg-slate-900/90 border-amber-500/30 text-white'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> পেমেন্ট যাচাই
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-300">{pendingPaymentsCount}টি বাকি</span>
            </div>
            <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>পেন্ডিং সাবস্ক্রিপশন পেমেন্ট</h3>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              গ্রাহকদের ইউপিআই ও বিকাশ ট্রানজ্যাকশন আইডি ও স্ক্রিনশট যাচাই করে সাবস্ক্রিপশন অনুমোদন করুন।
            </p>
          </div>
          <button
            onClick={() => onNavigate('payments')}
            className="mt-4 w-full py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-200 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>পেমেন্ট ম্যানেজমেন্টে যান</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pending Narrator Auditions */}
        <div className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all shadow-md ${
          isLight
            ? 'bg-rose-50/70 border-rose-200 text-slate-800'
            : 'bg-slate-900/90 border-rose-500/30 text-white'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/20 text-rose-600 dark:text-rose-300 flex items-center gap-1">
                <Mic className="w-3.5 h-3.5" /> কথক অডিশন
              </span>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-300">{pendingAuditionsCount}টি অডিশন</span>
            </div>
            <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>নতুন কথক আবেদন</h3>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              ভয়েস আর্টিস্টদের অডিও স্যাম্পল ও স্টুডিও ইকুইপমেন্ট পর্যালোচনা করে ইউনিক নারেটর কোড প্রদান করুন।
            </p>
          </div>
          <button
            onClick={() => onNavigate('narrators')}
            className="mt-4 w-full py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-200 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>অডিশন পর্যালোচনা করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* New Life Stories Submissions */}
        <div className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all shadow-md ${
          isLight
            ? 'bg-indigo-50/70 border-indigo-200 text-slate-800'
            : 'bg-slate-900/90 border-indigo-500/30 text-white'
        }`}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> মানুষের জীবন কথা
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">{newLifeStoriesCount}টি জমা</span>
            </div>
            <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>শ্রোতাদের পাঠানো জীবনের গল্প</h3>
            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              সাধারণ মানুষের পাঠানো জীবনের ঘাত-প্রতিঘাত ও সত্য অভিজ্ঞতা পড়ে পডকাস্ট রেকর্ডিংয়ের জন্য যোগাযোগ করুন।
            </p>
          </div>
          <button
            onClick={() => onNavigate('lifestories')}
            className="mt-4 w-full py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-200 border border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>জমা দেওয়া গল্প দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
