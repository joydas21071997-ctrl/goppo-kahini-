import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  Crown,
  CheckCircle2,
  Headphones,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import { AudienceUser } from '../types';
import {
  signInWithGoogle,
  loginWithEmail,
  registerWithEmail,
  sendPasswordReset,
  resendVerificationEmail,
  checkCurrentUserEmailVerification
} from '../services/firebaseAuth';
import {
  validateRealName,
  validateRealEmail,
  validateRealPhone,
  validateStrongPassword
} from '../utils/validation';
import { WORLD_COUNTRY_CODES } from '../data/countryCodes';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AudienceUser) => void;
  initialMessage?: string;
  triggerReason?: 'play_story' | 'take_pass' | 'general';
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMessage,
  triggerReason = 'general',
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Forgot password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Register state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhoneCountry, setRegisterPhoneCountry] = useState<string>('+91');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Verification Screen State
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [pendingUser, setPendingUser] = useState<AudienceUser | null>(null);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await signInWithGoogle();
      setSuccessNotice('Google অ্যাকাউন্টে সফলভাবে লগইন হয়েছে!');
      setTimeout(() => {
        onLoginSuccess(res.user);
        onClose();
      }, 500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google লগইনে ত্রুটি হয়েছে।';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await loginWithEmail(loginEmail, loginPassword);
      setSuccessNotice('স্বাগতম! সফলভাবে লগইন সম্পন্ন হয়েছে।');
      setTimeout(() => {
        onLoginSuccess(user);
        onClose();
      }, 400);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'লগইন ব্যর্থ হয়েছে।';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Strict Name Validation
    const nameCheck = validateRealName(registerName);
    if (!nameCheck.isValid) {
      setError(nameCheck.errorMessage || 'অনুগ্রহ করে আসল নাম লিখুন।');
      return;
    }

    // 2. Strict Email Validation
    const emailCheck = validateRealEmail(registerEmail);
    if (!emailCheck.isValid) {
      setError(emailCheck.errorMessage || 'অনুগ্রহ করে আসল ও সক্রিয় ইমেইল আইডি দিন।');
      return;
    }

    // 3. Strict Phone Validation
    const fullPhone = `${registerPhoneCountry}${registerPhone.replace(/\D/g, '')}`;
    const phoneCheck = validateRealPhone(fullPhone);
    if (!phoneCheck.isValid) {
      setError(phoneCheck.errorMessage || 'অনুগ্রহ করে আসল মোবাইল নম্বর দিন।');
      return;
    }

    // 4. Strict Password Validation
    const passCheck = validateStrongPassword(registerPassword);
    if (!passCheck.isValid) {
      setError(passCheck.errorMessage || 'শক্তিশালী পাসওয়ার্ড দিন।');
      return;
    }

    // 5. Confirm Password Check
    if (registerPassword !== registerConfirmPassword) {
      setError('পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মেলেনি। অনুগ্রহ করে আবার টাইপ করুন।');
      return;
    }

    setLoading(true);
    try {
      const { user, verificationSent } = await registerWithEmail(
        registerEmail,
        registerPassword,
        registerName,
        fullPhone
      );

      if (verificationSent) {
        setPendingUser(user);
        setAwaitingVerification(true);
        setSuccessNotice('আপনার জিমেইল/ইমেইলে একটি ভেরিফিকেশন লিঙ্ক পাঠানো হয়েছে!');
      } else {
        setSuccessNotice('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
        setTimeout(() => {
          onLoginSuccess(user);
          onClose();
        }, 500);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEmailVerification = async () => {
    setError('');
    setCheckingVerification(true);
    try {
      const res = await checkCurrentUserEmailVerification();
      if (res.isVerified) {
        setSuccessNotice('অভিনন্দন! আপনার ইমেইল সফলভাবে ভেরিফাইড হয়েছে।');
        const userToLog = res.user || (pendingUser ? { ...pendingUser, emailVerified: true } : null);
        if (userToLog) {
          setTimeout(() => {
            onLoginSuccess(userToLog);
            onClose();
          }, 600);
        }
      } else {
        setError('এখনো ইমেইলটি ভেরিফাই করা হয়নি। আপনার ইনবক্স অথবা স্প্যাম ফোল্ডারের লিঙ্কে ক্লিক করে ভেরিফাই করুন।');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ভেরিফিকেশন চেক করতে সমস্যা হয়েছে।';
      setError(message);
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleResendVerification = async () => {
    setError('');
    setResendingEmail(true);
    try {
      await resendVerificationEmail();
      setSuccessNotice('পুনরায় ভেরিফিকেশন লিঙ্ক পাঠানো হয়েছে! ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'লিঙ্ক পাঠাতে ব্যর্থ হয়েছে।';
      setError(message);
    } finally {
      setResendingEmail(false);
    }
  };

  const handleCancelVerification = () => {
    setAwaitingVerification(false);
    setPendingUser(null);
    setError('');
    setSuccessNotice('');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessNotice('');
    const targetEmail = (resetEmail || loginEmail).trim();
    if (!targetEmail) {
      setError('অনুগ্রহ করে আপনার অ্যাকাউন্টের ইমেইল আইডি দিন।');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordReset(targetEmail);
      setSuccessNotice(`আপনার ইমেইলে (${targetEmail}) পাসওয়ার্ড রিসেট করার একটি লিংক পাঠানো হয়েছে! ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'পাসওয়ার্ড রিসেট লিংক পাঠাতে সমস্যা হয়েছে।';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl border border-purple-500/30 bg-[#140c20] shadow-2xl shadow-purple-950/50 overflow-hidden my-auto text-white">
        
        {/* Top Accent Strip */}
        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#201432] text-zinc-400 hover:text-white transition-colors border border-purple-900/40"
          title="বন্ধ করুন"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5 sm:p-7">
          
          {/* Header Banner */}
          <div className="text-center space-y-2 border-b border-purple-900/30 pb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-pink-400 border border-purple-500/30 shadow-inner">
              <Headphones className="h-6 w-6 text-pink-400" />
            </div>
            
            <h2 className="font-serif-story text-xl font-bold text-white">
              শ্রোতা লগইন ও একাউন্ট
            </h2>
            
            <p className="text-xs text-purple-200/80 leading-relaxed">
              {initialMessage ||
                (triggerReason === 'play_story'
                  ? 'গল্প শুনতে এবং ২০ টাকার মাসিক পাস সক্রিয় করতে প্রথমে আপনার একাউন্টে লগইন করুন।'
                  : 'গপ্পো কাহিনীতে স্বাগতম! লগইন করুন এবং মাত্র ২০ টাকার পাসে সীমাহীন গল্প শুনুন।')}
            </p>
          </div>

          {/* Prompt banner for 20 Taka pass */}
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-[11px] text-amber-200">
            <Crown className="h-4 w-4 text-amber-400 shrink-0" />
            <span>লগইন শেষেই আপনি সরাসরি <strong>২০ টাকার মাসিক পাস</strong> নিয়ে সব গল্প শুনতে পারবেন।</span>
          </div>

          {/* Screen 1: Awaiting Email Verification */}
          {awaitingVerification ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-pink-500/40 bg-pink-950/25 p-4 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/40 animate-pulse">
                  <Mail className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">ইমেইল ভেরিফিকেশন পাঠানো হয়েছে</h3>
                  <p className="text-xs text-pink-200/90 mt-1">
                    আমরা <strong className="text-white underline">{registerEmail}</strong> ঠিকানায় একটি অফিশিয়াল ভেরিফিকেশন লিংক পাঠিয়েছি।
                  </p>
                </div>

                <div className="rounded-xl bg-black/40 p-2.5 text-[11px] text-zinc-300 text-left space-y-1 border border-pink-900/40">
                  <div className="flex items-center gap-1.5 text-pink-300 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5 text-pink-400" />
                    <span>ভেরিফিকেশন নির্দেশনা:</span>
                  </div>
                  <p>১. আপনার জিমেইল / ইমেইল ইনবক্স (বা স্প্যাম ফোল্ডার) খুলুন।</p>
                  <p>২. ফায়ারবেস থেকে পাঠানো লিঙ্কে ক্লিক করে ইমেইল নিশ্চিত করুন।</p>
                  <p>৩. এরপর নিচের বোতামে ক্লিক করে ভেরিফিকেশন চেক করুন।</p>
                </div>
              </div>

              {/* Alerts */}
              {error && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {successNotice && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{successNotice}</span>
                </div>
              )}

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleCheckEmailVerification}
                  disabled={checkingVerification}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all disabled:opacity-50 active:scale-98"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${checkingVerification ? 'animate-spin' : ''}`} />
                  <span>{checkingVerification ? 'যাচাই করা হচ্ছে...' : 'আমি ভেরিফাই করেছি / স্ট্যাটাস চেক করুন'}</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendingEmail}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-purple-900/50 bg-[#1c112b] py-2 text-xs font-semibold text-purple-200 hover:text-white hover:bg-purple-900/30 transition-all disabled:opacity-50"
                  >
                    <Mail className="h-3 w-3 text-pink-400" />
                    <span>{resendingEmail ? 'পাঠানো হচ্ছে...' : 'পুনরায় লিঙ্ক পাঠান'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelVerification}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-[#140c20] py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-all"
                  >
                    <span>← ফর্মে ফিরে যান</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Social Google Login Button (Guaranteed Real Account) */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl border border-purple-900/50 bg-[#1d122b] hover:bg-[#28183c] hover:border-pink-500/50 py-2.5 px-4 text-xs font-semibold text-white transition-all shadow-md active:scale-98 disabled:opacity-50"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Google / আসল জিমেইল দিয়ে সরাসরি লগইন</span>
                </button>
                <div className="mt-1 text-center">
                  <span className="text-[10px] text-emerald-400 font-medium">✓ ১০০% ভেরিফায়েড গুগল অ্যাকাউন্ট সুরক্ষা</span>
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-purple-900/40" />
                </div>
                <span className="relative bg-[#140c20] px-3 text-[10px] text-zinc-500 uppercase tracking-wider">
                  অথবা ইমেইল ও পাসওয়ার্ড
                </span>
              </div>

              {/* Tab Switcher: Login vs Register */}
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#1c112b] p-1 border border-purple-900/40 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setIsForgotPassword(false);
                    setError('');
                    setSuccessNotice('');
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 font-bold transition-all ${
                    tab === 'login' && !isForgotPassword
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>লগইন করুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setIsForgotPassword(false);
                    setError('');
                    setSuccessNotice('');
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 font-bold transition-all ${
                    tab === 'register'
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>নতুন একাউন্ট খুলুন</span>
                </button>
              </div>

              {/* Anti-Fraud Notice */}
              <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-purple-950/40 px-2.5 py-1.5 border border-purple-900/30 text-[10px] text-purple-300">
                <ShieldCheck className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                <span>নিরাপত্তা নিশ্চিত করতে ফেক জিমেইল, সাময়িক ইনবক্স বা ফেক ফোন নম্বর সম্পূর্ণ নিষিদ্ধ।</span>
              </div>

              {/* Alerts */}
              {error && (
                <div className="mt-3 rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {successNotice && (
                <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{successNotice}</span>
                </div>
              )}

              {/* FORM: Forgot Password Mode */}
              {isForgotPassword ? (
                <form onSubmit={handleResetPassword} className="mt-4 space-y-3">
                  <div className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 text-xs text-purple-200">
                    <p className="font-semibold text-white mb-1">পাসওয়ার্ড ভুলে গেছেন?</p>
                    <p className="text-[11px] text-purple-300/80">
                      আপনার নিবন্ধিত আসল ইমেইল আইডি দিন। আমরা Firebase-এর মাধ্যমে পাসওয়ার্ড রিসেট করার লিংক পাঠিয়ে দেব।
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-purple-200 block mb-1">
                      আপনার নিবন্ধিত ইমেইল আইডি *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-purple-400" />
                      <input
                        type="email"
                        required
                        placeholder="name@gmail.com"
                        value={resetEmail || loginEmail}
                        onChange={(e) => {
                          setResetEmail(e.target.value);
                          setLoginEmail(e.target.value);
                        }}
                        className="w-full rounded-xl border border-purple-900/40 bg-black/50 py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all active:scale-98 disabled:opacity-50"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>{loading ? 'লিংক পাঠানো হচ্ছে...' : 'পাসওয়ার্ড রিসেট লিংক পাঠান'}</span>
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setError('');
                        setSuccessNotice('');
                      }}
                      className="text-xs text-purple-300 hover:text-white transition-colors underline"
                    >
                      ← লগইন ফর্মে ফিরে যান
                    </button>
                  </div>
                </form>
              ) : tab === 'login' ? (
                /* FORM: Login */
                <form onSubmit={handleEmailLogin} className="mt-4 space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-purple-200 block mb-1">
                      আপনার ইমেইল আইডি *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-purple-400" />
                      <input
                        type="email"
                        required
                        placeholder="name@gmail.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full rounded-xl border border-purple-900/40 bg-black/50 py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-purple-200 block mb-1">
                      পাসওয়ার্ড *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-purple-400" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        placeholder="আপনার গোপন পাসওয়ার্ড"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full rounded-xl border border-purple-900/40 bg-black/50 py-2.5 pl-9 pr-9 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                      >
                        {showLoginPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError('');
                          setSuccessNotice('');
                          setResetEmail(loginEmail);
                        }}
                        className="text-[11px] text-purple-300 hover:text-pink-300 transition-colors font-medium"
                      >
                        পাসওয়ার্ড ভুলে গেছেন?
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all active:scale-98 disabled:opacity-50"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>{loading ? 'লগইন হচ্ছে...' : 'লগইন করুন ও এগিয়ে যান'}</span>
                  </button>
                </form>
              ) : (
                /* FORM: Register */
                <form onSubmit={handleEmailRegister} className="mt-4 space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-pink-300 block mb-1">
                      আপনার পুরো ও আসল নাম *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-pink-400" />
                      <input
                        type="text"
                        required
                        placeholder="উদা: অনির্বাণ সেন (কমপক্ষে ৩ অক্ষর)"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="w-full rounded-xl border border-purple-900/40 bg-black/50 py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-pink-300 block mb-1">
                      আসল জিমেইল / ইমেইল আইডি *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-pink-400" />
                      <input
                        type="email"
                        required
                        placeholder="আপনার আসল ইমেইল (উদা: yourname@gmail.com)"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="w-full rounded-xl border border-purple-900/40 bg-black/50 py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-0.5 block">
                      অস্থায়ী/ফেক মেইল নিষিদ্ধ। নিশ্চিতকরণের জন্য একটি লিঙ্ক পাঠানো হবে।
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-pink-300 block mb-1">
                      সক্রিয় মোবাইল নম্বর *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={registerPhoneCountry}
                        onChange={(e) => setRegisterPhoneCountry(e.target.value)}
                        className="max-w-[130px] rounded-xl border border-purple-900/40 bg-black/70 px-2 py-2 text-xs text-purple-200 focus:border-pink-400 focus:outline-none truncate"
                      >
                        {WORLD_COUNTRY_CODES.map((c) => (
                          <option key={c.code + c.name} value={c.code} className="bg-zinc-900 text-white">
                            {c.flag} {c.code} ({c.name})
                          </option>
                        ))}
                      </select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-pink-400" />
                        <input
                          type="tel"
                          required
                          placeholder={
                            registerPhoneCountry === '+91'
                              ? '১০ অঙ্কের নম্বর (উদা: 9830xxxxxx)'
                              : registerPhoneCountry === '+880'
                              ? '১১ অঙ্কের নম্বর (উদা: 017xxxxxxxx)'
                              : 'আপনার মোবাইল নম্বর দিন'
                          }
                          value={registerPhone}
                          onChange={(e) => setRegisterPhone(e.target.value)}
                          className="w-full rounded-xl border border-purple-900/40 bg-black/50 py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-pink-300 block mb-1">
                      শক্তিশালী পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর) *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-pink-400" />
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        placeholder="কমপক্ষে ৮ অক্ষর (ইংরেজি বর্ণ ও সংখ্যা)"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="w-full rounded-xl border border-purple-900/40 bg-black/50 py-2.5 pl-9 pr-9 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                      >
                        {showRegisterPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-pink-300 block mb-1">
                      পাসওয়ার্ড নিশ্চিত করুন *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-pink-400" />
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        placeholder="একই পাসওয়ার্ড পুনরায় টাইপ করুন"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-purple-900/40 bg-black/50 py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all active:scale-98 disabled:opacity-50"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>{loading ? 'ভেরিফিকেশন যাচাই ও অ্যাকাউন্ট তৈরি হচ্ছে...' : 'অ্যাকাউন্ট খুলুন ও এগিয়ে যান'}</span>
                  </button>
                </form>
              )}

              <div className="mt-4 text-center">
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  লগইন সম্পন্ন হলে আপনার পছন্দের গল্প, ইতিহাস এবং ২০ টাকার পাস অ্যাকাউন্টে সংরক্ষিত থাকবে।
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
