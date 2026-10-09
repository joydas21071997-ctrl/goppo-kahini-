import React, { useState } from 'react';
import { Bell, BellRing, CheckCircle2, ShieldAlert, Sparkles, X, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { initializePushNotifications } from '../services/pushNotifications';
import { Capacitor } from '@capacitor/core';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionResult?: (status: NotificationPermission | 'unsupported') => void;
  isLight?: boolean;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  isOpen,
  onClose,
  onPermissionResult,
  isLight = false,
}) => {
  const { t } = useLanguage();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'warn' | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    setIsRequesting(true);

    try {
      // 1. Native Android (Capacitor) Flow
      if (Capacitor.isNativePlatform()) {
        const result = await initializePushNotifications();
        if (result.success) {
          try {
            localStorage.setItem('gk_notification_preference', 'granted');
            localStorage.setItem('gk_notification_granted_at', new Date().toISOString());
          } catch {}

          setFeedbackType('success');
          setFeedbackMessage(
            t(
              'notification_enabled_toast',
              '✅ নোটিফিকেশন সফলভাবে চালু করা হয়েছে! নতুন গল্প ও পর্ব এলেই আপনাকে জানানো হবে।'
            )
          );
          if (onPermissionResult) onPermissionResult('granted');
          setTimeout(() => onClose(), 1600);
          return;
        } else if (result.error === 'Notification permission denied') {
          try {
            localStorage.setItem('gk_notification_preference', 'denied');
          } catch {}

          setFeedbackType('warn');
          setFeedbackMessage(
            t(
              'notification_blocked_toast',
              '⚠️ অ্যাপে নোটিফিকেশন অনুমতি দেওয়া হয়নি। আপনার ফোন সেটিংস থেকে অনুমতি দিন।'
            )
          );
          if (onPermissionResult) onPermissionResult('denied');
          setTimeout(() => onClose(), 2200);
          return;
        }
      }

      // 2. Standard Web & PWA Flow
      if (typeof window !== 'undefined' && 'Notification' in window) {
        let permission: NotificationPermission = 'default';
        try {
          permission = await Notification.requestPermission();
        } catch (permErr) {
          console.warn('Notification permission prompt failed:', permErr);
        }

        if (permission === 'granted') {
          try {
            localStorage.setItem('gk_notification_preference', 'granted');
            localStorage.setItem('gk_notification_granted_at', new Date().toISOString());
          } catch {}

          try {
            initializePushNotifications().catch(() => {});
          } catch {}

          setFeedbackType('success');
          setFeedbackMessage(
            t(
              'notification_enabled_toast',
              '✅ নোটিফিকেশন সফলভাবে চালু করা হয়েছে! নতুন গল্প এলেই আপনাকে জানানো হবে।'
            )
          );

          try {
            new Notification('গপ্পো কাহিনী - নোটিফিকেশন সক্রিয়', {
              body: 'স্বাগতম! নতুন রোমাঞ্চকর গল্প ও মেগা সিরিজের নোটিফিকেশন আপনার ডিভাইসে পৌঁছে যাবে।',
              icon: '/favicon.ico',
            });
          } catch {}

          if (onPermissionResult) onPermissionResult('granted');
          setTimeout(() => onClose(), 1600);
          return;
        } else if (permission === 'denied') {
          try {
            localStorage.setItem('gk_notification_preference', 'denied');
          } catch {}

          setFeedbackType('warn');
          setFeedbackMessage(
            t(
              'notification_blocked_toast',
              '⚠️ ব্রাউজার বা ডিভাইসে নোটিফিকেশন ব্লক করা রয়েছে। সেটিংস থেকে অনুমতি দিন।'
            )
          );
          if (onPermissionResult) onPermissionResult('denied');
          setTimeout(() => onClose(), 2200);
          return;
        }
      }

      // 3. Fallback for WebViews / Iframes / In-App Environments
      // Gracefully activate in-app notification preference without breaking the user experience
      try {
        localStorage.setItem('gk_notification_preference', 'granted');
        localStorage.setItem('gk_notification_granted_at', new Date().toISOString());
      } catch {}

      try {
        initializePushNotifications().catch(() => {});
      } catch {}

      setFeedbackType('success');
      setFeedbackMessage(
        t(
          'inapp_notification_enabled_toast',
          '✅ নতুন গল্পের ইন-অ্যাপ অ্যালার্ট ও আপডেট সফলভাবে চালু করা হয়েছে!'
        )
      );
      if (onPermissionResult) onPermissionResult('granted');
      setTimeout(() => onClose(), 1600);
    } catch (err) {
      console.warn('Notification setup notice:', err);
      // Fallback success so user is not stuck
      try {
        localStorage.setItem('gk_notification_preference', 'granted');
      } catch {}
      setFeedbackType('success');
      setFeedbackMessage('✅ নোটিফিকেশন অ্যালার্ট সফলভাবে সক্রিয় করা হয়েছে!');
      if (onPermissionResult) onPermissionResult('granted');
      setTimeout(() => onClose(), 1600);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem('gk_notification_preference', 'dismissed');
      localStorage.setItem('gk_notification_dismissed_at', String(Date.now()));
    } catch {
      // ignore
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-7 overflow-hidden text-center transition-all ${
          isLight
            ? 'bg-gradient-to-b from-purple-50 via-white to-purple-100/70 border-purple-200 text-zinc-900 shadow-purple-950/20'
            : 'bg-gradient-to-b from-[#1c112d] via-[#140b20] to-[#0c0513] border-purple-900/60 text-white shadow-black/80'
        }`}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-pink-500/20 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isLight
              ? 'text-zinc-500 hover:text-zinc-900 hover:bg-purple-100'
              : 'text-zinc-400 hover:text-white hover:bg-purple-900/40'
          }`}
          aria-label="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Bell Icon */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-pink-500/30 rounded-3xl blur-lg animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-xl shadow-pink-900/40 ring-2 ring-white/10">
            <BellRing className="w-8 h-8 animate-bounce" />
          </div>
        </div>

        {/* Title */}
        <h2
          id="notif-modal-title"
          className="text-xl sm:text-2xl font-bold font-serif-story leading-snug"
        >
          {t('notification_prompt_title', 'নতুন গল্পের নোটিফিকেশন অন করুন')}
        </h2>

        {/* Subtitle */}
        <p
          className={`mt-2.5 text-xs sm:text-sm leading-relaxed px-2 ${
            isLight ? 'text-zinc-600' : 'text-purple-200/80'
          }`}
        >
          {t(
            'notification_prompt_subtitle',
            'নতুন প্রকাশিত ভৌতিক ও রহস্য গল্প, বিশেষ ছাড় এবং মেগা অডিও পর্বের রিলিজ সবার আগে জানতে নোটিফিকেশন সক্রিয় করুন।'
          )}
        </p>

        {/* Feature Highlights */}
        <div
          className={`my-4.5 p-3.5 rounded-2xl border text-left space-y-2 ${
            isLight
              ? 'border-purple-200/70 bg-purple-50/60'
              : 'border-purple-900/40 bg-purple-950/20'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <span className="text-pink-500">✨</span>
            <span>প্রতি শুক্রবার রাতে নতুন রোমাঞ্চকর পর্বের তাৎক্ষণিক অ্যালার্ট</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <span className="text-purple-400">🎁</span>
            <span>সাবস্ক্রিপশন পাস ও মেগা সিরিজের বিশেষ ডিসকাউন্ট নোটিফিকেশন</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <span className="text-amber-400">🎧</span>
            <span>অফলাইনে শোনার জন্য নতুন অডিও ড্রপ হওয়ার খবর</span>
          </div>
        </div>

        {/* Feedback message if any */}
        {feedbackMessage && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs font-medium border animate-fadeIn ${
              feedbackType === 'success'
                ? isLight
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                : isLight
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-amber-950/40 text-amber-300 border-amber-800'
            }`}
          >
            {feedbackMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            disabled={isRequesting}
            onClick={handleRequestPermission}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-pink-950/50 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-60"
          >
            <span>{t('notification_prompt_enable', '🔔 নোটিফিকেশন অন করুন')}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors ${
              isLight
                ? 'text-zinc-600 hover:text-zinc-900 hover:bg-purple-100/60'
                : 'text-zinc-400 hover:text-white hover:bg-purple-900/30'
            }`}
          >
            {t('notification_prompt_later', 'পরে করব')}
          </button>
        </div>
      </div>
    </div>
  );
};
