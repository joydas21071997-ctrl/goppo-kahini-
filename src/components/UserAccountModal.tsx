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
import { useLanguage } from '../context/LanguageContext';

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
  const { t, language } = useLanguage();
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
  let formattedExpiry = language === 'hi' ? 'निर्धारित नहीं' : language === 'en' ? 'Not set' : 'নির্ধারিত নেই';

  if (expiryDateString) {
    const expiry = new Date(expiryDateString);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    try {
      const locale = language === 'hi' ? 'hi-IN' : language === 'en' ? 'en-US' : 'bn-BD';
      formattedExpiry = expiry.toLocaleDateString(locale, {
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
      setPasswordStatus({ type: 'error', message: t('password_min_chars', 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।') });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: t('password_mismatch', 'নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না।') });
      return;
    }

    try {
      await changeUserPassword(newPassword);
      setPasswordStatus({ type: 'success', message: t('password_changed_success', 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!') });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordStatus(null);
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('password_change_failed', 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।');
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
                {t('account_title', 'শ্রোতা অ্যাকাউন্ট ও প্রোফাইল')}
              </h2>
              <p className="text-[11px] text-zinc-400">{t('account_sub', 'আপনার সাবস্ক্রিপশন, পাস ও ব্যক্তিগত তথ্য')}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1f132e] text-zinc-400 hover:text-white border border-purple-900/30 transition-colors"
            title={t('close', 'বন্ধ করুন')}
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
                <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-white shadow-md ring-2 ring-[#140c20]" title="Premium Pass">
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
                  {currentUser.provider === 'google' ? 'Google Account' : (language === 'bn' ? 'ইমেইল অ্যাকাউন্ট' : language === 'hi' ? 'ईमेल खाता' : 'Email Account')}
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-zinc-400">
                <Mail className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                <span className="truncate">{currentUser.email}</span>
              </div>

              <div className="pt-1 flex items-center justify-center sm:justify-start gap-2 text-[11px] text-zinc-500">
                <span>{language === 'bn' ? 'যোগদান: ' : language === 'hi' ? 'शामिल हुए: ' : 'Joined: '}{new Date(currentUser.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : language === 'hi' ? 'hi-IN' : 'en-US')}</span>
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
                      {language === 'bn' ? 'গপ্পো কাহিনী মাসিক পাস' : 'Goppo Kahini Monthly Pass'}
                    </h4>
                    {isSubscribed ? (
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                        {language === 'bn' ? 'ACTIVE (সক্রিয়)' : language === 'hi' ? 'सक्रिय (ACTIVE)' : 'ACTIVE'}
                      </span>
                    ) : (
                      <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 text-[10px] font-bold text-rose-300">
                        {subscription?.status === 'expired' 
                          ? (language === 'bn' ? 'EXPIRED (মেয়াদোত্তীর্ণ)' : language === 'hi' ? 'समाप्त (EXPIRED)' : 'EXPIRED')
                          : (language === 'bn' ? 'FREE (পাস নেই)' : language === 'hi' ? 'FREE (पास नहीं है)' : 'FREE')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    {isSubscribed 
                      ? (language === 'bn' ? 'প্রিমিয়াম অডিও গল্প, নতুন রিলিজ ও পূর্ণ গল্প শুনুন' : language === 'hi' ? 'प्रीमियम ऑडियो कहानियाँ, नए रिलीज़ और पूरी कहानियाँ सुनें' : 'Listen to premium stories, new releases, and full audiobooks')
                      : (language === 'bn' ? 'প্রিমিয়াম গল্প শুনতে পাস সক্রিয় করুন' : language === 'hi' ? 'प्रीमियम कहानियाँ सुनने के लिए पास सक्रिय करें' : 'Activate pass to unlock all premium audio stories')}
                  </p>
                </div>
              </div>
            </div>

            {/* Pass Validity Details */}
            <div className="mt-3.5 pt-3 border-t border-purple-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-purple-400" />
                  {language === 'bn' ? 'মেয়াদ শেষ:' : language === 'hi' ? 'वैधता समाप्त:' : 'Valid Until:'}
                </span>
                <span className="font-semibold text-white">
                  {formattedExpiry}
                </span>
              </div>

              {isSubscribed && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-pink-400" />
                    {language === 'bn' ? 'অবশিষ্ট সময়:' : language === 'hi' ? 'शेष समय:' : 'Time Remaining:'}
                  </span>
                  <span className={`font-bold ${daysRemaining <= 3 ? 'text-rose-400' : daysRemaining <= 7 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {daysRemaining > 0 ? `${daysRemaining} ${t('account_days_remaining', 'দিন বাকি')}` : t('account_today_last_day', 'আজই শেষ দিন')}
                  </span>
                </div>
              )}

              {/* Renewal Reminder Alerts (User Flow: 7 days, 3 days, 1 day, expired) */}
              {isSubscribed && isUrgentExpiry && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/40 p-2.5 text-xs text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                  <div className="flex-1">
                    <p className="font-semibold">
                      {language === 'bn' 
                        ? `আপনার Monthly Pass-এর মেয়াদ আর ${daysRemaining} দিন পরে শেষ হবে।`
                        : language === 'hi'
                        ? `आपके Monthly Pass की वैधता ${daysRemaining} दिनों में समाप्त हो जाएगी।`
                        : `Your Monthly Pass will expire in ${daysRemaining} day(s).`}
                    </p>
                    <p className="text-[11px] text-amber-300/80 mt-0.5">
                      {language === 'bn' ? 'নির্বিঘ্নে গল্প উপভোগ চালিয়ে যেতে এখনই আপনার পাস রিনিউ করে নিন।' : language === 'hi' ? 'निर्बाध कहानियों का आनंद लेने के लिए अभी अपना पास रिन्यू करें।' : 'Renew your pass now to continue uninterrupted listening.'}
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
                      {language === 'bn' ? 'আপনার Premium Pass-এর মেয়াদ শেষ হয়েছে (অথবা এখনও সক্রিয় করা হয়নি)।' : language === 'hi' ? 'आपके Premium Pass की अवधि समाप्त हो चुकी है (या अभी सक्रिय नहीं है)।' : 'Your Premium Pass has expired (or has not been activated yet).'}
                    </p>
                    <p className="text-[11px] text-rose-300/80 mt-0.5">
                      {language === 'bn' ? 'আপনার অ্যাকাউন্ট ও সংরক্ষিত বুকমার্ক বহাল আছে। প্রিমিয়াম গল্প শুনতে পাস সক্রিয় করুন।' : language === 'hi' ? 'आपका खाता और बुकमार्क सुरक्षित हैं। प्रीमियम कहानियों के लिए पास सक्रिय करें।' : 'Your account and bookmarks are safe. Activate pass to listen to premium stories.'}
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
                <span>{isSubscribed ? t('account_renew_pass', 'পাস রিনিউ করুন') : t('take_pass_btn', 'মাসিক পাস নিন')}</span>
              </button>
            </div>

            {/* Quick Simulation Bar (To preview 30 days, 7 days, 3 days, 1 day, Expired) */}
            {onUpdateSubscriptionExpiry && (
              <div className="mt-3 pt-2.5 border-t border-purple-900/30 flex flex-wrap items-center justify-between gap-1 text-[10px]">
                <span className="text-zinc-500">{t('reminder_test_preview', 'রিমাইন্ডার টেস্ট প্রিভিউ:')}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setSimulatedDays(30)}
                    className="px-1.5 py-0.5 rounded bg-purple-900/40 hover:bg-purple-800 text-purple-300 transition-colors"
                  >
                    {t('days_30', '৩০ দিন')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedDays(7)}
                    className="px-1.5 py-0.5 rounded bg-amber-900/40 hover:bg-amber-800 text-amber-300 transition-colors"
                  >
                    {t('days_7', '৭ দিন')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedDays(3)}
                    className="px-1.5 py-0.5 rounded bg-amber-900/40 hover:bg-amber-800 text-amber-300 transition-colors"
                  >
                    {t('days_3', '৩ দিন')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedDays(1)}
                    className="px-1.5 py-0.5 rounded bg-rose-900/40 hover:bg-rose-800 text-rose-300 transition-colors"
                  >
                    {t('days_1', '১ দিন')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedDays(-1)}
                    className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  >
                    {t('expired_label', 'মেয়াদ শেষ')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Shortcuts: Bookmarks & Listening History */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-1">
              {language === 'bn' ? 'আমার লাইব্রেরি শর্টকাট' : language === 'hi' ? 'मेरी लाइब्रेरी शॉर्टकट' : 'My Library Shortcuts'}
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
                  <p className="font-semibold text-white">{t('saved_bookmarks', 'সংরক্ষিত গল্প')}</p>
                  <p className="text-[10px] text-zinc-400">{language === 'bn' ? 'আমার বুকমার্ক' : language === 'hi' ? 'मेरे बुकमार्क' : 'My Bookmarks'}</p>
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
                  <p className="font-semibold text-white">{t('listening_history', 'শোনার ইতিহাস')}</p>
                  <p className="text-[10px] text-zinc-400">{language === 'bn' ? 'পূর্বে যা শুনেছেন' : language === 'hi' ? 'पहले जो सुना' : 'Previously heard'}</p>
                </div>
              </button>
            </div>
          </div>

          {/* 4. Security: Change Password & Forgot Password */}
          <div className="rounded-2xl border border-purple-900/40 bg-[#1a1129] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-bold text-white">{language === 'bn' ? 'অ্যাকাউন্ট সিকিউরিটি' : language === 'hi' ? 'खाता सुरक्षा' : 'Account Security'}</span>
              </div>
              
              <button
                type="button"
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="text-xs font-medium text-pink-400 hover:text-pink-300"
              >
                {showChangePassword ? (language === 'bn' ? 'বাতিল' : language === 'hi' ? 'रद्द करें' : 'Cancel') : t('account_change_password', 'পাসওয়ার্ড পরিবর্তন')}
              </button>
            </div>

            {/* Change Password Form */}
            {showChangePassword && (
              <form onSubmit={handleChangePassword} className="space-y-2.5 pt-2 border-t border-purple-900/30 animate-fadeIn">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">{language === 'bn' ? 'পুরাতন পাসওয়ার্ড' : language === 'hi' ? 'पुराना पासवर्ड' : 'Current Password'}</label>
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-purple-900/50 bg-black/40 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">{language === 'bn' ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : language === 'hi' ? 'नया पासवर्ड (कम से कम 6 अक्षर)' : 'New Password (min 6 chars)'}</label>
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-purple-900/50 bg-black/40 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">{language === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : language === 'hi' ? 'नए पासवर्ड की पुष्टि करें' : 'Confirm New Password'}</label>
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
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
                    <span>{showPasswordText ? (language === 'bn' ? 'পাসওয়ার্ড লুকান' : language === 'hi' ? 'पासवर्ड छुपाएं' : 'Hide Password') : (language === 'bn' ? 'পাসওয়ার্ড দেখুন' : language === 'hi' ? 'पासवर्ड देखें' : 'Show Password')}</span>
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-1.5 text-xs font-bold text-white transition-all shadow-md"
                  >
                    {language === 'bn' ? 'পাসওয়ার্ড সংরক্ষণ' : language === 'hi' ? 'पासवर्ड सहेजें' : 'Save Password'}
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
              <span className="text-zinc-400">{t('auth_forgot_pass', 'পাসওয়ার্ড ভুলে গেছেন?')}</span>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-purple-300 hover:text-pink-300 font-medium"
              >
                {language === 'bn' ? 'রিসেট লিংক পাঠান' : language === 'hi' ? 'रीसेट लिंक भेजें' : 'Send Reset Link'}
              </button>
            </div>

            {forgotPasswordSent && (
              <div className="rounded-xl bg-purple-950/50 border border-purple-500/40 p-2.5 text-xs text-purple-200 flex items-center gap-2">
                <Send className="h-4 w-4 text-pink-400 shrink-0" />
                <span>{language === 'bn' ? `আপনার ইমেইলে (${currentUser.email}) পাসওয়ার্ড রিসেট করার নির্দেশনা পাঠানো হয়েছে।` : language === 'hi' ? `आपके ईमेल (${currentUser.email}) पर पासवर्ड रीसेट निर्देश भेजे गए हैं।` : `Password reset instructions sent to ${currentUser.email}.`}</span>
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
              <span>{t('logout', 'অ্যাকাউন্ট থেকে লগআউট করুন')}</span>
            </button>
            <p className="text-center text-[10px] text-zinc-500 mt-2">
              {language === 'bn' ? 'লগআউট করলেও আপনার সংরক্ষিত সাবস্ক্রিপশন ও ডেটা মুছে যাবে না।' : language === 'hi' ? 'लॉगआउट करने पर भी आपकी सदस्यता और डेटा सुरक्षित रहेगा।' : 'Logging out will not delete your saved subscription or bookmarks.'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
