import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, AppLanguage } from '../context/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'buttons' | 'compact-pill';
  isLight?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'compact-pill',
  isLight = false,
}) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const currentOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  if (variant === 'buttons') {
    return (
      <div className="grid grid-cols-3 gap-2">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                isSelected
                  ? isLight
                    ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-500/30 shadow-xs font-bold'
                    : 'border-pink-500 bg-pink-500/20 text-white ring-2 ring-pink-500/40 shadow-xs font-bold'
                  : isLight
                  ? 'border-purple-200 bg-white text-zinc-700 hover:bg-purple-50/60'
                  : 'border-purple-900/40 bg-black/40 text-zinc-300 hover:border-purple-500/50 hover:bg-[#201435]'
              }`}
            >
              <span className="text-xs font-bold leading-tight">{lang.nativeLabel}</span>
              <span className={`text-[10px] mt-0.5 ${isSelected ? 'opacity-90' : 'text-zinc-500'}`}>
                {lang.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default compact-pill dropdown for Header / Navbar
  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="অ্যাপের ভাষা পরিবর্তন করুন"
        title="ভাষা পরিবর্তন / Select Language / भाषा चुनें"
        className={`flex items-center gap-1 sm:gap-1.5 h-8 sm:h-9 px-2 sm:px-2.5 rounded-lg sm:rounded-xl border transition-all active:scale-95 shrink-0 ${
          isLight
            ? 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 shadow-xs'
            : 'border-purple-900/40 bg-[#181224] hover:bg-[#201830] text-purple-200 hover:border-pink-500/40'
        }`}
      >
        <Globe className="h-3.5 w-3.5 text-pink-500 shrink-0" />
        <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap">
          {currentOption.nativeLabel}
        </span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 opacity-70 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-1.5 w-36 rounded-xl border p-1 shadow-xl z-50 animate-fadeIn ${
            isLight
              ? 'border-purple-200 bg-white/98 text-zinc-900 shadow-purple-950/10'
              : 'border-purple-900/60 bg-[#160f22]/98 text-white shadow-black/80'
          }`}
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  isSelected
                    ? isLight
                      ? 'bg-purple-100/80 font-bold text-purple-950'
                      : 'bg-pink-500/25 font-bold text-pink-300'
                    : isLight
                    ? 'hover:bg-purple-50 text-zinc-700'
                    : 'hover:bg-purple-900/30 text-zinc-300'
                }`}
              >
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-semibold">{lang.nativeLabel}</span>
                  <span className="text-[9px] opacity-70">{lang.label}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-pink-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
