import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Shield,
  FileText,
  RefreshCcw,
  AlertTriangle,
  Mail,
  Scale
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
  icon: React.ReactNode;
}[] = [
  {
    slug: 'contact',
    titleBn: 'যোগাযোগ ও সহায়তা',
    titleEn: 'Contact Us',
    icon: <Mail className="h-3.5 w-3.5 text-emerald-400" />
  },
  {
    slug: 'privacy-policy',
    titleBn: 'গোপনীয়তা নীতি',
    titleEn: 'Privacy Policy',
    icon: <Shield className="h-3.5 w-3.5 text-purple-400" />
  },
  {
    slug: 'terms',
    titleBn: 'শর্তাবলী ও নিয়মাবলী',
    titleEn: 'Terms & Conditions',
    icon: <FileText className="h-3.5 w-3.5 text-pink-400" />
  },
  {
    slug: 'refund-policy',
    titleBn: 'রিফান্ড ও বাতিল নীতি',
    titleEn: 'Refund Policy',
    icon: <RefreshCcw className="h-3.5 w-3.5 text-amber-400" />
  },
  {
    slug: 'disclaimer',
    titleBn: 'দাবিত্যাগ',
    titleEn: 'Disclaimer',
    icon: <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
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
          className={`w-full flex items-center justify-between p-3.5 min-h-[44px] text-xs text-left transition-colors ${
            isLight
              ? 'text-zinc-800 hover:bg-purple-50/70'
              : 'text-zinc-200 hover:bg-[#201533]'
          }`}
          aria-expanded={isOpen}
          aria-label="আইন ও সহায়তা মেনু"
        >
          <div className="flex items-center gap-2.5">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-300'
            }`}>
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <span className={`font-bold block ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                আইন ও সহায়তা
              </span>
              <span className={`text-[10px] block ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                গোপনীয়তা, শর্তাবলী, রিফান্ড ও যোগাযোগ
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
          <div className={`border-t p-2 space-y-1 animate-fadeIn ${
            isLight ? 'border-purple-100 bg-purple-50/40' : 'border-purple-900/40 bg-[#130b1c]/80'
          }`}>
            {LEGAL_MENU_ITEMS.map((item) => (
              <button
                key={item.slug}
                onClick={() => handleItemSelect(item.slug)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 min-h-[44px] text-xs transition-all group active:scale-[0.99] ${
                  isLight
                    ? 'text-zinc-700 hover:bg-purple-100/70 hover:text-purple-950'
                    : 'text-zinc-300 hover:bg-[#221634] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-lg border ${
                    isLight ? 'bg-white border-purple-200' : 'bg-black/40 border-purple-900/30'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <span className="font-medium block leading-tight">{item.titleBn}</span>
                    <span className={`text-[9px] block leading-tight ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {item.titleEn}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-mono ${isLight ? 'text-purple-400 group-hover:text-purple-700' : 'text-zinc-500 group-hover:text-pink-400'}`}>
                  →
                </span>
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
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 min-h-[36px] sm:min-h-[32px] text-[11px] font-medium transition-all shadow-sm active:scale-95 ${
          isLight
            ? 'border-purple-200 bg-white hover:bg-purple-50 hover:border-purple-300 text-zinc-700 hover:text-purple-900'
            : 'border-purple-900/40 bg-[#170e24] hover:bg-[#221435] hover:border-pink-500/40 text-zinc-300 hover:text-white'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="আইন ও সহায়তা মেনু খুলুন"
      >
        <Scale className={`h-3 w-3 shrink-0 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
        <span>আইন ও সহায়তা</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${
            isOpen ? (isLight ? 'rotate-180 text-purple-600' : 'rotate-180 text-pink-400') : 'text-zinc-400'
          }`}
        />
      </button>

      {/* Upward Floating Popover for Footer */}
      {isOpen && (
        <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 w-56 rounded-2xl border p-1.5 shadow-xl z-50 animate-fadeIn ${
          isLight
            ? 'border-purple-200 bg-white/95 backdrop-blur-md shadow-purple-200/50'
            : 'border-purple-900/50 bg-[#160b24]/95 backdrop-blur-md shadow-purple-950/60'
        }`}>
          <div className={`px-2.5 py-1.5 border-b mb-1 flex items-center justify-between ${
            isLight ? 'border-purple-100' : 'border-purple-900/30'
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              isLight ? 'text-zinc-600' : 'text-zinc-400'
            }`}>
              আইন ও সাপোর্ট
            </span>
            <span className={`text-[9px] font-mono ${
              isLight ? 'text-purple-600' : 'text-pink-400/80'
            }`}>
              Legal & Support
            </span>
          </div>

          <div className="space-y-0.5">
            {LEGAL_MENU_ITEMS.map((item) => (
              <button
                key={item.slug}
                onClick={() => handleItemSelect(item.slug)}
                className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 min-h-[42px] text-left text-xs transition-all group ${
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
                  <div className="truncate">
                    <p className={`text-[11px] font-medium truncate ${
                      isLight ? 'text-zinc-800 group-hover:text-purple-900' : 'text-zinc-200 group-hover:text-white'
                    }`}>
                      {item.titleBn}
                    </p>
                    <p className={`text-[9px] truncate ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {item.titleEn}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
