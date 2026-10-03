import React, { useState } from 'react';
import {
  ArrowLeft,
  Shield,
  FileText,
  RefreshCcw,
  Trash2,
  Mail,
  Check,
  Clock,
  Copy,
  CheckCircle,
  Award,
  Send,
  User,
  Phone,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  LEGAL_POLICIES_DATA,
  LegalPolicySlug,
  LegalPolicyDoc
} from '../../data/legalPolicies';
import { GoppoKahiniLogo } from '../GoppoKahiniLogo';
import { UserContactMessage, ThemeMode } from '../../types';
import { submitContactMessage } from '../../services/firestoreInbox';
import { useLanguage } from '../../context/LanguageContext';

interface LegalSupportPageProps {
  initialSlug?: LegalPolicySlug;
  onNavigateHome: () => void;
  onSelectPolicy: (slug: LegalPolicySlug) => void;
  theme?: ThemeMode;
}

export const LegalSupportPage: React.FC<LegalSupportPageProps> = ({
  initialSlug = 'privacy-policy',
  onNavigateHome,
  onSelectPolicy,
  theme = 'purple-light',
}) => {
  const { t, language } = useLanguage();
  const isLight = theme === 'purple-light' || theme === 'calm-green';
  const currentSlug: LegalPolicySlug = (initialSlug && initialSlug in LEGAL_POLICIES_DATA)
    ? (initialSlug as LegalPolicySlug)
    : 'privacy-policy';
  const currentDoc: LegalPolicyDoc = LEGAL_POLICIES_DATA[currentSlug] || LEGAL_POLICIES_DATA['privacy-policy'];

  // Support / Contact Form State
  const [showContactForm, setShowContactForm] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [category, setCategory] = useState<UserContactMessage['category']>('general_feedback');
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // The 4 Final Canonical Public Policy Pages
  const tabs: {
    slug: LegalPolicySlug;
    labelBn: string;
    labelEn: string;
    badge: string;
    icon: React.ReactNode;
  }[] = [
    {
      slug: 'privacy-policy',
      labelBn: 'গোপনীয়তা নীতি',
      labelEn: 'Privacy Policy',
      badge: 'DPDP 2023',
      icon: <Shield className="h-3.5 w-3.5 text-purple-400" />
    },
    {
      slug: 'terms',
      labelBn: 'শর্তাবলী ও নিয়মাবলী',
      labelEn: 'Terms & Conditions',
      badge: 'Contract 1872',
      icon: <FileText className="h-3.5 w-3.5 text-pink-400" />
    },
    {
      slug: 'refund-policy',
      labelBn: 'রিফান্ড ও বাতিলকরণ নীতি',
      labelEn: 'Refund Policy',
      badge: 'E-Commerce 2020',
      icon: <RefreshCcw className="h-3.5 w-3.5 text-amber-400" />
    },
    {
      slug: 'data-deletion',
      labelBn: 'অ্যাকাউন্ট ও ডেটা অপসারণ',
      labelEn: 'Account & Data Deletion',
      badge: 'Right to Erasure',
      icon: <Trash2 className="h-3.5 w-3.5 text-rose-400" />
    }
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !messageText.trim()) return;

    setIsSubmitting(true);

    try {
      await submitContactMessage({
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        senderPhone: senderPhone.trim() || undefined,
        category,
        message: messageText.trim(),
      });
    } catch (err) {
      console.error('Error submitting contact message:', err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setSenderName('');
      setSenderEmail('');
      setSenderPhone('');
      setMessageText('');
    }, 400);
  };

  const handleCopyLink = () => {
    const url = window.location.origin + '/' + currentSlug;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans pb-32 transition-colors ${
      isLight ? 'bg-[#faf8fe] text-zinc-900' : 'bg-[#0e0719] text-zinc-200'
    }`}>
      {/* Top Breadcrumb & Return Bar */}
      <div className={`sticky top-0 z-30 border-b backdrop-blur-md px-4 sm:px-6 py-3 transition-colors ${
        isLight
          ? 'border-purple-200/90 bg-white/95 shadow-xs'
          : 'border-purple-900/40 bg-[#120a1c]/95'
      }`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onNavigateHome}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 border cursor-pointer ${
              isLight
                ? 'bg-purple-100/90 hover:bg-purple-200 text-purple-950 border-purple-300'
                : 'bg-purple-950/40 hover:bg-purple-900/60 border-purple-500/30 text-purple-200 hover:text-white'
            }`}
            aria-label={t('nav_stories', 'গল্পঘরে ফিরুন')}
          >
            <ArrowLeft className={`h-3.5 w-3.5 ${isLight ? 'text-purple-700' : 'text-pink-400'}`} />
            <span>{t('return_home_btn', 'গল্পঘরে ফিরুন')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-purple-50 border-purple-200 text-zinc-700 hover:text-purple-950 shadow-xs'
                  : 'bg-black/40 hover:bg-purple-900/30 border-purple-900/30 text-zinc-300 hover:text-white'
              }`}
              title="Copy Policy Link"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-600 font-semibold">{t('copied', 'কপি হয়েছে')}</span>
                </>
              ) : (
                <>
                  <Copy className={`h-3 w-3 ${isLight ? 'text-purple-600' : 'text-zinc-400'}`} />
                  <span className="hidden sm:inline">{t('copy_link', 'লিংক কপি করুন')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Brand Banner & Indian Law Compliance Highlights */}
        <div className="text-center space-y-3 pb-2">
          <div className="inline-block">
            <GoppoKahiniLogo size="md" showSubtitle={true} theme={theme} />
          </div>

          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              isLight
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
            }`}>
              <CheckCircle className="h-3 w-3 text-emerald-500" />
              <span>Republic of India Statutory Compliance</span>
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono border ${
              isLight
                ? 'bg-purple-50 border-purple-200 text-purple-800'
                : 'bg-purple-950/40 border-purple-800/40 text-purple-300'
            }`}>
              <Award className="h-3 w-3 text-pink-400" />
              <span>DPDP Act 2023 • IT Rules 2021 • Kolkata Jurisdiction</span>
            </span>
          </div>

          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${
            isLight ? 'text-purple-950' : 'text-white'
          }`}>
            {currentDoc.titleEn}
            <span className={`block text-xs sm:text-sm font-normal mt-1 ${isLight ? 'text-purple-700' : 'text-pink-300'}`}>
              {currentDoc.titleBn}
            </span>
          </h1>

          <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${
            isLight ? 'text-purple-900/80 font-medium' : 'text-purple-300/80'
          }`}>
            {currentDoc.shortDescEn}
          </p>

          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] ${
            isLight
              ? 'bg-purple-50 border-purple-200 text-purple-900'
              : 'bg-purple-950/60 border-purple-800/40 text-zinc-400'
          }`}>
            <Clock className={`h-3 w-3 ${isLight ? 'text-purple-600' : 'text-pink-400'}`} />
            <span>Effective Date: {currentDoc.lastUpdatedEn}</span>
            <span className={isLight ? 'text-purple-300' : 'text-zinc-600'}>•</span>
            <span className={`font-mono text-[10px] ${isLight ? 'text-purple-700 font-semibold' : 'text-pink-300'}`}>
              {currentDoc.complianceBadgeEn}
            </span>
          </div>
        </div>

        {/* 4 Policy Tab Switcher Buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className={`text-[11px] font-semibold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              {language === 'bn' ? 'আইনি ও পলিসি ডকুমেন্টস (৪টি অধ্যায়):' : language === 'hi' ? 'कानूनी एवं नीति दस्तावेज (4 खंड):' : 'Legal Policy Documents (4 Sections):'}
            </span>
            <span className={`text-[10px] font-mono ${isLight ? 'text-purple-600' : 'text-pink-400'}`}>
              Master English Policy Version
            </span>
          </div>

          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 border-b pb-2 ${
            isLight ? 'border-purple-200' : 'border-purple-900/30'
          }`}>
            {tabs.map((tab) => {
              const isActive = currentSlug === tab.slug;
              return (
                <button
                  key={tab.slug}
                  onClick={() => {
                    onSelectPolicy(tab.slug);
                    setSubmitSuccess(false);
                  }}
                  className={`flex flex-col items-start gap-1 rounded-xl p-2.5 sm:p-3 text-xs font-semibold transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-pink-500/50 shadow-md shadow-purple-950/30'
                      : isLight
                        ? 'bg-white text-zinc-700 border-purple-200 hover:bg-purple-50 hover:text-purple-950 shadow-xs'
                        : 'bg-[#181124] text-zinc-400 border-purple-900/40 hover:text-zinc-200 hover:bg-[#201630]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5">
                      {tab.icon}
                      <span className="truncate">{tab.labelEn}</span>
                    </div>
                    <span className={`text-[9px] font-mono px-1 rounded ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isLight
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-purple-950/80 text-pink-300'
                    }`}>
                      {tab.badge}
                    </span>
                  </div>
                  <span className={`text-[10px] font-normal truncate ${
                    isActive ? 'text-purple-100' : isLight ? 'text-zinc-500' : 'text-zinc-400'
                  }`}>
                    {tab.labelBn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Specialized Interactive Guidance for Account & Data Deletion */}
        {currentSlug === 'data-deletion' && (
          <div className={`rounded-3xl border p-5 sm:p-6 space-y-4 ${
            isLight ? 'border-rose-200 bg-rose-50/50' : 'border-rose-900/40 bg-[#190c1a]'
          }`}>
            <div className="flex items-start sm:items-center gap-3 border-b pb-3 border-rose-200/50">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className={`text-sm sm:text-base font-bold ${isLight ? 'text-rose-950' : 'text-white'}`}>
                  Account & Data Deletion Execution (DPDP Act 2023 Sec 12)
                </h3>
                <p className={`text-xs ${isLight ? 'text-rose-900/80' : 'text-rose-300/80'}`}>
                  Permanent erasure of account credentials, personal profile, bookmarks, and listening history
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-white border-rose-100 shadow-xs' : 'bg-black/30 border-rose-950/40'}`}>
                <span className="text-[10px] uppercase font-bold text-rose-500 block">Method 1: Instant In-App Deletion</span>
                <p className={`text-xs font-semibold mt-1 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  Profile / Settings → Account → Delete Account
                </p>
                <p className={`text-[11px] mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Self-service, authenticated instant deletion securely tied to your active Firebase account.
                </p>
              </div>

              <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-white border-rose-100 shadow-xs' : 'bg-black/30 border-rose-950/40'}`}>
                <span className="text-[10px] uppercase font-bold text-rose-500 block">Method 2: Direct Email Request</span>
                <a
                  href="mailto:joydas.21071997@gmail.com?subject=Account%20Deletion%20Request&body=Hello%20Admin,%20Please%20permanently%20delete%20my%20Goppo%20Kahini%20account%20and%20all%20associated%20personal%20data%20under%20Section%2012%20of%20the%20DPDP%20Act%202023.%20My%20registered%20email%20is:%20"
                  className="text-xs font-mono font-bold text-pink-500 hover:underline mt-1 block truncate"
                >
                  joydas.21071997@gmail.com
                </a>
                <p className={`text-[11px] mt-0.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Send from your registered email address. Subject: "Account Deletion Request".
                </p>
              </div>
            </div>

            <p className={`text-[11px] font-mono ${isLight ? 'text-zinc-600' : 'text-zinc-400'} pt-1`}>
              Public URL: <a href="https://goppokahini.in/delete-account" className="text-pink-500 underline">https://goppokahini.in/delete-account</a>
            </p>
          </div>
        )}

        {/* Master English Legal Policy Document Sections */}
        <div className="space-y-6">
          {currentDoc.sections.map((sec) => (
            <section
              key={sec.id}
              id={sec.id}
              className={`rounded-2xl border p-5 sm:p-6 space-y-3.5 ${
                isLight
                  ? 'border-purple-200/90 bg-white shadow-sm'
                  : 'border-purple-900/35 bg-[#140b20]/90'
              }`}
            >
              <div className={`flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b pb-2.5 ${
                isLight ? 'border-purple-100' : 'border-purple-900/30'
              }`}>
                <h2 className={`text-sm sm:text-base font-bold ${isLight ? 'text-purple-950' : 'text-white'}`}>
                  {sec.heading}
                </h2>
                {sec.headingBn && (
                  <span className={`text-[11px] font-medium ${isLight ? 'text-purple-700' : 'text-pink-300'}`}>
                    {sec.headingBn}
                  </span>
                )}
              </div>

              <div className={`space-y-2.5 text-xs sm:text-[13px] leading-relaxed ${
                isLight ? 'text-zinc-700' : 'text-zinc-300'
              }`}>
                {sec.paragraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                <ul className="space-y-2 pt-1.5">
                  {sec.bulletPoints.map((item, idx) => (
                    <li key={idx} className={`flex items-start gap-2.5 text-xs sm:text-[13px] leading-relaxed ${
                      isLight ? 'text-zinc-700' : 'text-zinc-300'
                    }`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-pink-500 mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Collapsible Customer Support & Grievance Messaging Form */}
        <div className={`rounded-2xl border overflow-hidden transition-all ${
          isLight ? 'border-purple-200 bg-white shadow-sm' : 'border-purple-900/40 bg-[#140b20]'
        }`}>
          <button
            type="button"
            onClick={() => setShowContactForm(!showContactForm)}
            className={`w-full flex items-center justify-between p-4 text-left transition-colors cursor-pointer ${
              isLight ? 'hover:bg-purple-50/70 text-zinc-900' : 'hover:bg-purple-900/20 text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-300'
              }`}>
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold">
                  {language === 'bn' ? 'আইনি ও সহায়তা ইনবক্স বার্তা পাঠান' : language === 'hi' ? 'कानूनी एवं सहायता संदेश भेजें' : 'Send a Legal or Support Message'}
                </h3>
                <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {language === 'bn' ? 'পাস, রিফান্ড বা আইনি অভিযোগ সংক্রান্ত বার্তা সরাসরি অ্যাডমিন ইনবক্সে পৌঁছায়' : 'Direct contact to Admin Joy for pass help, refund inquiries, or legal grievances'}
                </p>
              </div>
            </div>
            {showContactForm ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
          </button>

          {showContactForm && (
            <div className={`p-4 sm:p-6 border-t ${isLight ? 'border-purple-100 bg-purple-50/30' : 'border-purple-900/30 bg-black/20'}`}>
              {submitSuccess ? (
                <div className={`rounded-2xl border p-4 text-center space-y-2 ${
                  isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-emerald-800/40 bg-emerald-950/40 text-emerald-200'
                }`}>
                  <CheckCircle className="h-7 w-7 text-emerald-500 mx-auto" />
                  <h4 className="text-xs sm:text-sm font-bold">
                    {language === 'bn' ? 'আপনার বার্তা সফলভাবে জমা হয়েছে!' : 'Your message has been submitted successfully!'}
                  </h4>
                  <p className="text-[11px] max-w-md mx-auto">
                    {language === 'bn' ? 'অ্যাডমিন জয় আপনার বার্তাটি যাচাই করে ২৪ ঘণ্টার মধ্যে আপনার ইমেইলে যোগাযোগ করবেন।' : 'Admin Joy will review your message and respond within 24 hours.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitSuccess(false)}
                    className="mt-2 text-xs font-semibold text-pink-500 hover:underline"
                  >
                    {language === 'bn' ? 'আরেকটি বার্তা পাঠান' : 'Send another message'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className={`text-[11px] font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                        {language === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
                      </label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-xs focus:outline-none transition-all ${
                            isLight
                              ? 'border-purple-200 bg-white text-zinc-900 focus:border-purple-600'
                              : 'border-purple-900/40 bg-black/40 text-white focus:border-pink-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`text-[11px] font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                        {language === 'bn' ? 'ইমেইল ঠিকানা *' : 'Email Address *'}
                      </label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                        <input
                          type="email"
                          required
                          placeholder="your.email@example.com"
                          value={senderEmail}
                          onChange={(e) => setSenderEmail(e.target.value)}
                          className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-xs focus:outline-none transition-all ${
                            isLight
                              ? 'border-purple-200 bg-white text-zinc-900 focus:border-purple-600'
                              : 'border-purple-900/40 bg-black/40 text-white focus:border-pink-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className={`text-[11px] font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                        {language === 'bn' ? 'মোবাইল নম্বর (ঐচ্ছিক)' : 'Phone Number (Optional)'}
                      </label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                        <input
                          type="tel"
                          placeholder="+91 / +880..."
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(e.target.value)}
                          className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-xs focus:outline-none transition-all ${
                            isLight
                              ? 'border-purple-200 bg-white text-zinc-900 focus:border-purple-600'
                              : 'border-purple-900/40 bg-black/40 text-white focus:border-pink-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`text-[11px] font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                        {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as UserContactMessage['category'])}
                        className={`mt-1 w-full rounded-xl border py-2.5 px-3 text-xs focus:outline-none transition-all ${
                          isLight
                            ? 'border-purple-200 bg-white text-zinc-900 focus:border-purple-600'
                            : 'border-purple-900/40 bg-[#160c24] text-white focus:border-pink-500'
                        }`}
                      >
                        <option value="payment_help">{language === 'bn' ? 'পাস ও পেমেন্ট সংক্রান্ত সহায়তা' : 'Pass & Payment Assistance'}</option>
                        <option value="general_feedback">{language === 'bn' ? 'সাধারণ মতামত বা অভিযোগ' : 'Legal Grievance / General Inquiry'}</option>
                        <option value="story_request">{language === 'bn' ? 'নতুন গল্পের অনুরোধ' : 'Story Request / Audio Question'}</option>
                        <option value="bug_report">{language === 'bn' ? 'অ্যাপ সমস্যা বা বাগ রিপোর্ট' : 'Technical Bug Report'}</option>
                        <option value="collaboration">{language === 'bn' ? 'কথক বা যৌথ উদ্যোগ' : 'Narrator Audition / Collaboration'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`text-[11px] font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                      {language === 'bn' ? 'বার্তা বিস্তারিত লিখুন *' : 'Your Detailed Message *'}
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder={language === 'bn' ? 'আপনার প্রশ্ন বা বার্তা এখানে বিস্তারিত লিখুন...' : 'Describe your query or feedback in detail...'}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className={`mt-1 w-full rounded-xl border p-3 text-xs focus:outline-none resize-none transition-all ${
                        isLight
                          ? 'border-purple-200 bg-white text-zinc-900 focus:border-purple-600'
                          : 'border-purple-900/40 bg-black/40 text-white focus:border-pink-500'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 py-3 text-xs font-bold text-white shadow-lg shadow-purple-950/20 hover:opacity-95 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSubmitting ? (language === 'bn' ? 'বার্তা পাঠানো হচ্ছে...' : 'Submitting Message...') : (language === 'bn' ? 'বার্তা পাঠান' : 'Send Message')}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Note within Legal Policy Document */}
        <div className={`border-t pt-6 text-center space-y-2 ${isLight ? 'border-purple-200' : 'border-purple-900/30'}`}>
          <p className={`text-xs ${isLight ? 'text-zinc-600 font-medium' : 'text-zinc-400'}`}>
            Goppo Kahini • Sole Proprietorship Entity founded & operated by Joy • Republic of India
          </p>
          <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
            Statutory Grievance & Nodal Officer Contact:{' '}
            <a href="mailto:joydas.21071997@gmail.com" className={`font-semibold hover:underline ${
              isLight ? 'text-purple-700' : 'text-pink-400'
            }`}>
              joydas.21071997@gmail.com
            </a>
            {' • '}
            <span>Kolkata, West Bengal, India — 700001</span>
          </p>
        </div>

      </main>
    </div>
  );
};
