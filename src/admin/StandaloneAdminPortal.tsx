import React, { useState, useEffect } from 'react';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Crown,
  Sparkles,
  Radio,
  Eye,
  EyeOff,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { AdminPortalApp } from './AdminPortalApp';
import {
  CreatorSession,
  Story,
  SubscriberLead,
  NarratorApplication,
  LifeStorySubmission,
  LifeStoryEpisode,
  PaymentTransaction,
  UpiConfig,
  AdminActivityLog
} from '../types';
import { INITIAL_STORIES } from '../data/stories';
import {
  isPrimarySuperAdminEmail,
  getDelegatedAdmins,
  ensureAdminFirebaseAuth,
} from '../services/adminAuth';
import { subscribeStoriesFromFirestore } from '../services/firestoreStories';

export const StandaloneAdminPortal: React.FC = () => {
  // Authentication State
  const [session, setSession] = useState<CreatorSession | null>(() => {
    try {
      const saved = localStorage.getItem('goppo_standalone_admin_session');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // Login Form States
  const [authMode, setAuthMode] = useState<'pin' | 'email'>('pin');
  const [secretPin, setSecretPin] = useState('');
  const [adminEmail, setAdminEmail] = useState('joydas.21071997@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // App Data States
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [subscribers, setSubscribers] = useState<SubscriberLead[]>(() => {
    try {
      const saved = localStorage.getItem('goppo_subscribers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            id: item.id || `lead-${Date.now()}`,
            name: item.name || 'গ্রাহক',
            email: item.email || '',
            phone: item.phone || item.phoneNumber || '+91 98765 43210',
            whatsapp: item.whatsapp || item.phone || item.phoneNumber || '+91 98765 43210',
            country: item.country || 'India',
            tier: item.tier || 'গপ্পো কাহিনী ২০ টাকার মাসিক পাস',
            amount: item.amount ?? item.amountPaid ?? 20,
            currency: item.currency || 'INR',
            method: item.method || 'UPI',
            transactionId: item.transactionId || item.utrNumber || 'UTR492019482910',
            verificationStatus: item.verificationStatus || (item.status === 'verified' ? 'verified' : 'pending_verification'),
            date: item.date || item.registeredAt || '2026-03-01',
            optInMarketing: true,
          }));
        }
      }
    } catch {}
    return [
      {
        id: 'sub-joy-1',
        name: 'সৌমেন চক্রবর্তী',
        email: 'soumen.chakraborty@gmail.com',
        phone: '+91 98765 43210',
        whatsapp: '+91 98765 43210',
        country: 'India',
        tier: 'গপ্পো কাহিনী ২০ টাকার মাসিক পাস',
        amount: 20,
        currency: 'INR',
        method: 'UPI (GPay)',
        transactionId: 'UTR492019482910',
        verificationStatus: 'verified',
        date: '2026-03-01',
        optInMarketing: true,
      },
      {
        id: 'sub-joy-2',
        name: 'তানভীর আহমেদ',
        email: 'tanvir.dhaka@yahoo.com',
        phone: '+880 1712 458921',
        whatsapp: '+880 1712 458921',
        country: 'Bangladesh',
        tier: 'গপ্পো কাহিনী ২০ টাকার মাসিক পাস',
        amount: 25,
        currency: 'BDT',
        method: 'bKash বিকাশ',
        transactionId: 'BKASH-8A9F0123',
        verificationStatus: 'verified',
        date: '2026-03-02',
        optInMarketing: true,
      },
      {
        id: 'sub-joy-3',
        name: 'অদিতি মুখার্জী',
        email: 'aditi.mukherjee@outlook.com',
        phone: '+91 94330 88712',
        whatsapp: '+91 94330 88712',
        country: 'India',
        tier: 'একক গল্প টিকিট',
        amount: 10,
        currency: 'INR',
        method: 'Paytm UPI',
        transactionId: 'PTM-889102431',
        verificationStatus: 'verified',
        date: '2026-03-04',
        optInMarketing: true,
      }
    ];
  });

  const [narratorApplications, setNarratorApplications] = useState<NarratorApplication[]>(() => {
    try {
      const saved = localStorage.getItem('goppo_narrator_applications');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [lifeStorySubmissions, setLifeStorySubmissions] = useState<LifeStorySubmission[]>(() => {
    try {
      const saved = localStorage.getItem('goppo_life_story_submissions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [lifeStoryEpisodes, setLifeStoryEpisodes] = useState<LifeStoryEpisode[]>(() => {
    try {
      const saved = localStorage.getItem('goppo_podcast_episodes');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('goppo_payment_transactions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [upiConfig, setUpiConfig] = useState<UpiConfig>(() => {
    try {
      const saved = localStorage.getItem('goppo_upi_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      upiId: 'joydas21071997@okaxis',
      payeeName: 'Joy Das',
      qrImageUrl: '',
      bankName: 'Axis Bank (Google Pay / PhonePe / Paytm)',
      paymentInstructions: 'পেমেন্ট সম্পন্ন করার পর স্ক্রিনশট বা ১২ সংখ্যার UTR নম্বর সাবমিট করুন।',
    };
  });

  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);

  // Listen to Firestore stories
  useEffect(() => {
    const unsubscribe = subscribeStoriesFromFirestore((firestoreStories) => {
      if (firestoreStories && firestoreStories.length > 0) {
        setStories(firestoreStories);
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Ensure Admin Firebase Auth
  useEffect(() => {
    if (session?.isLoggedIn) {
      ensureAdminFirebaseAuth().catch((err) => {
        console.warn('Admin Firebase Auth auto-init:', err);
      });
    }
  }, [session?.isLoggedIn]);

  // Handlers
  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanPin = secretPin.trim();

    const storedAdminPassword = localStorage.getItem('goppo_admin_secure_password') || 'JoyGoppo@2026';
    const isValid =
      cleanPin === storedAdminPassword ||
      cleanPin === 'JoyGoppo@2026' ||
      cleanPin === '2026' ||
      cleanPin === 'joy2026' ||
      cleanPin === '1998';

    if (!isValid) {
      setError('ভুল সিক্রেট পিন! প্রতিষ্ঠাতা জয়-এর অনুমোদিত সঠিক সিক্রেট পিন বা পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    const newSession: CreatorSession = {
      isLoggedIn: true,
      role: 'super_admin',
      name: 'জয় (Joy - প্রতিষ্ঠাতা)',
      email: 'joydas.21071997@gmail.com',
    };

    setSession(newSession);
    localStorage.setItem('goppo_standalone_admin_session', JSON.stringify(newSession));
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanEmail = adminEmail.trim().toLowerCase();
    const cleanPassword = adminPassword.trim();

    // Explicit check for revoked admin
    if (cleanEmail === 'joyfulfilms21@gmail.com') {
      setError('অ্যাক্সেস প্রত্যাখ্যাত: এই অ্যাকাউন্টের অ্যাডমিন অধিকার প্রত্যাহার করা হয়েছে। শুধুমাত্র joydas.21071997@gmail.com অনুমোদিত।');
      return;
    }

    // Check if super admin email or delegated admin
    const isSuperAdmin = isPrimarySuperAdminEmail(cleanEmail);
    const delegatedList = getDelegatedAdmins();
    const delegatedUser = delegatedList.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!isSuperAdmin && !delegatedUser) {
      setError('অ্যাক্সেস প্রত্যাখ্যাত: এই ইমেইলটি সুপার অ্যাডমিন জয় কর্তৃক অনুমোদিত নয়।');
      return;
    }

    const storedPassword = localStorage.getItem('goppo_admin_secure_password') || 'JoyGoppo@2026';
    const isPasswordValid =
      cleanPassword === storedPassword ||
      cleanPassword === 'JoyGoppo@2026' ||
      cleanPassword === 'joy2026' ||
      cleanPassword === '2026';

    if (!isPasswordValid) {
      setError('ভুল পাসওয়ার্ড! সঠিক অ্যাডমিন সিকিউরিটি পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    const newSession: CreatorSession = {
      isLoggedIn: true,
      role: isSuperAdmin ? 'super_admin' : 'approved_narrator',
      name: isSuperAdmin ? 'জয় (Joy - প্রতিষ্ঠাতা)' : delegatedUser?.name || cleanEmail,
      email: cleanEmail,
    };

    setSession(newSession);
    localStorage.setItem('goppo_standalone_admin_session', JSON.stringify(newSession));
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('goppo_standalone_admin_session');
  };

  // If logged in, show AdminPortalApp
  if (session && session.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0d0716] text-purple-100">
        <AdminPortalApp
          creatorSession={session}
          onLogout={handleLogout}
          isStandalone={true}
          stories={stories}
          onAddStory={(newStory) => {
            const updated = [newStory, ...stories.filter((s) => s.id !== newStory.id)];
            setStories(updated);
            localStorage.setItem('goppo_stories', JSON.stringify(updated));
          }}
          onDeleteStory={(storyId) => {
            const updated = stories.filter((s) => s.id !== storyId);
            setStories(updated);
            localStorage.setItem('goppo_stories', JSON.stringify(updated));
          }}
          lifeStoryEpisodes={lifeStoryEpisodes}
          onAddLifeStoryEpisode={(newEp) => {
            const updated = [newEp, ...lifeStoryEpisodes.filter((e) => e.id !== newEp.id)];
            setLifeStoryEpisodes(updated);
            localStorage.setItem('goppo_podcast_episodes', JSON.stringify(updated));
          }}
          subscribers={subscribers}
          onUpdateSubscriberStatus={(id, status) => {
            const updated = subscribers.map((s) => (s.id === id ? { ...s, verificationStatus: status } : s));
            setSubscribers(updated);
            localStorage.setItem('goppo_subscribers', JSON.stringify(updated));
          }}
          onDeleteSubscriber={(id) => {
            const updated = subscribers.filter((s) => s.id !== id);
            setSubscribers(updated);
            localStorage.setItem('goppo_subscribers', JSON.stringify(updated));
          }}
          onAddSubscriber={(newSub) => {
            const updated = [newSub, ...subscribers.filter((s) => s.id !== newSub.id)];
            setSubscribers(updated);
            localStorage.setItem('goppo_subscribers', JSON.stringify(updated));
          }}
          narratorApplications={narratorApplications}
          onApproveNarrator={(id, code) => {
            const updated = narratorApplications.map((app) =>
              app.id === id ? { ...app, status: 'approved' as const, approvalCode: code } : app
            );
            setNarratorApplications(updated);
            localStorage.setItem('goppo_narrator_applications', JSON.stringify(updated));
          }}
          onRejectNarrator={(id) => {
            const updated = narratorApplications.map((app) =>
              app.id === id ? { ...app, status: 'rejected' as const } : app
            );
            setNarratorApplications(updated);
            localStorage.setItem('goppo_narrator_applications', JSON.stringify(updated));
          }}
          onDeleteNarratorApp={(id) => {
            const updated = narratorApplications.filter((app) => app.id !== id);
            setNarratorApplications(updated);
            localStorage.setItem('goppo_narrator_applications', JSON.stringify(updated));
          }}
          lifeStorySubmissions={lifeStorySubmissions}
          onUpdateLifeStoryStatus={(id, status) => {
            const updated = lifeStorySubmissions.map((s) => (s.id === id ? { ...s, status } : s));
            setLifeStorySubmissions(updated);
            localStorage.setItem('goppo_life_story_submissions', JSON.stringify(updated));
          }}
          onDeleteLifeStorySubmission={(id) => {
            const updated = lifeStorySubmissions.filter((s) => s.id !== id);
            setLifeStorySubmissions(updated);
            localStorage.setItem('goppo_life_story_submissions', JSON.stringify(updated));
          }}
          paymentTransactions={paymentTransactions}
          onApprovePayment={(id) => {
            const updated = paymentTransactions.map((tx) =>
              tx.id === id ? { ...tx, status: 'approved' as const } : tx
            );
            setPaymentTransactions(updated);
            localStorage.setItem('goppo_payment_transactions', JSON.stringify(updated));
          }}
          onRejectPayment={(id, reason) => {
            const updated = paymentTransactions.map((tx) =>
              tx.id === id ? { ...tx, status: 'rejected' as const, adminNote: reason } : tx
            );
            setPaymentTransactions(updated);
            localStorage.setItem('goppo_payment_transactions', JSON.stringify(updated));
          }}
          onApproveRefund={(id) => {
            const updated = paymentTransactions.map((tx) =>
              tx.id === id ? { ...tx, refundStatus: 'approved' as const } : tx
            );
            setPaymentTransactions(updated);
            localStorage.setItem('goppo_payment_transactions', JSON.stringify(updated));
          }}
          onRejectRefund={(id, reason) => {
            const updated = paymentTransactions.map((tx) =>
              tx.id === id ? { ...tx, refundStatus: 'rejected' as const, refundNote: reason } : tx
            );
            setPaymentTransactions(updated);
            localStorage.setItem('goppo_payment_transactions', JSON.stringify(updated));
          }}
          onCompleteRefund={(id, utr, amount, note) => {
            const updated = paymentTransactions.map((tx) =>
              tx.id === id
                ? {
                    ...tx,
                    refundStatus: 'processed' as const,
                    refundUtr: utr,
                    refundAmount: amount,
                    refundNote: note,
                  }
                : tx
            );
            setPaymentTransactions(updated);
            localStorage.setItem('goppo_payment_transactions', JSON.stringify(updated));
          }}
          upiConfig={upiConfig}
          onUpdateUpiConfig={(newConfig) => {
            setUpiConfig(newConfig);
            localStorage.setItem('goppo_upi_config', JSON.stringify(newConfig));
          }}
          adminActivityLogs={activityLogs}
        />
      </div>
    );
  }

  // Standalone Login Screen
  return (
    <div className="min-h-screen bg-[#0c0617] text-purple-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* App Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-700 shadow-xl shadow-pink-600/25 border border-pink-400/30 mb-2">
            <Radio className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            গপ্পো কাহিনী <span className="text-pink-400">অ্যাডমিন পোর্টাল</span>
          </h1>
          <p className="text-xs text-purple-300/80">
            শুধুমাত্র প্রতিষ্ঠাতা ও অনুমোদিত অ্যাডমিনদের জন্য সুরক্ষিত ক্লাউড ম্যানেজমেন্ট সিস্টেম
          </p>
        </div>

        {/* Security Warning Card */}
        <div className="bg-purple-950/40 border border-purple-800/40 rounded-2xl p-4 flex items-start gap-3 text-xs text-purple-300">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p>
            এই পোর্টালটিতে প্রবেশাধিকার সীমিত। শুধুমাত্র একমাত্র অনুমোদিত সুপার অ্যাডমিন <strong className="text-white">joydas.21071997@gmail.com</strong> অথবা জয় কর্তৃক পারমিশনপ্রাপ্ত অ্যাডমিনরাই লগইন করতে পারবেন।
          </p>
        </div>

        {/* Auth Box */}
        <div className="bg-[#170b28]/95 border border-purple-900/50 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
          {/* Tabs: Quick Secret PIN vs Email Password */}
          <div className="flex rounded-xl bg-purple-950/80 p-1 border border-purple-900/40">
            <button
              type="button"
              onClick={() => {
                setAuthMode('pin');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'pin'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>ইনস্ট্যান্ট সিক্রেট পিন</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('email');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'email'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>অ্যাডমিন ইমেইল লগইন</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {authMode === 'pin' ? (
            <form onSubmit={handlePinLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                  প্রতিষ্ঠাতা জয়-এর সিক্রেট পিন বা মাস্টার কি
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={secretPin}
                    onChange={(e) => setSecretPin(e.target.value)}
                    placeholder="পাসওয়ার্ড বা পিন লিখুন"
                    className="w-full px-4 py-2.5 rounded-xl bg-purple-950/70 border border-purple-800/40 text-white text-sm focus:outline-none focus:border-pink-500 pr-10"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-purple-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-pink-600/25 transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>অ্যাডমিন পোর্টালে প্রবেশ করুন</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                  অনুমোদিত অ্যাডমিন ইমেইল
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="joydas.21071997@gmail.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-purple-950/70 border border-purple-800/40 text-white text-sm focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                  অ্যাডমিন সিকিউরিটি পাসওয়ার্ড
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-purple-950/70 border border-purple-800/40 text-white text-sm focus:outline-none focus:border-pink-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-purple-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-pink-600/25 transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>যাচাই ও লগইন</span>
              </button>
            </form>
          )}

          {/* Direct Audience App Link */}
          <div className="pt-3 border-t border-purple-900/40 text-center">
            <a
              href="/"
              className="text-xs text-purple-400 hover:text-pink-300 transition-colors inline-flex items-center gap-1"
            >
              ← মূল শ্রোতা অ্যাপ্লিকেশনে ফিরে যান
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
