import React, { useState } from 'react';
import {
  Shield,
  FileText,
  RefreshCcw,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Eye,
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
      titleBn: 'গোপনীয়তা নীতি',
      titleEn: 'Privacy Policy',
      icon: <Shield className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/30 bg-purple-950/20',
      badge: 'DPDP Act 2023 & IT Act 2000'
    },
    {
      slug: 'terms',
      titleBn: 'শর্তাবলী ও নিয়মাবলী',
      titleEn: 'Terms & Conditions',
      icon: <FileText className="w-5 h-5 text-pink-400" />,
      color: 'border-pink-500/30 bg-pink-950/20',
      badge: 'Contract Act 1872 & IT Act'
    },
    {
      slug: 'refund-policy',
      titleBn: 'রিফান্ড ও বাতিলকরণ নীতি',
      titleEn: 'Refund Policy',
      icon: <RefreshCcw className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/30 bg-amber-950/20',
      badge: 'Consumer Protection Rules 2020'
    },
    {
      slug: 'data-deletion',
      titleBn: 'অ্যাকাউন্ট ও ডেটা অপসারণ',
      titleEn: 'Account & Data Deletion',
      icon: <Trash2 className="w-5 h-5 text-rose-400" />,
      color: 'border-rose-500/30 bg-rose-950/20',
      badge: 'DPDP Act Sec 12 Right to Erasure'
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
    window.location.href = `/${slug}`;
  };

  const activeDoc: LegalPolicyDoc | undefined = LEGAL_POLICIES_DATA[selectedSlug] || LEGAL_POLICIES_DATA['privacy-policy'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-purple-900/40 bg-gradient-to-r from-[#170c24] via-[#1b0f2c] to-[#12081c] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>আইনি পলিসি ও কমপ্লায়েন্স ম্যানেজার</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  ৪টি অফিসিয়াল পলিসি
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                DPDP Act 2023, IT Act 2000, IT Rules 2021 ও Consumer Protection Rules 2020 অনুযায়ী সমন্বিত ৪টি মাস্টার পলিসি।
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

      {/* Grid of the 4 Canonical Legal Policy Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
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
                      {item.titleEn}
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      {item.titleBn}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-2.5">
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
                  Active Preview: /{activeDoc.slug}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {activeDoc.complianceBadgeEn}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                {activeDoc.titleEn} ({activeDoc.titleBn})
              </h3>
              <p className="text-xs text-purple-300/80 mt-0.5">
                {activeDoc.shortDescEn}
              </p>
            </div>

            <button
              onClick={() => handleOpenPage(activeDoc.slug)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md cursor-pointer self-start sm:self-auto"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Public Page</span>
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
            {activeDoc.sections.map((sec) => (
              <div
                key={sec.id}
                className="p-3.5 rounded-2xl bg-black/30 border border-purple-900/30 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-pink-300">{sec.heading}</h4>
                  {sec.headingBn && (
                    <span className="text-[10px] font-mono text-zinc-400">{sec.headingBn}</span>
                  )}
                </div>
                <div className="text-[11px] text-zinc-300 space-y-1 leading-relaxed">
                  {sec.paragraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
                {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                  <ul className="text-[11px] text-zinc-400 space-y-1 pl-4 list-disc pt-1">
                    {sec.bulletPoints.map((pt, idx) => (
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
