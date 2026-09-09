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
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner with Joy Super Admin Greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/80 via-pink-950/40 to-[#1b0c2e] border border-purple-800/40 p-5 sm:p-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> সুপার অ্যাডমিন
              </span>
              <span className="text-xs text-purple-300/80">গপ্পো কাহিনী এন্টারটেইনমেন্ট</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-serif-story tracking-wide">
              স্বাগতম, জয়! আজকের পোর্টাল পর্যবেক্ষণ
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-2xl leading-relaxed">
              আপনার অডিও গল্প প্ল্যাটফর্মের গ্রাহক পেমেন্ট, স্টোরি আপলোড, কত্থক অডিশন ও ইউজারদের জীবনের গল্প এক জায়গা থেকে পরিচালনা করুন।
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => onNavigate('stories')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-pink-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              নতুন গল্প আপলোড
            </button>

            <button
              onClick={onSyncFirestore}
              disabled={isSyncing}
              className="px-3.5 py-2.5 rounded-xl bg-purple-900/50 hover:bg-purple-900/80 text-purple-200 border border-purple-700/50 text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="ফায়ারবেস ক্লাউডে গল্প ব্যাকআপ ও সিঙ্ক করুন"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'ফায়ারবেস সিঙ্ক'}</span>
            </button>
          </div>
        </div>

        {syncSuccessMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{syncSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="bg-[#1a0e2e]/90 rounded-2xl border border-purple-900/40 p-4 relative overflow-hidden group hover:border-pink-500/40 transition-colors">
          <div className="flex items-center justify-between text-purple-300 mb-2">
            <span className="text-xs font-medium">মোট সংগৃহীত আয়</span>
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            ₹{totalRevenueINR}
          </div>
          <div className="text-[11px] text-purple-300/70 mt-1">
            + {totalRevenueBDT} BDT (বিকাশ/নগদ)
          </div>
        </div>

        {/* Verified Subscribers */}
        <div className="bg-[#1a0e2e]/90 rounded-2xl border border-purple-900/40 p-4 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between text-purple-300 mb-2">
            <span className="text-xs font-medium">ভেরিফাইড সাবস্ক্রাইবার</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {verifiedSubscribersCount} জন
          </div>
          <div className="text-[11px] text-purple-300/70 mt-1">
            সক্রিয় পেইড গ্রাহক লিড
          </div>
        </div>

        {/* Total Audio Stories */}
        <div className="bg-[#1a0e2e]/90 rounded-2xl border border-purple-900/40 p-4 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-purple-300 mb-2">
            <span className="text-xs font-medium">অনলাইন অডিও গল্প</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Music className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {storiesCount} টি
          </div>
          <div className="text-[11px] text-purple-300/70 mt-1">
            কাহিনি ক্যাটালগে লাইভ
          </div>
        </div>

        {/* Life Stories Podcasts */}
        <div className="bg-[#1a0e2e]/90 rounded-2xl border border-purple-900/40 p-4 relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center justify-between text-purple-300 mb-2">
            <span className="text-xs font-medium">মানুষের জীবন কথা</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {podcastsCount} পর্ব
          </div>
          <div className="text-[11px] text-purple-300/70 mt-1">
            পডকাস্ট ও মানুষের বাস্তব কথা
          </div>
        </div>
      </div>

      {/* Actionable Urgent Attention Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Payments */}
        <div className="bg-gradient-to-b from-[#201037] to-[#170a2a] rounded-2xl border border-amber-500/30 p-4.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/20 text-amber-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> পেমেন্ট যাচাই
              </span>
              <span className="text-xs font-bold text-amber-300">{pendingPaymentsCount}টি বাকি</span>
            </div>
            <h3 className="text-sm font-semibold text-white">পেন্ডিং সাবস্ক্রিপশন পেমেন্ট</h3>
            <p className="text-xs text-purple-300/80 mt-1 leading-relaxed">
              গ্রাহকদের ইউপিআই ও বিকাশ ট্রানজ্যাকশন আইডি ও স্ক্রিনশট যাচাই করে সাবস্ক্রিপশন অনুমোদন করুন।
            </p>
          </div>
          <button
            onClick={() => onNavigate('payments')}
            className="mt-4 w-full py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>পেমেন্ট ম্যানেজমেন্টে যান</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pending Narrator Auditions */}
        <div className="bg-gradient-to-b from-[#201037] to-[#170a2a] rounded-2xl border border-pink-500/30 p-4.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-pink-500/20 text-pink-300 flex items-center gap-1">
                <Mic className="w-3.5 h-3.5" /> কথক অডিশন
              </span>
              <span className="text-xs font-bold text-pink-300">{pendingAuditionsCount}টি অডিশন</span>
            </div>
            <h3 className="text-sm font-semibold text-white">নতুন কথক আবেদন</h3>
            <p className="text-xs text-purple-300/80 mt-1 leading-relaxed">
              ভয়েস আর্টিস্টদের অডিও স্যাম্পল ও স্টুডিও ইকুইপমেন্ট পর্যালোচনা করে ইউনিক নারেটর কোড প্রদান করুন।
            </p>
          </div>
          <button
            onClick={() => onNavigate('narrators')}
            className="mt-4 w-full py-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-pink-200 border border-pink-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>অডিশন পর্যালোচনা করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* New Life Stories Submissions */}
        <div className="bg-gradient-to-b from-[#201037] to-[#170a2a] rounded-2xl border border-indigo-500/30 p-4.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> মানুষের জীবন কথা
              </span>
              <span className="text-xs font-bold text-indigo-300">{newLifeStoriesCount}টি জমা</span>
            </div>
            <h3 className="text-sm font-semibold text-white">শ্রোতাদের পাঠানো জীবনের গল্প</h3>
            <p className="text-xs text-purple-300/80 mt-1 leading-relaxed">
              সাধারণ মানুষের পাঠানো জীবনের ঘাত-প্রতিঘাত ও সত্য অভিজ্ঞতা পড়ে পডকাস্ট রেকর্ডিংয়ের জন্য যোগাযোগ করুন।
            </p>
          </div>
          <button
            onClick={() => onNavigate('lifestories')}
            className="mt-4 w-full py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200 border border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>জমা দেওয়া গল্প দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
