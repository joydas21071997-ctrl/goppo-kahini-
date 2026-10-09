import React, { useState } from 'react';
import { Globe, Check, Sparkles, BookOpen, Volume2, Compass, ArrowRight, X } from 'lucide-react';
import { AppLanguage, useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';

interface LanguageOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLanguage: (lang: AppLanguage) => void;
  isLight?: boolean;
}

export const LanguageOnboardingModal: React.FC<LanguageOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSelectLanguage,
  isLight = false,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<AppLanguage>(language);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setLanguage(selectedLang);
    onSelectLanguage(selectedLang);
    try {
      localStorage.setItem('gk_has_selected_language_onboarding', 'true');
    } catch {
      // ignore
    }
    onClose();
  };

  const languageCards: Array<{
    code: AppLanguage;
    nativeName: string;
    englishName: string;
    flag: string;
    desc: string;
    badge: string;
    fontClass: string;
  }> = [
    {
      code: 'bn',
      nativeName: 'বাংলা',
      englishName: 'Bengali',
      flag: '🎭',
      desc: t('language_onboarding_bengali_desc', 'বাংলার সেরা রহস্য, ভৌতিক ও রোমাঞ্চকর অডিও কাহিনি'),
      badge: 'সর্বাধিক পছন্দের',
      fontClass: 'font-bengali-title',
    },
    {
      code: 'hi',
      nativeName: 'हिन्दी',
      englishName: 'Hindi',
      flag: '🪔',
      desc: t('language_onboarding_hindi_desc', 'हिन्दी की रोंगटे खड़े कर देने वाली रहस्यमयी और सुकूनदायक कहानियाँ'),
      badge: 'नया संकलन',
      fontClass: 'font-hindi-title',
    },
    {
      code: 'en',
      nativeName: 'English',
      englishName: 'English',
      flag: '🎙️',
      desc: t('language_onboarding_english_desc', 'Classic Victorian thrillers, deep relaxations & global tales'),
      badge: 'All Stories Included',
      fontClass: 'font-english-epic',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 overflow-hidden transition-all transform scale-100 ${
          isLight
            ? 'bg-gradient-to-b from-purple-50 via-white to-purple-100/60 border-purple-200 text-zinc-900 shadow-purple-950/20'
            : 'bg-gradient-to-b from-[#1c122c] via-[#130a1e] to-[#0a0510] border-purple-900/60 text-white shadow-black/80'
        }`}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-36 bg-gradient-to-r from-purple-500/20 via-pink-500/30 to-purple-600/20 blur-3xl pointer-events-none rounded-full" />

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleConfirm}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isLight
              ? 'text-zinc-500 hover:text-zinc-900 hover:bg-purple-100'
              : 'text-zinc-400 hover:text-white hover:bg-purple-900/40'
          }`}
          aria-label="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-purple-500 text-white shadow-lg shadow-purple-900/50 mb-3.5 ring-2 ring-white/10">
            <Globe className="w-7 h-7" />
          </div>
          <h2
            id="lang-modal-title"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif-story"
          >
            {t('language_onboarding_title', 'আপনার পছন্দের ভাষা নির্বাচন করুন')}
          </h2>
          <p
            className={`mt-2 text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${
              isLight ? 'text-zinc-600' : 'text-purple-200/80'
            }`}
          >
            {t(
              'language_onboarding_subtitle',
              'গপ্পো কাহিনীতে স্বাগতম! আপনার পছন্দের ভাষা বেছে নিন, সেই ভাষার অডিও গল্পগুলি আপনাকে আগে দেখানো হবে।'
            )}
          </p>
        </div>

        {/* Language Cards */}
        <div className="space-y-3 mb-6">
          {languageCards.map((item) => {
            const isSelected = selectedLang === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => setSelectedLang(item.code)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between group active:scale-[0.99] ${
                  isSelected
                    ? isLight
                      ? 'border-purple-600 bg-purple-100/90 shadow-md ring-2 ring-purple-500/40 text-purple-950'
                      : 'border-pink-500 bg-gradient-to-r from-purple-950/80 via-pink-950/30 to-[#221035] shadow-lg shadow-pink-950/40 ring-2 ring-pink-500/50 text-white'
                    : isLight
                    ? 'border-purple-200/80 bg-white/80 hover:bg-purple-50 hover:border-purple-400 text-zinc-800'
                    : 'border-purple-900/40 bg-[#160d23]/70 hover:bg-[#201332] hover:border-purple-500/60 text-zinc-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="text-2xl pt-0.5 select-none">{item.flag}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg sm:text-xl font-bold ${item.fontClass}`}>
                        {item.nativeName}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          isSelected
                            ? isLight
                              ? 'bg-purple-200 text-purple-900'
                              : 'bg-pink-500/25 text-pink-300 border border-pink-500/30'
                            : isLight
                            ? 'bg-purple-100 text-zinc-600'
                            : 'bg-purple-900/40 text-purple-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <p
                      className={`text-xs sm:text-[13px] mt-1 leading-snug ${
                        isSelected
                          ? isLight
                            ? 'text-purple-900'
                            : 'text-pink-100'
                          : isLight
                          ? 'text-zinc-600'
                          : 'text-zinc-400'
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ml-2 transition-all ${
                    isSelected
                      ? isLight
                        ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                        : 'border-pink-500 bg-pink-500 text-white shadow-md shadow-pink-500/50'
                      : isLight
                      ? 'border-zinc-300 bg-transparent'
                      : 'border-purple-800 bg-transparent'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirm Button */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-pink-950/50 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <span>{t('language_onboarding_confirm', 'পছন্দ নিশ্চিত করে শুরু করুন')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footnote note */}
        <p
          className={`text-[11px] text-center mt-3.5 ${
            isLight ? 'text-zinc-500' : 'text-zinc-500'
          }`}
        >
          {t(
            'language_footnote',
            'আপনি যেকোনো সময় অ্যাপের উপরের ভাষা মেনু থেকে এটি পরিবর্তন করতে পারবেন।'
          )}
        </p>
      </div>
    </div>
  );
};
