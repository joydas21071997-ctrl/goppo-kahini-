import React, { useState } from 'react';
import {
  ArrowLeft,
  Shield,
  FileText,
  RefreshCcw,
  AlertTriangle,
  Mail,
  CheckCircle2,
  Send,
  User,
  Phone,
  Copy,
  Check,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import {
  LEGAL_POLICIES_DATA,
  LegalPolicySlug,
  LegalPolicyDoc
} from '../../data/legalPolicies';
import { GoppoKahiniLogo } from '../GoppoKahiniLogo';
import { UserContactMessage, ThemeMode } from '../../types';
import { submitContactMessage } from '../../services/firestoreInbox';

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
  const isLight = theme === 'purple-light' || theme === 'calm-green';
  const currentSlug = initialSlug || 'privacy-policy';
  const currentDoc: LegalPolicyDoc = LEGAL_POLICIES_DATA[currentSlug] || LEGAL_POLICIES_DATA['privacy-policy'];

  // Contact Form State (Preserving existing Contact Us functionality)
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [category, setCategory] = useState<UserContactMessage['category']>('general_feedback');
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const tabs: { slug: LegalPolicySlug; labelBn: string; labelEn: string; icon: React.ReactNode }[] = [
    {
      slug: 'privacy-policy',
      labelBn: 'গোপনীয়তা নীতি',
      labelEn: 'Privacy',
      icon: <Shield className="h-3.5 w-3.5 text-purple-400" />
    },
    {
      slug: 'terms',
      labelBn: 'শর্তাবলী',
      labelEn: 'Terms',
      icon: <FileText className="h-3.5 w-3.5 text-pink-400" />
    },
    {
      slug: 'refund-policy',
      labelBn: 'রিফান্ড নীতি',
      labelEn: 'Refund',
      icon: <RefreshCcw className="h-3.5 w-3.5 text-amber-400" />
    },
    {
      slug: 'disclaimer',
      labelBn: 'দাবিত্যাগ',
      labelEn: 'Disclaimer',
      icon: <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
    },
    {
      slug: 'contact',
      labelBn: 'যোগাযোগ ও সহায়তা',
      labelEn: 'Contact Us',
      icon: <Mail className="h-3.5 w-3.5 text-emerald-400" />
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
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 border ${
              isLight
                ? 'bg-purple-100/90 hover:bg-purple-200 text-purple-950 border-purple-300'
                : 'bg-purple-950/40 hover:bg-purple-900/60 border-purple-500/30 text-purple-200 hover:text-white'
            }`}
            aria-label="গল্পঘরে ফিরে যান"
          >
            <ArrowLeft className={`h-3.5 w-3.5 ${isLight ? 'text-purple-700' : 'text-pink-400'}`} />
            <span>গল্পঘরে ফিরুন</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${
                isLight
                  ? 'bg-white hover:bg-purple-50 border-purple-200 text-zinc-700 hover:text-purple-950 shadow-xs'
                  : 'bg-black/40 hover:bg-purple-900/30 border-purple-900/30 text-zinc-300 hover:text-white'
              }`}
              title="লিংক কপি করুন"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-600 font-semibold">কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className={`h-3 w-3 ${isLight ? 'text-purple-600' : 'text-zinc-400'}`} />
                  <span className="hidden sm:inline">লিংক কপি করুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Brand Banner */}
        <div className="text-center space-y-2.5 pb-2">
          <div className="inline-block">
            <GoppoKahiniLogo size="md" showSubtitle={true} theme={theme} />
          </div>
          <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${
            isLight ? 'text-purple-950' : 'text-white'
          }`}>
            {currentDoc.titleBn}
          </h1>
          <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${
            isLight ? 'text-purple-900/80 font-medium' : 'text-purple-300/80'
          }`}>
            {currentDoc.shortDescBn}
          </p>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] ${
            isLight
              ? 'bg-purple-50 border-purple-200 text-purple-900'
              : 'bg-purple-950/60 border-purple-800/40 text-zinc-400'
          }`}>
            <Clock className={`h-3 w-3 ${isLight ? 'text-purple-600' : 'text-pink-400'}`} />
            <span>সর্বশেষ সংস্করণ: {currentDoc.lastUpdatedBn}</span>
            <span className={isLight ? 'text-purple-300' : 'text-zinc-600'}>•</span>
            <span className={`font-mono text-[10px] ${isLight ? 'text-purple-700' : 'text-zinc-500'}`}>{currentDoc.lastUpdatedEn}</span>
          </div>
        </div>

        {/* Policy Tab Switcher Buttons (Touch friendly & scrollable on mobile) */}
        <div className={`flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b ${
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
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-pink-500/50 shadow-md shadow-purple-950/30'
                    : isLight
                      ? 'bg-white text-zinc-700 border-purple-200 hover:bg-purple-50 hover:text-purple-950 shadow-xs'
                      : 'bg-[#181124] text-zinc-400 border-purple-900/40 hover:text-zinc-200 hover:bg-[#201630]'
                }`}
              >
                {tab.icon}
                <span>{tab.labelBn}</span>
              </button>
            );
          })}
        </div>

        {/* If Contact Us is selected: Render Contact Info & Working Contact Form */}
        {currentSlug === 'contact' ? (
          <div className="space-y-6">
            {/* Direct Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`rounded-2xl border p-4 sm:p-5 space-y-2 ${
                isLight
                  ? 'border-purple-200 bg-white shadow-sm'
                  : 'border-purple-900/40 bg-[#160e24]'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                    isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>অফিসিয়াল সাপোর্ট ইমেইল</h3>
                    <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>সরাসরি ক্রিয়েটর ও অ্যাডমিন ইনবক্স</p>
                  </div>
                </div>
                <a
                  href="mailto:joydas.21071997@gmail.com"
                  className={`block text-xs font-mono font-bold hover:underline pt-1 ${
                    isLight ? 'text-purple-700' : 'text-pink-400'
                  }`}
                >
                  joydas.21071997@gmail.com
                </a>
                <p className={`text-[11px] leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  পাস অ্যাক্টিভেশন, রিফান্ড আবেদন বা প্ল্যাটফর্ম সংক্রান্ত যেকোনো পরামর্শের জন্য ইমেইল করুন।
                </p>
              </div>

              <div className={`rounded-2xl border p-4 sm:p-5 space-y-2 ${
                isLight
                  ? 'border-purple-200 bg-white shadow-sm'
                  : 'border-purple-900/40 bg-[#160e24]'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                    isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>প্রতিষ্ঠাতা ও পরিচালক</h3>
                    <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>গপ্পো কাহিনী অডিও উদ্যোগ</p>
                  </div>
                </div>
                <p className={`text-xs font-bold pt-1 ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                  জয় (Joy)
                </p>
                <p className={`text-[11px] leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  পশ্চিমবঙ্গ, ভারত • সহায়তার সময়সীমা: সোম-শনিবার (সকাল ১০:০০ - রাত ৮:০০ টা IST)
                </p>
              </div>
            </div>

            {/* Working Contact Us Form */}
            <div className={`rounded-3xl border p-5 sm:p-7 space-y-4 ${
              isLight
                ? 'border-purple-200 bg-white shadow-md'
                : 'border-purple-900/40 bg-[#150d22]'
            }`}>
              <div className={`border-b pb-3 ${isLight ? 'border-purple-100' : 'border-purple-900/30'}`}>
                <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-purple-950' : 'text-white'}`}>
                  <Send className={`h-4 w-4 ${isLight ? 'text-purple-600' : 'text-pink-400'}`} />
                  <span>সরাসরি বার্তা বা মতামত পাঠান</span>
                </h3>
                <p className={`text-xs mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  আপনার মেসেজটি সরাসরি অ্যাডমিন ইনবক্সে জমা হবে এবং শীঘ্রই পর্যালোচনা করা হবে।
                </p>
              </div>

              {submitSuccess ? (
                <div className={`rounded-2xl border p-6 text-center space-y-3 animate-fadeIn ${
                  isLight
                    ? 'border-emerald-200 bg-emerald-50 text-zinc-800'
                    : 'border-emerald-500/40 bg-emerald-950/30 text-white'
                }`}>
                  <div className={`h-12 w-12 rounded-full border flex items-center justify-center mx-auto ${
                    isLight
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}>
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className={`text-base font-bold ${isLight ? 'text-emerald-950' : 'text-white'}`}>আপনার বার্তা সফলভাবে জমা হয়েছে!</h4>
                  <p className={`text-xs max-w-md mx-auto leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                    ধন্যবাদ! আপনার বার্তা সরাসরি অ্যাডমিন ইনবক্সে যুক্ত হয়েছে। জয় ও টিম আপনার বার্তাটি পড়ে প্রয়োজনীয় পদক্ষেপ গ্রহণ করবেন।
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitSuccess(false)}
                    className="rounded-full bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 text-xs font-bold text-white transition-all shadow-sm"
                  >
                    আরেকটি বার্তা পাঠান
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className={`text-[11px] font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>আপনার নাম *</label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                        <input
                          type="text"
                          required
                          placeholder="আপনার সম্পূর্ণ নাম"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-xs focus:outline-none transition-all ${
                            isLight
                              ? 'border-purple-200 bg-purple-50/40 text-zinc-900 focus:border-purple-600 focus:bg-white'
                              : 'border-purple-900/40 bg-black/40 text-white focus:border-pink-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`text-[11px] font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>ইমেইল ঠিকানা *</label>
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
                              ? 'border-purple-200 bg-purple-50/40 text-zinc-900 focus:border-purple-600 focus:bg-white'
                              : 'border-purple-900/40 bg-black/40 text-white focus:border-pink-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className={`text-[11px] font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>মোবাইল / হোয়াটসঅ্যাপ নম্বর (ঐচ্ছিক)</label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                        <input
                          type="tel"
                          placeholder="+91 / +880..."
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(e.target.value)}
                          className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-xs focus:outline-none transition-all ${
                            isLight
                              ? 'border-purple-200 bg-purple-50/40 text-zinc-900 focus:border-purple-600 focus:bg-white'
                              : 'border-purple-900/40 bg-black/40 text-white focus:border-pink-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`text-[11px] font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>বিষয় / ক্যাটাগরি</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as UserContactMessage['category'])}
                        className={`mt-1 w-full rounded-xl border py-2.5 px-3 text-xs focus:outline-none transition-all ${
                          isLight
                            ? 'border-purple-200 bg-purple-50/40 text-zinc-900 focus:border-purple-600 focus:bg-white'
                            : 'border-purple-900/40 bg-[#160c24] text-white focus:border-pink-500'
                        }`}
                      >
                        <option value="general_feedback">সাধারণ মতামত ও প্রশংসা</option>
                        <option value="story_request">নতুন গল্পের অনুরোধ</option>
                        <option value="payment_help">পাস ও পেমেন্ট সংক্রান্ত সহায়তা</option>
                        <option value="bug_report">অ্যাপ সমস্যা বা বাগ রিপোর্ট</option>
                        <option value="collaboration">কথক বা কনটেন্ট নিয়ে যৌথ কাজ</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`text-[11px] font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>বার্তা বিস্তারিত লিখুন *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="আপনার প্রশ্ন বা মতামত বিস্তারিতভাবে এখানে লিখুন..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className={`mt-1 w-full rounded-xl border p-3 text-xs focus:outline-none resize-none transition-all ${
                        isLight
                          ? 'border-purple-200 bg-purple-50/40 text-zinc-900 focus:border-purple-600 focus:bg-white'
                          : 'border-purple-900/40 bg-black/40 text-white focus:border-pink-500'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 py-3 text-xs font-bold text-white shadow-lg shadow-purple-950/20 hover:opacity-95 transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSubmitting ? 'বার্তা পাঠানো হচ্ছে...' : 'বার্তা পাঠান'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* Standard Policy Document Sections */
          <div className="space-y-6">
            {currentDoc.sections.map((sec) => (
              <section
                key={sec.id}
                id={sec.id}
                className={`rounded-2xl border p-5 sm:p-6 space-y-3 ${
                  isLight
                    ? 'border-purple-200/90 bg-white shadow-sm'
                    : 'border-purple-900/35 bg-[#140b20]/90'
                }`}
              >
                <div className={`flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b pb-2.5 ${
                  isLight ? 'border-purple-100' : 'border-purple-900/30'
                }`}>
                  <h2 className={`text-sm sm:text-base font-bold ${isLight ? 'text-purple-950' : 'text-white'}`}>
                    {sec.headingBn}
                  </h2>
                  <span className={`text-[11px] font-mono ${isLight ? 'text-purple-600 font-medium' : 'text-zinc-500'}`}>
                    {sec.headingEn}
                  </span>
                </div>

                <div className={`space-y-2 text-xs sm:text-[13px] leading-relaxed ${
                  isLight ? 'text-zinc-700' : 'text-zinc-300'
                }`}>
                  {sec.paragraphsBn.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                {sec.bulletPointsBn && sec.bulletPointsBn.length > 0 && (
                  <ul className="space-y-2 pt-1">
                    {sec.bulletPointsBn.map((item, idx) => (
                      <li key={idx} className={`flex items-start gap-2.5 text-xs sm:text-[13px] ${
                        isLight ? 'text-zinc-700' : 'text-zinc-300'
                      }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-pink-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}

        {/* Footer Note within Legal Policy Document */}
        <div className={`border-t pt-6 text-center space-y-2 ${isLight ? 'border-purple-200' : 'border-purple-900/30'}`}>
          <p className={`text-xs ${isLight ? 'text-zinc-600 font-medium' : 'text-zinc-400'}`}>
            গপ্পো কাহিনী (Goppo Kahini) • সর্বস্বত্ব সংরক্ষিত ২০২৬
          </p>
          <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
            আইনি ও প্রাতিষ্ঠানিক যোগাযোগের জন্য ইমেইল:{' '}
            <a href="mailto:joydas.21071997@gmail.com" className={`font-semibold hover:underline ${
              isLight ? 'text-purple-700' : 'text-pink-400'
            }`}>
              joydas.21071997@gmail.com
            </a>
          </p>
        </div>

      </main>
    </div>
  );
};
