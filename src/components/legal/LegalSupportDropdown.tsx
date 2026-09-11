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

interface LegalSupportDropdownProps {
  onSelectPolicy: (slug: LegalPolicySlug) => void;
  variant?: 'footer-dropdown' | 'drawer-accordion';
  className?: string;
  onItemClick?: () => void;
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
  onItemClick
}) => {
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
      <div className={`rounded-2xl border border-purple-900/40 bg-[#160e22] overflow-hidden transition-all ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3.5 min-h-[44px] text-xs text-left text-zinc-200 hover:bg-[#201533] transition-colors"
          aria-expanded={isOpen}
          aria-label="আইন ও সহায়তা মেনু"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300">
              <Scale className="h-4 w-4 text-purple-300" />
            </div>
            <div>
              <span className="font-bold text-white block">আইন ও সহায়তা</span>
              <span className="text-[10px] text-zinc-400 block">গোপনীয়তা, শর্তাবলী, রিফান্ড ও যোগাযোগ</span>
            </div>
          </div>

          <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-pink-400' : 'text-zinc-500'}`}>
            <ChevronDown className="h-4 w-4" />
          </div>
        </button>

        {isOpen && (
          <div className="border-t border-purple-900/40 p-2 space-y-1 bg-[#130b1c]/80 animate-fadeIn">
            {LEGAL_MENU_ITEMS.map((item) => (
              <button
                key={item.slug}
                onClick={() => handleItemSelect(item.slug)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 min-h-[44px] text-xs text-zinc-300 hover:bg-[#221634] hover:text-white transition-all group active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/40 border border-purple-900/30">
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <span className="font-medium block leading-tight">{item.titleBn}</span>
                    <span className="text-[9px] text-zinc-500 block leading-tight">{item.titleEn}</span>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500 group-hover:text-pink-400 font-mono">→</span>
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
        className="inline-flex items-center gap-1.5 rounded-full border border-purple-900/40 bg-[#170e24] hover:bg-[#221435] hover:border-pink-500/40 px-3 py-1.5 min-h-[36px] sm:min-h-[32px] text-[11px] font-medium text-zinc-300 hover:text-white transition-all shadow-sm active:scale-95"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="আইন ও সহায়তা মেনু খুলুন"
      >
        <Scale className="h-3 w-3 text-purple-400 shrink-0" />
        <span>আইন ও সহায়তা</span>
        <ChevronDown
          className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-pink-400' : ''
          }`}
        />
      </button>

      {/* Upward Floating Popover for Footer */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 w-56 rounded-2xl border border-purple-900/50 bg-[#160b24]/95 backdrop-blur-md p-1.5 shadow-xl shadow-purple-950/60 z-50 animate-fadeIn">
          <div className="px-2.5 py-1.5 border-b border-purple-900/30 mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              আইন ও সাপোর্ট
            </span>
            <span className="text-[9px] text-pink-400/80 font-mono">Legal & Support</span>
          </div>

          <div className="space-y-0.5">
            {LEGAL_MENU_ITEMS.map((item) => (
              <button
                key={item.slug}
                onClick={() => handleItemSelect(item.slug)}
                className="w-full flex items-center justify-between rounded-xl px-2.5 py-2 min-h-[42px] text-left text-xs text-zinc-300 hover:bg-purple-900/40 hover:text-white transition-all group active:bg-purple-800/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-black/40 shrink-0">
                    {item.icon}
                  </div>
                  <div className="truncate">
                    <p className="text-[11px] font-medium text-zinc-200 group-hover:text-white truncate">
                      {item.titleBn}
                    </p>
                    <p className="text-[9px] text-zinc-500 truncate">
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
