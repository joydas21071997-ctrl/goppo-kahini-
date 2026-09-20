import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Shield,
  FileText,
  RefreshCcw,
  AlertTriangle,
  Mail,
  Scale,
  Trash2,
  CreditCard,
  Users,
  ShieldAlert,
  Server,
  Smartphone,
  Building
} from 'lucide-react';
import { LegalPolicySlug } from '../../data/legalPolicies';
import { ThemeMode } from '../../types';

interface LegalSupportDropdownProps {
  onSelectPolicy: (slug: LegalPolicySlug) => void;
  variant?: 'footer-dropdown' | 'drawer-accordion';
  className?: string;
  onItemClick?: () => void;
  theme?: ThemeMode;
}

export const LEGAL_MENU_ITEMS: {
  slug: LegalPolicySlug;
  titleBn: string;
  titleEn: string;
  badgeBn: string;
  icon: React.ReactNode;
}[] = [
  {
    slug: 'privacy-policy',
    titleBn: 'গোপনীয়তা নীতি',
    titleEn: 'Privacy Policy',
    badgeBn: 'DPDP Act 2023',
    icon: <Shield className="h-3.5 w-3.5 text-purple-400" />
  },
  {
    slug: 'terms',
    titleBn: 'শর্তাবলী ও নিয়মাবলী',
    titleEn: 'Terms & Conditions',
    badgeBn: 'Contract Act 1872',
    icon: <FileText className="h-3.5 w-3.5 text-pink-400" />
  },
  {
    slug: 'data-deletion',
    titleBn: 'অ্যাকাউন্ট ও ডেটা অপসারণ',
    titleEn: 'Account & Data Deletion',
    badgeBn: 'Right to Erasure',
    icon: <Trash2 className="h-3.5 w-3.5 text-rose-400" />
  },
  {
    slug: 'grievance',
    titleBn: 'অভিযোগ ও নোডাল অফিসার',
    titleEn: 'Grievance / Privacy Contact',
    badgeBn: 'IT Rules 2021',
    icon: <Scale className="h-3.5 w-3.5 text-indigo-400" />
  },
  {
    slug: 'refund-policy',
    titleBn: 'রিফান্ড ও বাতিলকরণ নীতি',
    titleEn: 'Refund & Cancellation Policy',
    badgeBn: 'E-Commerce Rules',
    icon: <RefreshCcw className="h-3.5 w-3.5 text-amber-400" />
  },
  {
    slug: 'subscription-terms',
    titleBn: 'সাবস্ক্রিপশন ও ২০ টাকা পাস',
    titleEn: 'Subscription Terms',
    badgeBn: 'RBI Non-AutoDebit',
    icon: <CreditCard className="h-3.5 w-3.5 text-cyan-400" />
  },
  {
    slug: 'community-guidelines',
    titleBn: 'কমিউনিটি ও মন্তব্য নীতি',
    titleEn: 'Community Guidelines',
    badgeBn: 'IT Rules 3(1)(b)',
    icon: <Users className="h-3.5 w-3.5 text-teal-400" />
  },
  {
    slug: 'copyright-policy',
    titleBn: 'কপিরাইট ও স্বত্বাধিকার',
    titleEn: 'Copyright Policy',
    badgeBn: 'Copyright Act 1957',
    icon: <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
  },
  {
    slug: 'disclaimer',
    titleBn: 'দাবিত্যাগ ও বিষয়বস্তু সতর্কতা',
    titleEn: 'Disclaimer',
    badgeBn: 'Art 19(1)(a)',
    icon: <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
  },
  {
    slug: 'third-party-services',
    titleBn: 'তৃতীয় পক্ষের পরিষেবা',
    titleEn: 'Third-Party Services',
    badgeBn: 'Google & UPI Infra',
    icon: <Server className="h-3.5 w-3.5 text-sky-400" />
  },
  {
    slug: 'app-permissions',
    titleBn: 'অ্যাপ পারমিশন ও ডেটা ব্যবহার',
    titleEn: 'App Permissions & Data Usage',
    badgeBn: 'Minimal Permissions',
    icon: <Smartphone className="h-3.5 w-3.5 text-blue-400" />
  },
  {
    slug: 'legal-info',
    titleBn: 'আইনি সত্ত্বা ও বিচারিক এখতিয়ার',
    titleEn: 'About / Legal Information',
    badgeBn: 'Kolkata Jurisdiction',
    icon: <Building className="h-3.5 w-3.5 text-yellow-400" />
  },
  {
    slug: 'contact',
    titleBn: 'যোগাযোগ ও সহায়তা',
    titleEn: 'Contact Us & Support',
    badgeBn: 'Direct Inbox',
    icon: <Mail className="h-3.5 w-3.5 text-emerald-400" />
  }
];

