import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Crown,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  LogOut,
  Sparkles,
  KeyRound,
  ShieldCheck,
  Bookmark,
  Headphones,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronRight,
  Send
} from 'lucide-react';
import { AudienceUser, UserSubscription } from '../types';
import { sendPasswordReset, changeUserPassword } from '../services/firebaseAuth';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AudienceUser | null;
  subscription: UserSubscription;
  onLogoutUser: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenBookmarks: () => void;
  onOpenHistory: () => void;
  onUpdateSubscriptionExpiry?: (newExpiryDate: string, status: 'active' | 'expired') => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  subscription,
  onLogoutUser,
  onOpenSubscriptionModal,
  onOpenBookmarks,
  onOpenHistory,
  onUpdateSubscriptionExpiry,
}) => {
  // Tabs within User Account
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Forgot password notice
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  if (!isOpen || !currentUser) return null;

  // Calculate subscription validity & remaining days
  const isSubscribed = subscription?.status === 'active';
  const expiryDateString = subscription?.subscriptionExpiryDate || subscription?.nextBillingDate || '';
  
  let daysRemaining = 0;
  let formattedExpiry = 'নির্ধারিত নেই';

  if (expiryDateString) {
    const expiry = new Date(expiryDateString);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    try {
      formattedExpiry = expiry.toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      formattedExpiry = expiryDateString;
    }
  }

  // Renewal reminder state detection
  const isUrgentExpiry = isSubscribed && daysRemaining <= 7 && daysRemaining >= 0;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না।' });
      return;
    }

    try {
      await changeUserPassword(newPassword);
      setPasswordStatus({ type: 'success', message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordStatus(null);
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।';
      setPasswordStatus({ type: 'error', message: msg });
    }
  };

  const handleForgotPassword = async () => {
    if (!currentUser?.email) return;
    try {
      await sendPasswordReset(currentUser.email);
    } catch (err: unknown) {
      console.warn('Password reset trigger error:', err);
    }
    setForgotPasswordSent(true);
    setTimeout(() => setForgotPasswordSent(false), 6000);
  };

  // Helper for quick simulation of renewal alerts (7 days, 3 days, 1 day, expired)
  const setSimulatedDays = (days: number) => {
    if (!onUpdateSubscriptionExpiry) return;
    const target = new Date();
    target.setDate(target.getDate() + days);
    const dateStr = target.toISOString().split('T')[0];
    onUpdateSubscriptionExpiry(dateStr, days < 0 ? 'expired' : 'active');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border border-purple-500/30 bg-[#140c20] shadow-2xl shadow-purple-950/60 overflow-hidden my-auto max-h-[92vh] flex flex-col text-white">
        
        {/* Top Accent Strip */}
        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400" />

        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 border-b border-purple-900/30 bg-[#140c20]/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-500/20 border border-purple-500/40 text-pink-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif-story text-base font-bold text-white">
                শ্রোতা অ্যাকাউন্ট ও প্রোফাইল
              </h2>
              <p className="text-[11px] text-zinc-400">আপনার সাবস্ক্রিপশন, পাস ও ব্যক্তিগত তথ্য</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1f132e] text-zinc-400 hover:text-white border border-purple-900/30 transition-colors"
            title="বন্ধ করুন"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          
          {/* 1. User Profile Card */}
          <div className="rounded-2xl border border-purple-900/40 bg-[#1a1129] p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-pink-500/50 shadow-md"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 font-bold text-2xl text-white border-2 border-pink-400/40 shadow-md">
                  {currentUser.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {isSubscribed && (
                <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-white shadow-md ring-2 ring-[#140c20]" title="প্রিমিয়াম পাস সক্রিয়">
                  <Crown className="h-3.5 w-3.5 fill-white" />
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="font-serif-story text-lg font-bold text-white">
                  {currentUser.displayName}
                </h3>
                <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                  {currentUser.provider === 'google' ? 'Google Account' : 'ইমেইল অ্যাকাউন্ট'}
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-zinc-400">
                <Mail className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                <span className="truncate">{currentUser.email}</span>
              </div>

              <div className="pt-1 flex items-center justify-center sm:justify-start gap-2 text-[11px] text-zinc-500">
                <span>যোগদান: {new Date(currentUser.createdAt).toLocaleDateString('bn-BD')}</span>
              </div>
            </div>
          </div>

          {/* 2. ₹20 Monthly Pass & Subscription Status Card */}
          <div className={`rounded-2xl border p-4 transition-all shadow-lg ${
            isSubscribed
              ? 'border-pink-500/40 bg-gradient-to-br from-purple-950/40 via-[#1d122b] to-[#160e22]'
              : 'border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-[#1d122b] to-[#160e22]'
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                  isSubscribed
                    ? 'bg-pink-500/20 border-pink-500/40 text-pink-400'
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                }`}>
                  <Crown className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">
                      গপ্পো কাহিনী ২০ টাকার মাসিক পাস
                    </h4>
                    {isSubscribed ? (
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                        ACTIVE (সক্রিয়)
                      </span>
                    ) : (
                      <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 text-[10px] font-bold text-rose-300">
                        {subscription?.status === 'expired' ? 'EXPIRED (মেয়াদোত্তীর্ণ)' : 'FREE (পাস নেই)'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    {isSubscribed ? 'প্রিমিয়াম অডিও গল্প, নতুন রিলিজ ও পূর্ণ গল্প শুনুন' : 'প্রিমিয়াম গল্প শুনতে পাস সক্রিয় করুন'}
                  </p>
                </div>
              </div>
            </div>

            {/* Pass Validity Details */}
            <div className="mt-3.5 pt-3 border-t border-purple-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-purple-400" />
                  Pass Active Until (মেয়াদ শেষ):
                </span>
                <span className="font-semibold text-white">
                  {formattedExpiry}
                </span>
              </div>

              {isSubscribed && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-pink-400" />
                    অবশিষ্ট সময়:
                  </span>
                  <span className={`font-bold ${daysRemaining <= 3 ? 'text-rose-400' : daysRemaining <= 7 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {daysRemaining > 0 ? `${daysRemaining} দিন বাকি` : 'আজই শেষ দিন'}
                  </span>
                </div>
              )}

              {/* Renewal Reminder Alerts (User Flow: 7 days, 3 days, 1 day, expired) */}
              {isSubscribed && isUrgentExpiry && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/40 p-2.5 text-xs text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                  <div className="flex-1">
                    <p className="font-semibold">
                      {daysRemaining === 1
                        ? 'আপনার Monthly Pass-এর মেয়াদ আর ১ দিন পরে শেষ হবে।'
                        : daysRemaining <= 3
                        ? `আপনার Monthly Pass-এর মেয়াদ আর ${daysRemaining} দিন পরে শেষ হবে।`
                        : `আপনার Monthly Pass-এর মেয়াদ আর ${daysRemaining} দিন পরে শেষ হবে।`}
                    </p>
                    <p className="text-[11px] text-amber-300/80 mt-0.5">
                      নির্বিঘ্নে গল্প উপভোগ চালিয়ে যেতে এখনই আপনার পাস রিনিউ করে নিন।
                    </p>
                  </div>
                </div>
              )}

              {/* Expired notice */}
              {!isSubscribed && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-2.5 text-xs text-rose-200 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">
                      আপনার Premium Pass-এর মেয়াদ শেষ হয়েছে (অথবা এখনও সক্রিয় করা হয়নি)।
                    </p>
                    <p className="text-[11px] text-rose-300/80 mt-0.5">
                      আপনার অ্যাকাউন্ট ও সংরক্ষিত বুকমার্ক বহাল আছে। প্রিমিয়াম গল্প শুনতে ₹২০-তে পাস সক্রিয় করুন।
                    </p>
                  </div>
                </div>
              )}

              {/* Action Button: Renew / Take Pass */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSubscriptionModal();
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 py-2.5 px-4 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all active:scale-98"
              >
                <Sparkles className="h-4 w-4 fill-white" />
                <span>{isSubscribed ? 'Renew Pass (₹২০ দিয়ে মেয়াদ বৃদ্ধি করুন)' : 'Renew for ₹20 (₹২০-তে পাস সক্রিয় করুন)'}</span>
              </button>
            </div>

            {/* Quick Simulation Bar (To preview 30 days, 7 days, 3 days, 1 day, Expired) */}
            {onUpdateSubscriptionExpiry && (
              <div className="mt-3 pt-2.5 border-t border-purple-900/30 flex flex-wrap items-center justify-between gap-1 text-[10px]">
                <span className="text-zinc-500">রিমাইন্ডার টেস্ট প্রিভিউ:</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setSimulatedDays(30)}
                    className="px-1.5 py-0.5 rounded bg-purple-900/40 hover:bg-purple-800 text-purple-300 transition-colors"
                  >
                    ৩০ দিন
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedDays(7)}
                    className="px-1.5 py-0.5 rounded bg-amber-900/40 hover:bg-amber-800 text-amber-300 transition-colors"
                  >
                    ৭ দিন
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedDays(3)}
                    className="px-1.5 py-0.5 rounded bg-amber-900/40 hover:bg-amber-800 text-amber-300 transition-colors"
                  >
                    ৩ দিন
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedDays(1)}
                    className="px-1.5 py-0.5 rounded bg-rose-900/40 hover:bg-rose-800 text-rose-300 transition-colors"
                  >
                    ১ দিন
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedDays(-1)}
                    className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  >
                    মেয়াদ শেষ
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Shortcuts: Bookmarks & Listening History */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-1">
              আমার লাইব্রেরি শর্টকাট
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBookmarks();
                }}
                className="flex items-center gap-2 rounded-xl border border-purple-900/40 bg-[#1a1129] hover:bg-[#231737] p-3 text-xs text-zinc-200 transition-all text-left"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400 shrink-0">
                  <Bookmark className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-white">সংরক্ষিত গল্প</p>
                  <p className="text-[10px] text-zinc-400">আমার বুকমার্ক</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHistory();
                }}
                className="flex items-center gap-2 rounded-xl border border-purple-900/40 bg-[#1a1129] hover:bg-[#231737] p-3 text-xs text-zinc-200 transition-all text-left"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 shrink-0">
                  <Headphones className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-white">শোনার ইতিহাস</p>
                  <p className="text-[10px] text-zinc-400">পূর্বে যা শুনেছেন</p>
                </div>
              </button>
            </div>
          </div>

          {/* 4. Security: Change Password & Forgot Password */}
          <div className="rounded-2xl border border-purple-900/40 bg-[#1a1129] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-bold text-white">অ্যাকাউন্ট সিকিউরিটি</span>
              </div>
              
              <button
                type="button"
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="text-xs font-medium text-pink-400 hover:text-pink-300"
              >
                {showChangePassword ? 'বাতিল' : 'পাসওয়ার্ড পরিবর্তন'}
              </button>
            </div>

            {/* Change Password Form */}
            {showChangePassword && (
              <form onSubmit={handleChangePassword} className="space-y-2.5 pt-2 border-t border-purple-900/30 animate-fadeIn">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">পুরাতন পাসওয়ার্ড</label>
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="বর্তমান পাসওয়ার্ড"
                    className="w-full rounded-xl border border-purple-900/50 bg-black/40 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)</label>
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="নতুন পাসওয়ার্ড দিন"
                    className="w-full rounded-xl border border-purple-900/50 bg-black/40 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="আবার লিখুন"
                    className="w-full rounded-xl border border-purple-900/50 bg-black/40 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
                  >
                    {showPasswordText ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span>{showPasswordText ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}</span>
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-1.5 text-xs font-bold text-white transition-all shadow-md"
                  >
                    পাসওয়ার্ড সংরক্ষণ
                  </button>
                </div>

                {passwordStatus && (
                  <div className={`p-2 rounded-xl text-xs flex items-center gap-2 ${
                    passwordStatus.type === 'success'
                      ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-950/50 text-rose-300 border border-rose-500/40'
                  }`}>
                    {passwordStatus.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                    <span>{passwordStatus.message}</span>
                  </div>
                )}
              </form>
            )}

            {/* Forgot Password trigger */}
            <div className="pt-2 border-t border-purple-900/30 flex items-center justify-between text-xs">
              <span className="text-zinc-400">পাসওয়ার্ড ভুলে গেছেন?</span>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-purple-300 hover:text-pink-300 font-medium"
              >
                রিসেট লিংক পাঠান
              </button>
            </div>

            {forgotPasswordSent && (
              <div className="rounded-xl bg-purple-950/50 border border-purple-500/40 p-2.5 text-xs text-purple-200 flex items-center gap-2">
                <Send className="h-4 w-4 text-pink-400 shrink-0" />
                <span>আপনার ইমেইলে ({currentUser.email}) পাসওয়ার্ড রিসেট করার নির্দেশনা পাঠানো হয়েছে।</span>
              </div>
            )}
          </div>

          {/* 5. Logout Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogoutUser();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-900/40 bg-rose-950/20 hover:bg-rose-950/40 py-2.5 px-4 text-xs font-semibold text-rose-300 hover:text-rose-200 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>অ্যাকাউন্ট থেকে লগআউট করুন</span>
            </button>
            <p className="text-center text-[10px] text-zinc-500 mt-2">
              লগআউট করলেও আপনার সংরক্ষিত সাবস্ক্রিপশন ও ডেটা মুছে যাবে না। পুনরায় লগইন করলেই ফেরত পাবেন।
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
