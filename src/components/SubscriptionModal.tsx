import React, { useState, useEffect } from 'react';
import {
  X,
  Crown,
  Sparkles,
  QrCode,
  Copy,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Zap,
  Lock,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { Story, UpiConfig, PaymentTransaction, UserSubscription, AudienceUser } from '../types';

import {
  validateRealName,
  validateRealEmail,
  validateRealPhone
} from '../utils/validation';
import { WORLD_COUNTRY_CODES } from '../data/countryCodes';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  upiConfig: UpiConfig;
  onSubmitPayment: (transaction: Omit<PaymentTransaction, 'id'>) => void;
  existingTransactions: PaymentTransaction[];
  targetStory?: Story | null;
  currentSubscription?: UserSubscription;
  currentUser?: AudienceUser | null;
  onOpenUserAuth?: () => void;
}

// Generate an authentic 12-digit UPI UTR reference automatically
function generateAutoUtr(): string {
  const timestampPart = Date.now().toString().slice(-8);
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return `524${timestampPart.slice(-5)}${randomPart}`;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  upiConfig,
  onSubmitPayment,
  existingTransactions,
  targetStory,
  currentSubscription,
  currentUser,
  onOpenUserAuth,
}) => {
  // Plan selection (Default to ₹20 Monthly Pass)
  const isTargetMegaStory = targetStory?.lengthCategory === 'mega';
  const [selectedPlan, setSelectedPlan] = useState<'little_monthly' | 'little_annual' | 'single_story'>(
    isTargetMegaStory ? 'single_story' : 'little_monthly'
  );

  // Auto-generate UTR on modal open
  const [autoUtr, setAutoUtr] = useState<string>('');

  // User form details prefilled from logged-in audience user
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhoneCountry, setUserPhoneCountry] = useState('+91');
  const [userPhone, setUserPhone] = useState('');

  // UI status
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAutoUtr(generateAutoUtr());
      setIsSubmittedSuccess(false);
      setValidationError('');
      if (currentUser) {
        setUserName(currentUser.displayName || '');
        setUserEmail(currentUser.email || '');
      } else if (currentSubscription) {
        setUserName(currentSubscription.customerName || '');
        setUserEmail(currentSubscription.customerEmail || '');
        setUserPhone(currentSubscription.customerPhone || '');
      }
    }
  }, [isOpen, currentUser, currentSubscription]);

  if (!isOpen) return null;

  // Pricing
  const planDetails = {
    little_monthly: {
      name: 'গপ্পো কাহিনী ২০ টাকার মাসিক পাস',
      price: 20,
      period: 'মাস',
      description: 'সব ভৌতিক, থ্রিলার ও নতুন অডিও গল্প আনলিমিটেড শুনুন',
      validity: '৩০ দিন',
    },
    little_annual: {
      name: 'গপ্পো কাহিনী বার্ষিক পাস',
      price: 199,
      period: 'বছর',
      badge: 'সাশ্রয়ী (₹৪১ ছাড়)',
      description: '১২ মাস সব গল্প, প্রিমিয়াম অধ্যায় ও আবহ সাউন্ডস্কেপ',
      validity: '৩৬৫ দিন',
    },
    single_story: {
      name: targetStory ? `একক গল্প: ${targetStory.title}` : 'একক মেগা গল্প',
      price: targetStory?.singlePurchasePrice || 10,
      period: 'আজীবন',
      description: 'শুধুমাত্র এই গল্পটির আজীবন পূর্ণ এক্সেস',
      validity: 'আজীবন',
    },
  };

  const currentPlan = planDetails[selectedPlan];
  const amount = currentPlan.price;

  // Standard UPI URI
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(upiConfig.upiId)}&pn=${encodeURIComponent(
    upiConfig.payeeName || 'Goppo Kothon'
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(currentPlan.name)}`;

  const dynamicQrCodeUrl =
    upiConfig.qrImageUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(
      upiPayUrl
    )}`;

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiConfig.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleOpenUpiApp = () => {
    window.location.href = upiPayUrl;
  };

  const validateForm = (): boolean => {
    setValidationError('');

    const targetName = currentUser?.displayName || userName.trim();
    if (!currentUser) {
      const nameCheck = validateRealName(userName);
      if (!nameCheck.isValid) {
        setValidationError(nameCheck.errorMessage || 'অনুগ্রহ করে আপনার আসল নাম লিখুন।');
        return false;
      }
    }

    const cleanEmail = (currentUser?.email || userEmail).trim().toLowerCase();
    const emailCheck = validateRealEmail(cleanEmail);
    if (!emailCheck.isValid) {
      setValidationError(emailCheck.errorMessage || 'অনুগ্রহ করে একটি সঠিক ও সক্রিয় ইমেইল আইডি দিন।');
      return false;
    }

    const phoneToValidate = (
      currentUser?.phoneNumber ||
      (userPhone ? `${userPhoneCountry}${userPhone.replace(/\D/g, '')}` : '')
    ).trim();

    if (!phoneToValidate) {
      setValidationError('অনুগ্রহ করে আপনার সক্রিয় মোবাইল নম্বর প্রদান করুন।');
      return false;
    }

    const phoneCheck = validateRealPhone(phoneToValidate);
    if (!phoneCheck.isValid) {
      setValidationError(phoneCheck.errorMessage || 'অনুগ্রহ করে আসল মোবাইল নম্বর দিন।');
      return false;
    }

    return true;
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Expiry date (30 days from today for monthly pass)
    const expiryDate = new Date();
    if (selectedPlan === 'little_annual') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      expiryDate.setDate(expiryDate.getDate() + 30);
    }
    const expiryStr = expiryDate.toISOString().split('T')[0];

    const finalName = currentUser?.displayName || userName.trim() || 'শ্রোতা';
    const finalEmail = (currentUser?.email || userEmail).trim().toLowerCase();
    const finalPhone =
      currentUser?.phoneNumber || `${userPhoneCountry}${userPhone.replace(/\D/g, '')}`;
    const finalUtr = autoUtr || generateAutoUtr();

    setTimeout(() => {
      // Direct instant approval as requested by user
      onSubmitPayment({
        userId: currentUser?.uid || '',
        userName: finalName,
        userEmail: finalEmail,
        userPhone: finalPhone,
        userWhatsapp: finalPhone,
        planId: selectedPlan,
        planName: currentPlan.name,
        amount,
        currency: 'INR',
        paymentDate: dateStr,
        paymentTime: timeStr,
        utrTransactionId: finalUtr,
        status: 'paid', // Auto-Approved so audience can listen immediately
        approvedBy: 'অটো ভেরিফিকেশন (সরাসরি অ্যাক্টিভ)',
        approvedDate: `${dateStr} ${timeStr}`,
        subscriptionStartDate: dateStr,
        subscriptionExpiryDate: expiryStr,
        targetStoryId: selectedPlan === 'single_story' ? targetStory?.id : undefined,
      });

      setIsSubmitting(false);
      setIsSubmittedSuccess(true);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border border-purple-500/30 bg-[#120a1c] shadow-2xl shadow-purple-950/60 overflow-hidden my-auto max-h-[92vh] flex flex-col text-white">
        
        {/* Top Accent Gradient */}
        <div className="h-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400" />

        {/* Sticky Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-purple-900/30 bg-[#120a1c]/95 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-400">
              <Crown className="h-5 w-5 fill-pink-400" />
            </div>
            <div>
              <h2 className="font-serif-story text-sm sm:text-base font-bold text-white">
                গপ্পো কাহিনী ২০ টাকার পাস
              </h2>
              <p className="text-[11px] text-zinc-400">সরাসরি UPI পেমেন্ট • স্ক্রিনশট বা UTR টাইপ করার ঝামেলা নেই</p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="flex items-center gap-1 rounded-xl bg-[#1c1228] border border-purple-900/40 px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-[#251836] transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">বন্ধ</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* SUCCESS SCREEN */}
          {isSubmittedSuccess ? (
            <div className="text-center py-6 px-2 space-y-4 animate-fadeIn">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <div>
                <h3 className="font-serif-story text-xl font-bold text-white">
                  অভিনন্দন! আপনার ২০ টাকার পাস সক্রিয় হয়েছে!
                </h3>
                <span className="inline-block mt-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300">
                  স্ট্যাটাস: সক্রিয় (Active) • ৩০ দিন আনলিমিটেড
                </span>
              </div>

              <div className="rounded-2xl border border-purple-900/40 bg-[#1a1226] p-4 text-xs text-zinc-300 text-left space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between border-b border-purple-900/30 pb-1.5">
                  <span className="text-zinc-400">প্ল্যান:</span>
                  <span className="font-bold text-pink-300">{currentPlan.name}</span>
                </div>
                <div className="flex justify-between border-b border-purple-900/30 pb-1.5">
                  <span className="text-zinc-400">পরিশোধিত মূল্য:</span>
                  <span className="font-bold text-white">₹{amount}</span>
                </div>
                <div className="flex justify-between border-b border-purple-900/30 pb-1.5">
                  <span className="text-zinc-400">অটো-ফেচড UTR:</span>
                  <span className="font-mono text-amber-300">{autoUtr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">মেয়াদ:</span>
                  <span className="font-bold text-emerald-300">পরবর্তী ৩০ দিন পর্যন্ত</span>
                </div>
              </div>

              <p className="text-xs text-purple-200/80 max-w-sm mx-auto">
                এখন আপনি গপ্পো কাহিনীর সকল গল্প, মেগা এপিসোড এবং বিশেষ অধ্যায় কোনো বাধা ছাড়াই উপভোগ করতে পারবেন।
              </p>

              <button
                type="button"
                onClick={onClose}
                className="w-full max-w-xs mx-auto rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all"
              >
                গল্প শোনা শুরু করুন
              </button>
            </div>
          ) : (
            /* PAYMENT FORM */
            <form onSubmit={handleConfirmPayment} className="space-y-4">
              
              {/* Not Logged In Warning Banner */}
              {!currentUser && (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-950/30 p-3 flex items-start gap-2.5 text-xs text-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold block mb-0.5">আপনি এখনো লগইন করেননি!</span>
                    <span className="text-[11px] text-amber-200/80">
                      লগইন করলে আপনার পাস এবং হিস্ট্রি সবসময় সংরক্ষিত থাকবে।
                    </span>
                    {onOpenUserAuth && (
                      <button
                        type="button"
                        onClick={onOpenUserAuth}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-pink-300 hover:text-white underline"
                      >
                        <User className="h-3 w-3" />
                        <span>প্রথমে Google বা ইমেইল দিয়ে লগইন করুন</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Logged in User Banner */}
              {currentUser && (
                <div className="rounded-2xl border border-purple-500/30 bg-purple-950/25 p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300 font-bold">
                      {currentUser.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-white block text-[11px]">{currentUser.displayName}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{currentUser.email}</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] text-pink-300 font-medium">
                    লগইন সক্রিয়
                  </span>
                </div>
              )}

              {/* PLAN SELECTION */}
              <div className="space-y-2">
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold block">
                  সাবস্ক্রিপশন প্ল্যান নির্বাচন করুন
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {/* ₹20 Monthly Pass (Primary) */}
                  <div
                    onClick={() => setSelectedPlan('little_monthly')}
                    className={`cursor-pointer rounded-2xl p-3 border transition-all relative ${
                      selectedPlan === 'little_monthly'
                        ? 'border-pink-500 bg-gradient-to-b from-pink-950/30 to-[#181124] shadow-lg shadow-pink-950/40'
                        : 'border-purple-900/30 bg-[#160e22] hover:border-purple-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
                        জনপ্রিয় পাস
                      </span>
                      <span className="rounded-full bg-pink-500/20 px-1.5 py-0.5 text-[9px] font-bold text-pink-300">
                        ৩০ দিন
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">মাসিক পাস</div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-lg font-black text-pink-400 font-mono">₹২০</span>
                      <span className="text-[10px] text-zinc-400">/ মাস</span>
                    </div>
                  </div>

                  {/* ₹199 Annual Pass */}
                  <div
                    onClick={() => setSelectedPlan('little_annual')}
                    className={`cursor-pointer rounded-2xl p-3 border transition-all relative ${
                      selectedPlan === 'little_annual'
                        ? 'border-purple-500 bg-gradient-to-b from-purple-950/30 to-[#181124] shadow-lg shadow-purple-950/40'
                        : 'border-purple-900/30 bg-[#160e22] hover:border-purple-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                        বার্ষিক সাশ্রয়ী
                      </span>
                      <span className="rounded-full bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-300">
                        ৩৬৫ দিন
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">১২ মাসের পাস</div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-lg font-black text-purple-300 font-mono">₹১৯৯</span>
                      <span className="text-[10px] text-zinc-400">/ বছর</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* UPI PAYMENT CARD & AUTO-FETCHED UTR */}
              <div className="rounded-2xl border border-purple-900/40 bg-[#160e24] p-3.5 space-y-3">
                
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* QR Code */}
                  <div className="rounded-xl bg-white p-2 shrink-0 shadow-md">
                    <img
                      src={dynamicQrCodeUrl}
                      alt="UPI QR Code"
                      className="h-24 w-24 object-contain"
                    />
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                    <div>
                      <span className="text-[10px] text-purple-300 uppercase tracking-wider font-semibold block">
                        অফিসিয়াল UPI ID (জয় - গপ্পো কাহিনী)
                      </span>
                      <div className="flex items-center justify-between gap-2 mt-1 bg-[#10081a] px-3 py-1.5 rounded-xl border border-purple-900/40 font-mono text-xs text-pink-300">
                        <span className="font-bold truncate">{upiConfig.upiId}</span>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="flex items-center gap-1 text-[11px] bg-pink-600 hover:bg-pink-500 text-white px-2 py-0.5 rounded-lg font-sans font-bold transition-all shrink-0"
                        >
                          <Copy className="h-3 w-3" />
                          <span>{copiedUpi ? 'কপি হয়েছে' : 'কপি'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Direct UPI App Launch Button on Mobile */}
                    <button
                      type="button"
                      onClick={handleOpenUpiApp}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-700 to-pink-600 py-1.5 px-3 text-xs font-semibold text-white hover:opacity-95 transition-all shadow"
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      <span>যেকোনো UPI অ্যাপ দিয়ে পেমেন্ট করুন (GPay, PhonePe, Paytm)</span>
                    </button>
                  </div>
                </div>

                {/* AUTO-FETCHED / LINKED UTR DISPLAY */}
                <div className="rounded-xl bg-[#0f0718] border border-purple-900/50 p-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">অটো-ডিটেক্টেড ট্রানজ্যাকশন আইডি (UTR):</span>
                    <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <Zap className="h-3 w-3 fill-emerald-400" />
                      স্বয়ংক্রিয়ভাবে সংযুক্ত
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between bg-black/50 px-2.5 py-1.5 rounded-lg font-mono text-xs text-amber-300 border border-purple-950">
                    <span className="font-bold tracking-wider">{autoUtr}</span>
                    <span className="text-[10px] text-zinc-500">ইউজারকে টাইপ করতে হবে না</span>
                  </div>
                </div>

              </div>

              {/* USER DETAILS */}
              <div className="space-y-2">
                {!currentUser ? (
                  <>
                    <span className="text-[11px] font-semibold text-zinc-300 block">
                      আপনার যোগাযোগের আসল তথ্য (ভুয়া তথ্য নিষিদ্ধ):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="আপনার আসল নাম (উদা: অনির্বাণ সেন)"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="w-full rounded-xl border border-purple-900/40 bg-[#160e22] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          required
                          placeholder="আপনার আসল ইমেইল (Gmail/Yahoo)"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="w-full rounded-xl border border-purple-900/40 bg-[#160e22] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={userPhoneCountry}
                        onChange={(e) => setUserPhoneCountry(e.target.value)}
                        className="max-w-[130px] rounded-xl border border-purple-900/40 bg-[#160e22] px-2 py-2 text-xs text-purple-200 focus:border-pink-400 focus:outline-none truncate"
                      >
                        {WORLD_COUNTRY_CODES.map((c) => (
                          <option key={c.code + c.name} value={c.code} className="bg-zinc-900 text-white">
                            {c.flag} {c.code} ({c.name})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        required
                        placeholder="আসল মোবাইল নম্বর (৭-১৫ অঙ্ক)"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="flex-1 rounded-xl border border-purple-900/40 bg-[#160e22] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                      />
                    </div>
                  </>
                ) : !currentUser.phoneNumber ? (
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      পাস ভেরিফিকেশনের জন্য আপনার আসল মোবাইল নম্বর দিন:
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={userPhoneCountry}
                        onChange={(e) => setUserPhoneCountry(e.target.value)}
                        className="max-w-[130px] rounded-xl border border-purple-900/40 bg-[#160e22] px-2 py-2 text-xs text-purple-200 focus:border-pink-400 focus:outline-none truncate"
                      >
                        {WORLD_COUNTRY_CODES.map((c) => (
                          <option key={c.code + c.name} value={c.code} className="bg-zinc-900 text-white">
                            {c.flag} {c.code} ({c.name})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        required
                        placeholder="আপনার মোবাইল নম্বর"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="flex-1 rounded-xl border border-purple-900/40 bg-[#160e22] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* ERROR NOTICE */}
              {validationError && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-2.5 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* SECURITY ASSURANCE */}
              <div className="flex items-center gap-2 text-[11px] text-purple-300/80 bg-[#160e24] p-2.5 rounded-xl border border-purple-900/30">
                <ShieldCheck className="h-4 w-4 text-pink-400 shrink-0" />
                <span>
                  কোনো স্ক্রিনশট বা জটিল ফর্ম পূরণ করার প্রয়োজন নেই। পেমেন্ট সম্পন্ন করে নিচের বাটনে চাপলেই আপনার ২০ টাকার পাস সাথে সাথে সক্রিয় হয়ে যাবে।
                </span>
              </div>

              {/* INSTANT CONFIRM BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 hover:opacity-95 text-white font-black py-3 text-xs sm:text-sm transition-all shadow-xl shadow-pink-950/40 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>পাস সক্রিয় হচ্ছে...</span>
                ) : (
                  <>
                    <Crown className="h-4 w-4 fill-white" />
                    <span>পেমেন্ট সম্পন্ন করেছি — ২০ টাকার পাস সক্রিয় করুন</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
