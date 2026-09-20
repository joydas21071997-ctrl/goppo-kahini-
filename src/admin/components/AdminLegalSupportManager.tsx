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
  Info,
  Trash2,
  CreditCard,
  Users,
  ShieldAlert,
  Server,
  Smartphone,
  Building,
  Award
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
      badge: 'DPDP Act 2023 ও IT Act 2000'
    },
    {
      slug: 'terms',
      titleBn: 'শর্তাবলী ও নিয়মাবলী',
      titleEn: 'Terms & Conditions',
      icon: <FileText className="w-5 h-5 text-pink-400" />,
      color: 'border-pink-500/30 bg-pink-950/20',
      badge: 'Indian Contract Act 1872'
    },
    {
      slug: 'data-deletion',
      titleBn: 'অ্যাকাউন্ট ও ডেটা অপসারণ',
      titleEn: 'Account & Data Deletion',
      icon: <Trash2 className="w-5 h-5 text-rose-400" />,
      color: 'border-rose-500/30 bg-rose-950/20',
      badge: 'DPDP Act Sec 12 Right to Erasure'
    },
    {
      slug: 'grievance',
      titleBn: 'অভিযোগ ও নোডাল অফিসার',
      titleEn: 'Grievance / Privacy Contact',
      icon: <Scale className="w-5 h-5 text-indigo-400" />,
      color: 'border-indigo-500/30 bg-indigo-950/20',
      badge: 'IT Rules 2021 Rule 3(2)'
    },
    {
      slug: 'refund-policy',
      titleBn: 'রিফান্ড ও বাতিলকরণ নীতি',
      titleEn: 'Refund & Cancellation Policy',
      icon: <RefreshCcw className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/30 bg-amber-950/20',
      badge: 'Consumer Protection Rules 2020'
    },
    {
      slug: 'subscription-terms',
      titleBn: 'সাবস্ক্রিপশন ও ২০ টাকা পাস',
      titleEn: 'Subscription Terms',
      icon: <CreditCard className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/30 bg-cyan-950/20',
      badge: 'RBI Non-AutoDebit Transparent'
    },
    {
      slug: 'community-guidelines',
      titleBn: 'কমিউনিটি ও মন্তব্য নীতি',
      titleEn: 'Community Guidelines',
      icon: <Users className="w-5 h-5 text-teal-400" />,
      color: 'border-teal-500/30 bg-teal-950/20',
      badge: 'IT Rules 2021 Rule 3(1)(b)'
    },
    {
      slug: 'copyright-policy',
      titleBn: 'কপিরাইট ও মেধা-স্বত্ব নীতি',
      titleEn: 'Copyright Policy',
      icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
      color: 'border-red-500/30 bg-red-950/20',
      badge: 'Indian Copyright Act 1957'
    },
    {
      slug: 'disclaimer',
      titleBn: 'দাবিত্যাগ ও বিষয়বস্তু সতর্কতা',
      titleEn: 'Disclaimer',
      icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
      color: 'border-orange-500/30 bg-orange-950/20',
      badge: 'Art 19(1)(a) Creative Freedom'
    },
    {
      slug: 'third-party-services',
      titleBn: 'তৃতীয় পক্ষের পরিষেবা',
      titleEn: 'Third-Party Services',
      icon: <Server className="w-5 h-5 text-sky-400" />,
      color: 'border-sky-500/30 bg-sky-950/20',
      badge: 'Google Firebase & NPCI UPI'
    },
    {
      slug: 'app-permissions',
      titleBn: 'অ্যাপ পারমিশন ও ডেটা ব্যবহার',
      titleEn: 'App Permissions & Data Usage',
      icon: <Smartphone className="w-5 h-5 text-blue-400" />,
      color: 'border-blue-500/30 bg-blue-950/20',
      badge: 'Minimal Privileges Security'
    },
    {
      slug: 'legal-info',
      titleBn: 'আইনি সত্ত্বা ও বিচারিক এখতিয়ার',
      titleEn: 'About / Legal Information',
      icon: <Building className="w-5 h-5 text-yellow-400" />,
      color: 'border-yellow-500/30 bg-yellow-950/20',
      badge: 'Kolkata, WB High Court Seat'
    },
    {
      slug: 'contact',
      titleBn: 'যোগাযোগ ও সহায়তা',
      titleEn: 'Contact Us & Support',
      icon: <Mail className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/30 bg-emerald-950/20',
      badge: 'Direct Admin Inbox SLA'
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
    try {
      const opened = window.open(`/${slug}`, '_blank');
      if (!opened) {
        window.location.href = `/${slug}`;
      }
    } catch {
      window.location.href = `/${slug}`;
    }
  };

  const activeDoc: LegalPolicyDoc = LEGAL_POLICIES_DATA[selectedSlug] || LEGAL_POLICIES_DATA['privacy-policy'];

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
                <span>আইন, নীতি ও ভারতীয় বিধিমালার পেজ ব্যবস্থাপনা</span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  ১৩টি পলিসি সক্রিয়
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                DPDP Act 2023, IT Act 2000, IT Rules 2021 ও Consumer Protection Rules 2020 অনুযায়ী আইনসম্মত পেজসমূহ।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-xs font-mono text-purple-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-pink-400" />
              <span>Kolkata Jurisdiction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of All 13 Legal Policies Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {policyList.map((item) => {
          const isSelected = selectedSlug === item.slug;
          return (
            <div
              key={item.slug}
              onClick={() => setSelectedSlug(item.slug)}
              className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-pink-500/60 bg-gradient-to-br from-purple-950/60 to-pink-950/30 shadow-lg shadow-purple-950/40 scale-[1.01]'
                  : 'border-purple-900/30 bg-[#140b20]/60 hover:border-purple-700/50 hover:bg-[#190e28]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-black/40 border border-purple-900/40">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">
                      {item.titleBn}
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      {item.titleEn}
                    </p>
                  </div>
                </div>

                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border bg-purple-950/40 border-purple-800/40 text-purple-300">
                  {item.badge}
                </span>
              </div>

              <div className="mt-3.5 flex items-center justify-between border-t border-purple-900/30 pt-2.5">
                <span className="text-[10px] font-mono text-zinc-500">
                  /{item.slug}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(item.slug);
                    }}
                    className="p-1.5 rounded-lg bg-black/40 hover:bg-purple-900/40 text-zinc-300 hover:text-white transition-all text-xs flex items-center gap-1 cursor-pointer"
                    title="লিংক কপি করুন"
                  >
                    {copiedSlug === item.slug ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPage(item.slug);
                    }}
                    className="p-1.5 rounded-lg bg-pink-600/20 hover:bg-pink-600/40 text-pink-300 hover:text-white transition-all text-xs flex items-center gap-1 cursor-pointer"
                    title="পাবলিক ভিউ দেখুন"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Policy Document Inspection Box */}
      {activeDoc && (
        <div className="rounded-3xl border border-purple-900/40 bg-[#12091c] p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/30 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  নির্বাচিত প্রিভিউ: {activeDoc.slug}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {activeDoc.complianceBadgeBn}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                {activeDoc.titleBn} ({activeDoc.titleEn})
              </h3>
              <p className="text-xs text-purple-300/80 mt-0.5">
                {activeDoc.shortDescBn}
              </p>
            </div>

            <button
              onClick={() => handleOpenPage(activeDoc.slug)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md cursor-pointer self-start sm:self-auto"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>ইউজার পেজে ওপেন করুন</span>
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
            {activeDoc.sections.map((sec) => (
              <div
                key={sec.id}
                className="p-3.5 rounded-2xl bg-black/30 border border-purple-900/30 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-pink-300">{sec.headingBn}</h4>
                  <span className="text-[10px] font-mono text-zinc-500">{sec.headingEn}</span>
                </div>
                <div className="text-[11px] text-zinc-300 space-y-1 leading-relaxed">
                  {sec.paragraphsBn.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
                {sec.bulletPointsBn && (
                  <ul className="text-[11px] text-zinc-400 space-y-1 pl-4 list-disc pt-1">
                    {sec.bulletPointsBn.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
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
