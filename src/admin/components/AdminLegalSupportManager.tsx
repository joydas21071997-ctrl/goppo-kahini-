import React, { useState } from 'react';
import {
  Scale,
  Shield,
  FileText,
  RefreshCcw,
  AlertTriangle,
  Mail,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  Info
} from 'lucide-react';
import { LEGAL_POLICIES_DATA, LegalPolicySlug, LegalPolicyDoc } from '../../data/legalPolicies';

export const AdminLegalSupportManager: React.FC = () => {
  const [selectedSlug, setSelectedSlug] = useState<LegalPolicySlug>('privacy-policy');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const policyList: {
    slug: LegalPolicySlug;
    titleBn: string;
    titleEn: string;
    icon: React.ReactNode;
    color: string;
    badge: string;
  }[] = [
    {
      slug: 'privacy-policy',
      titleBn: 'গোপনীয়তা নীতি',
      titleEn: 'Privacy Policy',
      icon: <Shield className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/30 bg-purple-950/20',
      badge: 'DPDP / IT Act 2000 compliant'
    },
    {
      slug: 'terms',
      titleBn: 'শর্তাবলী ও নিয়মাবলী',
      titleEn: 'Terms & Conditions',
      icon: <FileText className="w-5 h-5 text-pink-400" />,
      color: 'border-pink-500/30 bg-pink-950/20',
      badge: 'কপিরাইট ও ₹২০ পাস লাইসেন্স'
    },
    {
      slug: 'refund-policy',
      titleBn: 'রিফান্ড ও বাতিলকরণ নীতি',
      titleEn: 'Refund & Cancellation Policy',
      icon: <RefreshCcw className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/30 bg-amber-950/20',
      badge: '৭ দিনের ডুপ্লিকেট পেমেন্ট রিফান্ড'
    },
    {
      slug: 'disclaimer',
      titleBn: 'দাবিত্যাগ',
      titleEn: 'Disclaimer',
      icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
      color: 'border-orange-500/30 bg-orange-950/20',
      badge: 'কাল্পনিক সাহিত্য ও পডকাস্ট ডিসক্লেমার'
    },
    {
      slug: 'contact',
      titleBn: 'যোগাযোগ ও সহায়তা',
      titleEn: 'Contact Us & Support',
      icon: <Mail className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/30 bg-emerald-950/20',
      badge: 'ইনবক্স ও ক্রিয়েটর সাপোর্ট'
    }
  ];

  const handleCopy = (slug: LegalPolicySlug) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    }).catch(() => {});
  };

  const handleOpenPage = (slug: LegalPolicySlug) => {
    window.open(`/${slug}`, '_blank');
  };

  const activeDoc: LegalPolicyDoc = LEGAL_POLICIES_DATA[selectedSlug];

  return (
    <div className="space-y-6 animate-fadeIn text-zinc-200">
      {/* Header Banner */}
      <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-r from-[#180e26] via-[#140a20] to-[#12081a] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>আইন, নীতি ও সহায়তা ব্যবস্থাপনা</span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  লাইভ সক্রিয়
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                গপ্পো কাহিনীর সমস্ত পাবলিক পলিসি, শর্তাবলী, রিফান্ড ও যোগাযোগ পেজের ডিরেক্টরি
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400">অফিসিয়াল সাপোর্ট:</span>
            <span className="font-mono text-pink-300 font-semibold">joydas.21071997@gmail.com</span>
          </div>
        </div>
      </div>

      {/* Grid of Policy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {policyList.map((item) => {
          const isSelected = selectedSlug === item.slug;
          return (
            <div
              key={item.slug}
              className={`rounded-2xl border p-4 transition-all flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'border-pink-500/60 bg-[#1f1233] shadow-lg shadow-purple-950/50 ring-1 ring-pink-500/30'
                  : `${item.color} hover:border-purple-500/40`
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/40 border border-purple-900/40">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400 bg-black/30 px-2 py-0.5 rounded-md border border-white/5">
                    /{item.slug}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">{item.titleBn}</h3>
                  <p className="text-[11px] font-mono text-zinc-400">{item.titleEn}</p>
                </div>

                <div className="text-[10px] text-pink-300/90 font-medium">
                  • {item.badge}
                </div>
              </div>

              <div className="pt-2 border-t border-purple-900/30 flex items-center gap-2">
                <button
                  onClick={() => setSelectedSlug(item.slug)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-pink-600 text-white'
                      : 'bg-purple-900/30 hover:bg-purple-800/40 text-purple-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>প্রিভিউ</span>
                </button>

                <button
                  onClick={() => handleOpenPage(item.slug)}
                  className="flex items-center justify-center gap-1 p-1.5 rounded-xl bg-black/40 hover:bg-white/10 text-zinc-300 hover:text-white border border-purple-900/30 transition-all text-xs"
                  title="নতুন ট্যাবে পাবলিক পেজ খুলুন"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                <button
                  onClick={() => handleCopy(item.slug)}
                  className="flex items-center justify-center gap-1 p-1.5 rounded-xl bg-black/40 hover:bg-white/10 text-zinc-300 hover:text-white border border-purple-900/30 transition-all text-xs"
                  title="লিংক কপি করুন"
                >
                  {copiedSlug === item.slug ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Policy Document Live Preview */}
      {activeDoc && (
        <div className="rounded-3xl border border-purple-900/40 bg-[#140b20] p-5 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/30 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {activeDoc.titleBn}
                </h3>
                <span className="text-xs text-zinc-400 font-mono">({activeDoc.titleEn})</span>
              </div>
              <p className="text-xs text-purple-300/80 mt-0.5">
                {activeDoc.shortDescBn}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenPage(activeDoc.slug)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all"
              >
                <span>পাবলিক পেজ দেখুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sections list */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
            {activeDoc.sections.map((sec) => (
              <div
                key={sec.id}
                className="rounded-2xl border border-purple-900/30 bg-[#1a1128]/70 p-4 space-y-2"
              >
                <div className="flex items-baseline justify-between gap-2 border-b border-purple-900/20 pb-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-purple-200">
                    {sec.headingBn}
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {sec.headingEn}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-300 leading-relaxed">
                  {sec.paragraphsBn.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {sec.bulletPointsBn && sec.bulletPointsBn.length > 0 && (
                  <ul className="space-y-1.5 pt-1">
                    {sec.bulletPointsBn.map((bp, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-pink-400 mt-1.5 shrink-0" />
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
