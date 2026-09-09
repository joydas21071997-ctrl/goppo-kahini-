import React, { useState } from 'react';
import {
  X,
  Lock,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Crown,
  Mic,
  Eye,
  EyeOff,
  Sparkles,
  Key
} from 'lucide-react';
import { CreatorSession, NarratorApplication } from '../types';

interface CreatorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: CreatorSession) => void;
  approvedNarrators: NarratorApplication[];
}

export const CreatorLoginModal: React.FC<CreatorLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  approvedNarrators,
}) => {
  const [mode, setMode] = useState<'secret_pin' | 'admin' | 'narrator'>('secret_pin');
  
  // Quick Secret PIN
  const [secretPin, setSecretPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Admin credentials
  const [adminEmail, setAdminEmail] = useState('joydas.21071997@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Narrator credentials
  const [narratorEmail, setNarratorEmail] = useState('');
  const [narratorCode, setNarratorCode] = useState('');

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSecretPinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPin = secretPin.trim();
    const storedAdminPassword = localStorage.getItem('goppo_admin_secure_password') || 'JoyGoppo@2026';
    
    // Master secret PINs: JoyGoppo@2026, 2026, joy2026, 1998, or custom stored password
    const isValidPin =
      cleanPin === storedAdminPassword ||
      cleanPin === 'JoyGoppo@2026' ||
      cleanPin === '2026' ||
      cleanPin === 'joy2026' ||
      cleanPin === '1998';

    if (!isValidPin) {
      setError('ভুল সিক্রেট পিন! প্রতিষ্ঠাতা জয়-এর অনুমোদিত সঠিক সিক্রেট পিন বা পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    const session: CreatorSession = {
      isLoggedIn: true,
      role: 'super_admin',
      name: 'জয় (Joy - প্রতিষ্ঠাতা)',
      email: 'joydas.21071997@gmail.com',
    };
    onLoginSuccess(session);
    onClose();
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = adminEmail.trim().toLowerCase();
    const cleanPassword = adminPassword.trim();

    // Check admin identity: joydas.21071997@gmail.com
    const isJoyEmail = cleanEmail === 'joydas.21071997@gmail.com';
    if (!isJoyEmail) {
      setError('অ্যাক্সেস প্রত্যাখ্যাত: শুধুমাত্র প্রতিষ্ঠাতা জয়-এর অনুমোদিত ইমেইল গ্রহণযোগ্য।');
      return;
    }

    // Strict password check: stored password or master keys
    const storedAdminPassword = localStorage.getItem('goppo_admin_secure_password') || 'JoyGoppo@2026';
    const isPasswordCorrect =
      cleanPassword === storedAdminPassword ||
      cleanPassword === 'JoyGoppo@2026' ||
      cleanPassword === 'joy2026' ||
      cleanPassword === '2026';

    if (!isPasswordCorrect) {
      setError('ভুল সিকিউরিটি পাসওয়ার্ড! সঠিক অ্যাডমিন পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    const session: CreatorSession = {
      isLoggedIn: true,
      role: 'super_admin',
      name: 'জয় (Joy - প্রতিষ্ঠাতা)',
      email: cleanEmail,
    };
    onLoginSuccess(session);
    onClose();
  };

  const handleNarratorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!narratorEmail.trim() || !narratorCode.trim()) {
      setError('অনুগ্রহ করে আপনার অনুমোদিত ইমেইল ও অ্যাক্সেস কোড দিন।');
      return;
    }

    const cleanEmail = narratorEmail.trim().toLowerCase();
    const cleanCode = narratorCode.trim().toUpperCase();

    // Check against approved applications
    const match = approvedNarrators.find(
      (n) =>
        n.status === 'approved' &&
        n.email.toLowerCase() === cleanEmail &&
        (n.approvalCode?.toUpperCase() === cleanCode || cleanCode === 'NARR-2026')
    );

    if (match || (cleanCode === 'NARR-2026' && cleanEmail.includes('@'))) {
      const narratorName = match ? match.fullName : 'অনুমোদিত কথক';
      const session: CreatorSession = {
        isLoggedIn: true,
        role: 'approved_narrator',
        name: narratorName,
        email: cleanEmail,
        accessCode: cleanCode,
      };
      onLoginSuccess(session);
      onClose();
    } else {
      setError('এই ইমেইল বা কোডটি অনুমোদিত নয়। জয় (প্রতিষ্ঠাতা) অনুমোদন করলে আপনি ইমেইলে কোড পাবেন।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl border border-purple-500/30 bg-zinc-950 shadow-2xl shadow-purple-950/40 overflow-hidden my-4 text-white">
        
        {/* Top Accent Strip: Light Purple & Pink */}
        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors border border-purple-900/30"
          title="বন্ধ করুন"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5 sm:p-7">
          
          {/* Header */}
          <div className="text-center space-y-1.5 border-b border-purple-900/30 pb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-pink-400 border border-purple-500/30">
              <ShieldCheck className="h-6 w-6 text-pink-400" />
            </div>
            <h2 className="font-serif-story text-xl font-bold text-white">
              অ্যাডমিন পোর্টাল
            </h2>
            <p className="text-xs text-zinc-400">
              নিরাপদ অ্যাডমিন অ্যাক্সেস — শুধুমাত্র প্রতিষ্ঠাতা জয়-এর জন্য সংরক্ষিত
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-[#160e22] p-1 border border-purple-900/30 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setMode('secret_pin');
                setError('');
              }}
              className={`flex items-center justify-center gap-1 rounded-lg py-1.5 font-bold transition-all ${
                mode === 'secret_pin'
                  ? 'bg-purple-500/30 text-pink-300 border border-purple-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Key className="h-3 w-3 text-pink-400" />
              <span>সিক্রেট পিন</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('admin');
                setError('');
              }}
              className={`flex items-center justify-center gap-1 rounded-lg py-1.5 font-bold transition-all ${
                mode === 'admin'
                  ? 'bg-purple-500/30 text-pink-300 border border-purple-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Crown className="h-3 w-3 text-pink-400" />
              <span>জয় (ইমেইল)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('narrator');
                setError('');
              }}
              className={`flex items-center justify-center gap-1 rounded-lg py-1.5 font-bold transition-all ${
                mode === 'narrator'
                  ? 'bg-purple-500/30 text-pink-300 border border-purple-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Mic className="h-3 w-3 text-purple-300" />
              <span>অনুমোদিত কথক</span>
            </button>
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode 0: Quick Secret PIN Login for Joy */}
          {mode === 'secret_pin' && (
            <form onSubmit={handleSecretPinLogin} className="mt-4 space-y-3.5">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-purple-200">
                    জয়-এর গোপন অ্যাডমিন সিক্রেট পিন
                  </label>
                  <span className="text-[10px] text-pink-400">মাস্টার কী: 2026</span>
                </div>
                <div className="relative mt-1">
                  <input
                    type={showPin ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder="সিক্রেট পিন দিন (যেমন: 2026)"
                    value={secretPin}
                    onChange={(e) => setSecretPin(e.target.value)}
                    className="w-full rounded-xl border border-purple-900/30 bg-black/60 py-2.5 pl-3 pr-9 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none font-mono tracking-widest text-center text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showPin ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-purple-900/40 bg-purple-950/20 p-2.5 text-[11px] text-purple-200/80 leading-relaxed">
                🔐 প্রতিষ্ঠাতা জয়-এর জন্য সংরক্ষিত গোপন প্রবেশদ্বার। কোনো সাধারণ ভিজিটর বা অডিয়েন্স এই প্যানেল দেখতে পাবেন না।
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-all"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>পিন দিয়ে অ্যাডমিন স্টুডিও খুলুন</span>
              </button>
            </form>
          )}

          {/* Mode 1: Admin / Joy Email + Password Login */}
          {mode === 'admin' && (
            <form onSubmit={handleAdminLogin} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-purple-200">
                  প্রতিষ্ঠাতা জয়-এর ইমেইল আইডি
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-purple-900/30 bg-black/60 px-3 py-2 text-xs text-white focus:border-pink-400 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-purple-200">
                  গোপন অ্যাডমিন পাসওয়ার্ড
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="আপনার গোপন পাসওয়ার্ড দিন"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full rounded-xl border border-purple-900/30 bg-black/60 py-2 pl-3 pr-9 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-purple-900/40 bg-purple-950/20 p-2.5 text-[11px] text-purple-200/80">
                🔒 গল্প আপলোড, জীবন কথা নিয়ন্ত্রণ, পেমেন্ট ভেরিফিকেশন এবং টিম ম্যানেজমেন্ট শুধুমাত্র যাচাইয়ের পর জয়-এর জন্য খুলবে।
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-all"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>নিরাপদে প্রবেশ করুন (Admin Access)</span>
              </button>
            </form>
          )}

          {/* Mode 2: Narrator Login */}
          {mode === 'narrator' && (
            <form onSubmit={handleNarratorLogin} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-pink-300">
                  অনুমোদিত কথকের ইমেইল
                </label>
                <input
                  type="email"
                  required
                  placeholder="আপনার আবেদনকৃত ইমেইল"
                  value={narratorEmail}
                  onChange={(e) => setNarratorEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-purple-900/30 bg-black/60 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-pink-300">
                  কথক অ্যাক্সেস কোড (Approval Passkey)
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: NARR-2026"
                  value={narratorCode}
                  onChange={(e) => setNarratorCode(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-purple-900/30 bg-black/60 px-3 py-2 text-xs text-white placeholder-zinc-500 font-mono uppercase focus:border-pink-400 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-purple-900/30 bg-[#160e22] p-2.5 text-[11px] text-zinc-400">
                💡 এখনও অ্যাক্সেস কোড পাননি? &ldquo;কথক হিসেবে আবেদন&rdquo; ফর্মটি পূরণ করুন। জয় অনুমোদন করলে কোড পেয়ে যাবেন।
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-all"
              >
                <Mic className="h-3.5 w-3.5" />
                <span>কথক হিসেবে স্টুডিওতে যান</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
