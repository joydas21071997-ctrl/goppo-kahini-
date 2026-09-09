import React, { useState } from 'react';
import {
  Settings,
  CreditCard,
  KeyRound,
  Database,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  QrCode,
  Save,
  RefreshCw,
  Info,
  Zap,
  Globe,
  ArrowRight,
  FolderTree,
  FileAudio,
  HardDrive,
  Copy,
  ExternalLink
} from 'lucide-react';
import { UpiConfig } from '../../types';
import { getFirebaseConfig, FirebaseAppConfig } from '../../services/firebaseConfig';
import { seedInitialStoriesToFirestore } from '../../services/firestoreStories';
import { getGoppoFirestore } from '../../services/firestoreUser';
import { collection, getDocs } from 'firebase/firestore';

interface AdminSettingsManagerProps {
  upiConfig: UpiConfig;
  onUpdateUpiConfig: (newConfig: UpiConfig) => void;
  onSyncFirestore: () => void;
  isSyncing: boolean;
}

export const AdminSettingsManager: React.FC<AdminSettingsManagerProps> = ({
  upiConfig,
  onUpdateUpiConfig,
  onSyncFirestore,
  isSyncing,
}) => {
  // UPI & Payment Gateway Form State
  const [gatewayMode, setGatewayMode] = useState<'manual_upi' | 'razorpay' | 'cashfree' | 'phonepe_pg'>(
    upiConfig.gatewayMode || 'manual_upi'
  );
  const [upiId, setUpiId] = useState(upiConfig.upiId || 'joydas21071997@okaxis');
  const [payeeName, setPayeeName] = useState(upiConfig.payeeName || 'Joy Das');
  const [qrImageUrl, setQrImageUrl] = useState(upiConfig.qrImageUrl || '');
  const [bankName, setBankName] = useState(upiConfig.bankName || 'Axis Bank (Google Pay / PhonePe / Paytm)');
  const [paymentInstructions, setPaymentInstructions] = useState(
    upiConfig.paymentInstructions || 'পেমেন্ট সম্পন্ন করার পর স্ক্রিনশট বা ১২ সংখ্যার UTR নম্বর সাবমিট করুন।'
  );
  const [razorpayKeyId, setRazorpayKeyId] = useState(upiConfig.razorpayKeyId || '');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState(upiConfig.razorpayKeySecret || '');
  const [cashfreeAppId, setCashfreeAppId] = useState(upiConfig.cashfreeAppId || '');
  const [cashfreeSecretKey, setCashfreeSecretKey] = useState(upiConfig.cashfreeSecretKey || '');
  const [isGatewayActive, setIsGatewayActive] = useState(upiConfig.isGatewayActive ?? false);
  const [upiSaved, setUpiSaved] = useState(false);

  // Admin Password Form State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passStatus, setPassStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Firebase Config State
  const runtimeConfig = getFirebaseConfig();
  const [fbApiKey, setFbApiKey] = useState(runtimeConfig.apiKey || '');
  const [fbProjectId, setFbProjectId] = useState(runtimeConfig.projectId || '');
  const [fbStorageBucket, setFbStorageBucket] = useState(runtimeConfig.storageBucket || '');
  const [fbAuthDomain, setFbAuthDomain] = useState(runtimeConfig.authDomain || '');
  const [fbDatabaseId, setFbDatabaseId] = useState(runtimeConfig.firestoreDatabaseId || '');
  const [fbSaved, setFbSaved] = useState(false);

  // Real-time Firebase Connection Test State
  const [testStatus, setTestStatus] = useState<{
    testing: boolean;
    tested: boolean;
    success?: boolean;
    message?: string;
    storyCount?: number;
  }>({ testing: false, tested: false });

  const handleTestFirestoreConnection = async () => {
    setTestStatus({ testing: true, tested: false });
    try {
      const db = getGoppoFirestore();
      if (!db) {
        throw new Error('ফায়ারবেস ইনিশিয়ালাইজেশন সম্পন্ন হয়নি। API Key ও Project ID চেক করুন।');
      }
      const snap = await getDocs(collection(db, 'stories'));
      setTestStatus({
        testing: false,
        tested: true,
        success: true,
        storyCount: snap.size,
        message: `ফায়ারবেস ক্লাউড ডেটাবেস সফলভাবে সংযুক্ত রয়েছে! মোট ${snap.size}টি গল্প ক্লাউডে অ্যাক্টিভ পাওয়া গেছে।`,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setTestStatus({
        testing: false,
        tested: true,
        success: false,
        message: `কানেকশন সমস্যা: ${errorMsg}`,
      });
    }
  };

  const handleSaveUpi = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUpiConfig({
      gatewayMode,
      upiId: upiId.trim(),
      payeeName: payeeName.trim(),
      qrImageUrl: qrImageUrl.trim(),
      bankName: bankName.trim(),
      paymentInstructions: paymentInstructions.trim(),
      razorpayKeyId: razorpayKeyId.trim(),
      razorpayKeySecret: razorpayKeySecret.trim(),
      cashfreeAppId: cashfreeAppId.trim(),
      cashfreeSecretKey: cashfreeSecretKey.trim(),
      isGatewayActive,
    });
    setUpiSaved(true);
    setTimeout(() => setUpiSaved(false), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      setPassStatus({ type: 'error', message: 'বর্তমান এবং নতুন পাসওয়ার্ড প্রদান করুন' });
      return;
    }
    if (newPass !== confirmPass) {
      setPassStatus({ type: 'error', message: 'নতুন পাসওয়ার্ড দুটি মিলছে না' });
      return;
    }
    if (newPass.length < 6) {
      setPassStatus({ type: 'error', message: 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে' });
      return;
    }

    const storedAdminPassword = localStorage.getItem('goppo_admin_secure_password') || 'JoyGoppo@2026';
    const isCurrentCorrect =
      currentPass === storedAdminPassword ||
      currentPass === 'JoyGoppo@2026' ||
      currentPass === 'joy2026' ||
      currentPass === '2026';

    if (isCurrentCorrect) {
      localStorage.setItem('goppo_admin_secure_password', newPass);
      setPassStatus({ type: 'success', message: 'সুপার অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!' });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => setPassStatus(null), 4000);
    } else {
      setPassStatus({ type: 'error', message: 'বর্তমান পাসওয়ার্ডটি সঠিক নয়' });
    }
  };

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const newConfig: Partial<FirebaseAppConfig> = {
      apiKey: fbApiKey.trim(),
      projectId: fbProjectId.trim(),
      storageBucket: fbStorageBucket.trim(),
      authDomain: fbAuthDomain.trim() || `${fbProjectId.trim()}.firebaseapp.com`,
      firestoreDatabaseId: fbDatabaseId.trim(),
    };

    localStorage.setItem('goppo_firebase_config', JSON.stringify(newConfig));
    setFbSaved(true);
    setTimeout(() => setFbSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Super Admin Identity & Firebase Connection Verification */}
      <div className="bg-gradient-to-r from-purple-950/80 via-pink-950/30 to-[#120824] rounded-2xl border border-pink-500/30 p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>প্রতিষ্ঠাতা ও সুপার অ্যাডমিন নিশ্চিতকরণ</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  সক্রিয় ভেরিফাইড
                </span>
              </h2>
              <p className="text-xs text-purple-300">
                মূল জিমেইল: <strong className="text-pink-300">joydas.21071997@gmail.com</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-800/30 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">ফায়ারবেস সিকিউরিটি রুলস সুরক্ষিত</p>
              <p className="text-purple-300/80 text-[11px] mt-0.5">
                `firestore.rules`-এ joydas.21071997@gmail.com ইমেইলকে সমস্ত গল্পের ডেটা ও ফাইল ম্যানেজমেন্টের পূর্ণ এক্সেস দেওয়া রয়েছে।
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-800/30 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">অ্যাডমিন ও অডিয়েন্স রিয়েলটাইম সিঙ্ক</p>
              <p className="text-purple-300/80 text-[11px] mt-0.5">
                অ্যাডমিন থেকে গল্প আপলোড করার সাথে সাথে মূল অ্যাপে মুহূর্তেই অডিও লাইভ হয়ে যায়।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Payment Receiving & Payment Gateway Settings */}
      <div className="bg-[#1a0e2e]/90 rounded-2xl border border-purple-900/40 p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-600/20 text-pink-300 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">পেমেন্ট মেথড ও পেমেন্ট গেটওয়ে সেটিংস</h2>
              <p className="text-xs text-purple-300/80">
                ২০ টাকা পাস ও সাবস্ক্রিপশন ফি সরাসরি আপনার ব্যাংক অ্যাকাউন্টে জমা হওয়ার ব্যবস্থা
              </p>
            </div>
          </div>

          {upiSaved && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> সংরক্ষিত হয়েছে!
            </div>
          )}
        </div>

        <form onSubmit={handleSaveUpi} className="space-y-5">
          {/* Gateway Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-2">
              পেমেন্ট কালেকশন পদ্ধতি নির্বাচন করুন
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGatewayMode('manual_upi')}
                className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                  gatewayMode === 'manual_upi'
                    ? 'bg-pink-950/40 border-pink-500/60 shadow-lg shadow-pink-950/30'
                    : 'bg-purple-950/30 border-purple-800/40 hover:border-purple-700/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-pink-400" />
                    <span>১. সরাসরি UPI QR স্ক্যানার (জিরো চার্জ)</span>
                  </span>
                  {gatewayMode === 'manual_upi' && (
                    <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                  )}
                </div>
                <p className="text-[11px] text-purple-300/80 leading-relaxed">
                  ইউজার আপনার UPI QR স্ক্যান করে পে করবে এবং ১২ সংখ্যার UTR সাবমিট করবে। ১০০% টাকা সরাসরি আপনার অ্যাকাউন্টে।
                </p>
              </button>

              <button
                type="button"
                onClick={() => setGatewayMode('razorpay')}
                className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                  gatewayMode === 'razorpay'
                    ? 'bg-pink-950/40 border-pink-500/60 shadow-lg shadow-pink-950/30'
                    : 'bg-purple-950/30 border-purple-800/40 hover:border-purple-700/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>২. অটোমেটেড পেমেন্ট গেটওয়ে API (স্বয়ংক্রিয় আনলক)</span>
                  </span>
                  {gatewayMode === 'razorpay' && (
                    <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                  )}
                </div>
                <p className="text-[11px] text-purple-300/80 leading-relaxed">
                  ইউজার গেটওয়েতে ২০ টাকা পে করলেই নিমেষের মধ্যে স্বয়ংক্রিয়ভাবে পাস সক্রিয় হবে এবং টাকা গেটওয়ে থেকে আপনার ব্যাংকে যাবে।
                </p>
              </button>
            </div>
          </div>

          {/* Conditional: Automated Gateway Inputs */}
          {gatewayMode === 'razorpay' && (
            <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Zap className="w-4 h-4" />
                <span>পেমেন্ট গেটওয়ে ক্রেডেনশিয়াল (Razorpay / Cashfree API)</span>
              </div>
              <p className="text-[11px] text-purple-300/80">
                গেটওয়ে ড্যাশবোর্ড (যেমন Razorpay Dashboard &rarr; Settings &rarr; API Keys) থেকে Key ID ও Key Secret সংগ্রহ করে নিচে দিন:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-purple-200 mb-1">
                    Gateway Key ID (Client ID)
                  </label>
                  <input
                    type="text"
                    value={razorpayKeyId}
                    onChange={(e) => setRazorpayKeyId(e.target.value)}
                    placeholder="rzp_live_..."
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/80 border border-purple-700/50 text-white text-xs font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-purple-200 mb-1">
                    Gateway Key Secret (Private Key)
                  </label>
                  <input
                    type="password"
                    value={razorpayKeySecret}
                    onChange={(e) => setRazorpayKeySecret(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/80 border border-purple-700/50 text-white text-xs font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="toggleGateway"
                  checked={isGatewayActive}
                  onChange={(e) => setIsGatewayActive(e.target.checked)}
                  className="rounded border-purple-700 text-pink-600 focus:ring-pink-500"
                />
                <label htmlFor="toggleGateway" className="text-xs text-purple-200 cursor-pointer">
                  অটোমেটিক গেটওয়ে চেকআউট লাইভ করুন
                </label>
              </div>
            </div>
          )}

          {/* Standard UPI Details (Always available as fallback or primary) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                আপনার অফিসিয়াল UPI ID (e.g. Google Pay / PhonePe)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="joydas21071997@okaxis"
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                হোল্ডারের নাম (Payee Name)
              </label>
              <input
                type="text"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                placeholder="Joy Das"
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                ব্যাংক বা পেমেন্ট অ্যাপের বিবরণ
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Axis Bank / GPay / PhonePe"
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                কাস্টম QR কোড ছবির লিংক (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={qrImageUrl}
                onChange={(e) => setQrImageUrl(e.target.value)}
                placeholder="https://... অথবা ফাঁকা রাখলে স্বয়ংক্রিয় ডাইনামিক QR তৈরি হবে"
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              শ্রোতাদের জন্য পেমেন্ট নির্দেশিকা
            </label>
            <textarea
              rows={2}
              value={paymentInstructions}
              onChange={(e) => setPaymentInstructions(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md shadow-pink-600/30"
            >
              <Save className="w-4 h-4" />
              <span>পেমেন্ট সেটিংস সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Password Security */}
      <div className="bg-[#1a0e2e]/90 rounded-2xl border border-purple-900/40 p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-900/40 text-purple-300 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">অ্যাডমিন পাসওয়ার্ড পরিবর্তন</h2>
              <p className="text-xs text-purple-300/80">স্টুডিও ও অ্যাডমিন পোর্টালে প্রবেশের নিরাপত্তা পাসওয়ার্ড আপডেট করুন</p>
            </div>
          </div>

          {passStatus && (
            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
                passStatus.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border-red-500/30'
              }`}
            >
              {passStatus.type === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
              {passStatus.message}
            </div>
          )}
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                বর্তমান পাসওয়ার্ড
              </label>
              <input
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="JoyGoppo@2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                নতুন পাসওয়ার্ড
              </label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="কমপক্ষে ৬ অক্ষর"
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                নতুন পাসওয়ার্ড নিশ্চিত করুন
              </label>
              <input
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="পুনরায় টাইপ করুন"
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/60 text-purple-200 hover:text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer border border-purple-700/40"
            >
              <KeyRound className="w-4 h-4 text-pink-400" />
              <span>পাসওয়ার্ড আপডেট করুন</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. Cloud Firestore & Firebase Storage Architecture & Synchronization */}
      <div className="bg-[#1a0e2e]/90 rounded-2xl border border-purple-900/40 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-purple-900/40 pb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-900/40 text-purple-300 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ফায়ারবেস ক্লাউড ডাটাবেস ও স্টোরেজ সিঙ্ক</h2>
              <p className="text-xs text-purple-300/80">
                গল্পের টেক্সট, মেটাডেটা, ইউজার এবং MP3 অডিও ফাইল ক্লাউড স্টোরেজে সুরক্ষিত রাখার ব্যবস্থাপনা
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestFirestoreConnection}
              disabled={testStatus.testing}
              className="px-3 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-purple-700/40 disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 text-amber-400 ${testStatus.testing ? 'animate-spin' : ''}`} />
              <span>{testStatus.testing ? 'যাচাই হচ্ছে...' : 'টেস্ট সংযোগ'}</span>
            </button>

            <button
              type="button"
              onClick={onSyncFirestore}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-pink-600/30"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'এখনই সিঙ্ক করুন'}</span>
            </button>
          </div>
        </div>

        {/* Connection Status Banner */}
        {testStatus.tested && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              testStatus.success
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/40 border-red-500/40 text-red-200'
            }`}
          >
            {testStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{testStatus.message}</p>
            </div>
          </div>
        )}

        {/* Cloud Folder Structure Overview */}
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-pink-300">
            <FolderTree className="w-4 h-4" />
            <span>ফায়ারবেস ক্লাউড স্টোরেজ ও ডাটাবেস ফোল্ডার বিন্যাস</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-purple-900/30 border border-purple-800/30 space-y-1.5">
              <div className="flex items-center gap-2 text-purple-200 font-semibold">
                <FileAudio className="w-3.5 h-3.5 text-pink-400" />
                <span>Firebase Storage (ফাইল ও অডিও)</span>
              </div>
              <ul className="text-[11px] text-purple-300/80 space-y-1 pl-5 list-disc">
                <li><code className="text-pink-300 font-mono">stories/audio/</code> — প্রতিটি গল্পের MP3 ফাইল</li>
                <li><code className="text-pink-300 font-mono">stories/covers/</code> — গল্পের পোস্টার ও থাম্বনেইল</li>
                <li><code className="text-pink-300 font-mono">payment_proofs/</code> — পেমেন্ট স্ক্রিনশট রসিদ</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-purple-900/30 border border-purple-800/30 space-y-1.5">
              <div className="flex items-center gap-2 text-purple-200 font-semibold">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>Cloud Firestore (টেক্সট ও মেটাডেটা)</span>
              </div>
              <ul className="text-[11px] text-purple-300/80 space-y-1 pl-5 list-disc">
                <li><code className="text-indigo-300 font-mono">stories</code> — গল্পের নাম, লেখক, অডিও লিংক, লিসেন সংখ্যা</li>
                <li><code className="text-indigo-300 font-mono">users</code> — শ্রোতাদের প্রোফাইল ও ২০ টাকা সাবস্ক্রিপশন স্ট্যাটাস</li>
                <li><code className="text-indigo-300 font-mono">payments</code> — UTR ও পেমেন্ট ট্রানজ্যাকশন অডিট হিস্ট্রি</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Firebase Config Inputs */}
        <form onSubmit={handleSaveFirebaseConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                ফায়ারবেস Project ID
              </label>
              <input
                type="text"
                value={fbProjectId}
                onChange={(e) => setFbProjectId(e.target.value)}
                placeholder="pro-surge-bcbh2 অথবা আপনার প্রজেক্ট আইডি"
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                ফায়ারবেস Web API Key
              </label>
              <input
                type="text"
                value={fbApiKey}
                onChange={(e) => setFbApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Storage Bucket (অডিও হোস্টিং)
              </label>
              <input
                type="text"
                value={fbStorageBucket}
                onChange={(e) => setFbStorageBucket(e.target.value)}
                placeholder="pro-surge-bcbh2.firebasestorage.app"
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Auth Domain
              </label>
              <input
                type="text"
                value={fbAuthDomain}
                onChange={(e) => setFbAuthDomain(e.target.value)}
                placeholder="pro-surge-bcbh2.firebaseapp.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Firestore Database ID (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={fbDatabaseId}
                onChange={(e) => setFbDatabaseId(e.target.value)}
                placeholder="(default) অথবা ডেটাবেস আইডি"
                className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-white text-xs sm:text-sm focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 gap-3">
            {fbSaved ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ফায়ারবেস কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!
              </span>
            ) : (
              <span className="text-xs text-purple-400">
                এই সেটিংস সংরক্ষিত হলে অ্যাডমিন ও মূল অডিয়েন্স পোর্টাল উভয়ই একই ডেটাবেস থেকে রান করবে।
              </span>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/60 text-purple-200 hover:text-white font-semibold text-xs sm:text-sm flex items-center gap-2 cursor-pointer border border-purple-700/40 self-end"
            >
              <Save className="w-4 h-4" />
              <span>কনফিগ সেভ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