export const LegalSupportDropdown: React.FC<LegalSupportDropdownProps> = ({
  onSelectPolicy,
  variant = 'footer-dropdown',
  className = '',
  onItemClick,
  theme = 'purple-light',
}) => {
  const isLight = theme === 'purple-light' || theme === 'calm-green';
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside (only for floating dropdown mode)
  useEffect(() => {
    if (variant !== 'footer-dropdown' || !isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, variant]);

  const handleItemSelect = (slug: LegalPolicySlug) => {
    onSelectPolicy(slug);
    setIsOpen(false);
    if (onItemClick) onItemClick();
  };

  // Drawer Accordion Variant (Integrated smoothly inside mobile drawer menu)
  if (variant === 'drawer-accordion') {
    return (
      <div className={`rounded-2xl border overflow-hidden transition-all ${
        isLight
          ? 'border-purple-200 bg-white shadow-sm'
          : 'border-purple-900/40 bg-[#160e22]'
      } ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between p-3.5 min-h-[44px] text-xs text-left transition-colors cursor-pointer ${
            isLight
              ? 'text-zinc-800 hover:bg-purple-50/70'
              : 'text-zinc-200 hover:bg-[#201533]'
          }`}
          aria-expanded={isOpen}
          aria-label="আইন ও সহায়তা মেনু"
        >
          <div className="flex items-center gap-2.5">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${
              isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-300'
            }`}>
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-bold block ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  আইন ও সহায়তা
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono bg-pink-500/20 text-pink-400 font-semibold">
                  ১২+ পলিসি
                </span>
              </div>
              <span className={`text-[10px] block ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                ভারতীয় ডিজিটাল ও সাংবিধানিক আইন অনুপালন
              </span>
            </div>
          </div>

          <div className={`transition-transform duration-200 ${
            isOpen ? (isLight ? 'rotate-180 text-purple-600' : 'rotate-180 text-pink-400') : 'text-zinc-400'
          }`}>
            <ChevronDown className="h-4 w-4" />
          </div>
        </button>

        {isOpen && (
          <div className={`border-t p-2 space-y-1 animate-fadeIn max-h-[380px] overflow-y-auto scrollbar-thin ${
            isLight ? 'border-purple-100 bg-purple-50/40' : 'border-purple-900/40 bg-[#130b1c]/80'
          }`}>
            {LEGAL_MENU_ITEMS.map((item) => (
              <button
                key={item.slug}
                onClick={() => handleItemSelect(item.slug)}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 min-h-[44px] text-xs transition-all group active:scale-[0.99] cursor-pointer ${
                  isLight
                    ? 'text-zinc-700 hover:bg-purple-100/70 hover:text-purple-950'
                    : 'text-zinc-300 hover:bg-[#221634] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-lg border shrink-0 ${
                    isLight ? 'bg-white border-purple-200' : 'bg-black/40 border-purple-900/30'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="text-left min-w-0">
                    <span className="font-medium block leading-tight truncate">{item.titleBn}</span>
                    <span className={`text-[9px] block leading-tight font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {item.titleEn}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border hidden sm:inline-block ${
                    isLight ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-purple-950/40 border-purple-800/40 text-purple-300'
                  }`}>
                    {item.badgeBn}
                  </span>
                  <span className={`text-[11px] font-mono ${isLight ? 'text-purple-400 group-hover:text-purple-700' : 'text-zinc-500 group-hover:text-pink-400'}`}>
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Footer Dropdown Variant (Compact, touch-friendly, pops upward cleanly)
  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 min-h-[36px] sm:min-h-[32px] text-[11px] font-medium transition-all shadow-sm active:scale-95 cursor-pointer ${
          isLight
            ? 'border-purple-200 bg-white hover:bg-purple-50 hover:border-purple-300 text-zinc-700 hover:text-purple-900'
            : 'border-purple-900/40 bg-[#170e24] hover:bg-[#221435] hover:border-pink-500/40 text-zinc-300 hover:text-white'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="আইন ও সহায়তা মেনু খুলুন"
      >
        <Scale className={`h-3 w-3 shrink-0 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
        <span>আইন ও নীতিমালা</span>
        <span className="text-[9px] px-1 py-0.2 rounded-full font-mono bg-pink-500/20 text-pink-400 font-semibold">
          ১২+
        </span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${
            isOpen ? (isLight ? 'rotate-180 text-purple-600' : 'rotate-180 text-pink-400') : 'text-zinc-400'
          }`}
        />
      </button>

      {/* Upward Floating Popover for Footer */}
      {isOpen && (
        <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 w-72 rounded-2xl border p-2 shadow-2xl z-50 animate-fadeIn ${
          isLight
            ? 'border-purple-200 bg-white/98 backdrop-blur-md shadow-purple-200/60'
            : 'border-purple-900/60 bg-[#150a22]/98 backdrop-blur-md shadow-purple-950/80'
        }`}>
          <div className={`px-2.5 py-1.5 border-b mb-1.5 flex items-center justify-between ${
            isLight ? 'border-purple-100' : 'border-purple-900/30'
          }`}>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                isLight ? 'text-zinc-700' : 'text-zinc-300'
              }`}>
                আইন ও ভারতীয় বিধিমালার পেজ
              </span>
              <span className={`text-[9px] block ${isLight ? 'text-purple-600' : 'text-pink-400/80'}`}>
                Indian Legal & Regulatory Compliances
              </span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
              Legal
            </span>
          </div>

          <div className="space-y-0.5 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
            {LEGAL_MENU_ITEMS.map((item) => (
              <button
                key={item.slug}
                onClick={() => handleItemSelect(item.slug)}
                className={`w-full flex items-center justify-between rounded-xl px-2 py-1.5 min-h-[40px] text-left text-xs transition-all group cursor-pointer ${
                  isLight
                    ? 'text-zinc-700 hover:bg-purple-50 hover:text-purple-950 active:bg-purple-100'
                    : 'text-zinc-300 hover:bg-purple-900/40 hover:text-white active:bg-purple-800/50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-md shrink-0 ${
                    isLight ? 'bg-purple-100 text-purple-700' : 'bg-black/40'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="truncate min-w-0">
                    <p className={`text-[11px] font-medium truncate ${
                      isLight ? 'text-zinc-800 group-hover:text-purple-900' : 'text-zinc-200 group-hover:text-white'
                    }`}>
                      {item.titleBn}
                    </p>
                    <p className={`text-[9px] truncate font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {item.titleEn}
                    </p>
                  </div>
                </div>
                <span className={`text-[8px] font-mono px-1 rounded shrink-0 ${
                  isLight ? 'bg-purple-100 text-purple-800' : 'bg-purple-950/60 text-pink-300'
                }`}>
                  {item.badgeBn}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
