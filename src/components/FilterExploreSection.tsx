import React, { useState } from 'react';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  Gift,
  Crown,
  Clock,
  Layers,
  LayoutGrid,
  Grid3X3,
  ChevronDown,
  Flame,
  Star,
  Compass,
  Check
} from 'lucide-react';
import { StoryGenre } from '../types';
import { useLanguage } from '../context/LanguageContext';

export type SortOption = 'trending' | 'popular' | 'rating' | 'latest';

interface FilterExploreSectionProps {
  selectedGenre: StoryGenre;
  onSelectGenre: (genre: StoryGenre) => void;
  selectedLengthCategory: 'all' | 'mini' | 'medium' | 'mega';
  onSelectLengthCategory: (cat: 'all' | 'mini' | 'medium' | 'mega') => void;
  accessFilter: 'all' | 'free' | 'little_pass';
  onSelectAccessFilter: (access: 'all' | 'free' | 'little_pass') => void;
  sortBy: SortOption;
  onSelectSortBy: (sort: SortOption) => void;
  activeFilterCount: number;
  onResetAll: () => void;
  catalogViewMode: 'sectors' | 'grid';
  onSelectCatalogViewMode: (mode: 'sectors' | 'grid') => void;
  gridDensity: 'normal' | 'compact';
  onSelectGridDensity: (density: 'normal' | 'compact') => void;
  isLight: boolean;
  totalStoryCount: number;
  matchingStoryCount: number;
  selectedLanguageFilter?: 'all' | 'bn' | 'hi' | 'en';
  onSelectLanguageFilter?: (lang: 'all' | 'bn' | 'hi' | 'en') => void;
  onQuickTabSelect?: (tabKey: string) => void;
  activeQuickTab?: string;
}

export const FilterExploreSection: React.FC<FilterExploreSectionProps> = ({
  selectedGenre,
  onSelectGenre,
  selectedLengthCategory,
  onSelectLengthCategory,
  accessFilter,
  onSelectAccessFilter,
  sortBy,
  onSelectSortBy,
  activeFilterCount,
  onResetAll,
  catalogViewMode,
  onSelectCatalogViewMode,
  gridDensity,
  onSelectGridDensity,
  isLight,
  totalStoryCount,
  matchingStoryCount,
  selectedLanguageFilter = 'all',
  onSelectLanguageFilter,
}) => {
  const { t } = useLanguage();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const genres: { label: string; value: StoryGenre }[] = [
    { label: t('genre_all', 'সব ধারা'), value: 'All' },
    { label: t('genre_thriller', 'রোমাঞ্চ ও থ্রিলার'), value: 'রোমাঞ্চ ও থ্রিলার' },
    { label: t('genre_horror', 'ভৌতিক ও অলৌকিক'), value: 'ভৌতিক ও অলৌকিক' },
    { label: t('genre_mystery', 'রহস্য ও গোয়েন্দা'), value: 'রহস্য ও গোয়েন্দা' },
    { label: t('genre_sleep', 'ঘুমের গল্প ও প্রশান্তি'), value: 'ঘুমের গল্প ও প্রশান্তি' },
    { label: t('genre_folklore', 'ঐতিহাসিক ও লোকগাথা'), value: 'ঐতিহাসিক ও লোকগাথা' },
    { label: t('genre_romance', 'বাস্তব ও রূপকথা'), value: 'বাস্তব ও রূপকথা' },
  ];

  const durationOptions: {
    label: string;
    sub: string;
    value: 'all' | 'mini' | 'medium' | 'mega';
  }[] = [
    { label: t('dur_all', 'সব দৈর্ঘ্য'), sub: t('dur_all_sub', 'সকল গল্প'), value: 'all' },
    { label: t('dur_mini', 'ছোট গল্প'), sub: t('dur_mini_sub', '< ১০ মিনিট'), value: 'mini' },
    { label: t('dur_medium', 'মাঝারি গল্প'), sub: t('dur_medium_sub', '১০ - ২৫ মিনিট'), value: 'medium' },
    { label: t('dur_mega', 'মেগা গল্প'), sub: t('dur_mega_sub', '২৫+ মিনিট'), value: 'mega' },
  ];

  // Quick horizontal tabs for top-level exploration
  const quickTabs = [
    { id: 'all', label: t('tab_all_stories', 'সব গল্প') },
    { id: 'free', label: t('tab_free', 'ফ্রি গল্প'), icon: Gift },
    { id: 'popular', label: t('tab_popular', 'জনপ্রিয়'), icon: Flame },
    { id: 'horror', label: t('tab_horror', 'ভৌতিক') },
    { id: 'thriller', label: t('tab_thriller', 'রোমাঞ্চ') },
    { id: 'mystery', label: t('tab_mystery', 'রহস্য') },
    { id: 'sleep', label: t('tab_sleep', 'ঘুমের গল্প') },
  ];

  const handleQuickTabClick = (tabId: string) => {
    if (tabId === 'all') {
      onResetAll();
    } else if (tabId === 'free') {
      onSelectAccessFilter('free');
      if (selectedGenre !== 'All') onSelectGenre('All');
    } else if (tabId === 'popular') {
      onSelectSortBy('popular');
      if (accessFilter !== 'all') onSelectAccessFilter('all');
    } else if (tabId === 'horror') {
      onSelectGenre('ভৌতিক ও অলৌকিক');
    } else if (tabId === 'thriller') {
      onSelectGenre('রোমাঞ্চ ও থ্রিলার');
    } else if (tabId === 'mystery') {
      onSelectGenre('রহস্য ও গোয়েন্দা');
    } else if (tabId === 'sleep') {
      onSelectGenre('ঘুমের গল্প ও প্রশান্তি');
    }
  };

  const isTabActive = (tabId: string) => {
    if (tabId === 'all') {
      return (
        selectedGenre === 'All' &&
        accessFilter === 'all' &&
        selectedLengthCategory === 'all' &&
        sortBy === 'trending'
      );
    }
    if (tabId === 'free') return accessFilter === 'free';
    if (tabId === 'popular') return sortBy === 'popular';
    if (tabId === 'horror') return selectedGenre === 'ভৌতিক ও অলৌকিক';
    if (tabId === 'thriller') return selectedGenre === 'রোমাঞ্চ ও থ্রিলার';
    if (tabId === 'mystery') return selectedGenre === 'রহস্য ও গোয়েন্দা';
    if (tabId === 'sleep') return selectedGenre === 'ঘুমের গল্প ও প্রশান্তি';
    return false;
  };

  return (
    <div className="mb-4">
      {/* Sleek Minimalist Exploration Bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Language Quick Filter Pills */}
        {onSelectLanguageFilter && (
          <div className={`flex items-center gap-0.5 shrink-0 p-1 rounded-full border transition-all ${
            isLight
              ? 'bg-purple-50 border-purple-200'
              : 'bg-[#150d22] border-purple-900/50'
          }`}>
            {(
              [
                { id: 'all', label: 'All', title: t('language_filter_all', 'সব ভাষার গল্প') },
                { id: 'bn', label: 'বাংলা', title: t('language_filter_bn', 'বাংলা গল্প') },
                { id: 'hi', label: 'हिन्दी', title: t('language_filter_hi', 'हिन्दी कहानियाँ') },
                { id: 'en', label: 'EN', title: t('language_filter_en', 'English Stories') },
              ] as const
            ).map((l) => {
              const active = selectedLanguageFilter === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onSelectLanguageFilter(l.id)}
                  title={l.title}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all active:scale-95 ${
                    active
                      ? isLight
                        ? 'bg-purple-900 text-white shadow-xs'
                        : 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-xs'
                      : isLight
                      ? 'text-zinc-600 hover:text-zinc-900 hover:bg-purple-100/60'
                      : 'text-zinc-400 hover:text-white hover:bg-purple-900/30'
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Quick Horizon Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
          {quickTabs.map((tab) => {
            const active = isTabActive(tab.id);
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleQuickTabClick(tab.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 active:scale-95 ${
                  active
                    ? isLight
                      ? 'bg-purple-900 text-white shadow-xs font-semibold'
                      : 'bg-white text-zinc-950 shadow-xs font-bold'
                    : isLight
                    ? 'bg-purple-50/80 border border-purple-200/70 text-zinc-700 hover:bg-purple-100 hover:text-zinc-900'
                    : 'bg-[#181124] border border-purple-900/40 text-zinc-300 hover:bg-[#221634] hover:text-white'
                }`}
              >
                {Icon && <Icon className={`h-3 w-3 ${active ? 'fill-current' : ''}`} />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Action: Filter/Explore Modal Trigger + View Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Main Filter & Explore Button */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all active:scale-95 ${
              activeFilterCount > 0 || isDrawerOpen
                ? isLight
                  ? 'border-purple-600 bg-purple-100 text-purple-950 shadow-xs'
                  : 'border-pink-500 bg-pink-500/20 text-pink-300 shadow-xs'
                : isLight
                ? 'border-purple-200 bg-white text-zinc-700 hover:bg-purple-50'
                : 'border-purple-900/50 bg-[#181124] text-zinc-300 hover:text-white hover:border-pink-500/40'
            }`}
            aria-label={t('filter_explore', 'ফিল্টার ও এক্সপ্লোর')}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">{t('filter_btn', 'ফিল্টার')}</span>
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown
              className={`h-3 w-3 transition-transform duration-200 ${
                isDrawerOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* View mode toggle (Sector vs Grid) */}
          <div
            className={`hidden sm:flex items-center rounded-full p-0.5 border ${
              isLight ? 'border-purple-200 bg-purple-50/70' : 'border-purple-900/40 bg-[#140e20]'
            }`}
          >
            <button
              onClick={() => onSelectCatalogViewMode('sectors')}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                catalogViewMode === 'sectors'
                  ? isLight
                    ? 'bg-white text-purple-950 font-bold shadow-xs'
                    : 'bg-purple-900/80 text-white font-bold'
                  : isLight
                  ? 'text-zinc-600 hover:text-purple-950'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title={t('view_layout_sectors', 'সেক্টর')}
            >
              <Layers className="h-3 w-3" />
              <span className="text-[10px]">{t('view_layout_sectors', 'সেক্টর')}</span>
            </button>
            <button
              onClick={() => onSelectCatalogViewMode('grid')}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
                catalogViewMode === 'grid'
                  ? isLight
                    ? 'bg-white text-purple-950 font-bold shadow-xs'
                    : 'bg-purple-900/80 text-white font-bold'
                  : isLight
                  ? 'text-zinc-600 hover:text-purple-950'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title={t('view_layout_grid', 'গ্রিড')}
            >
              <LayoutGrid className="h-3 w-3" />
              <span className="text-[10px]">{t('view_layout_grid', 'গ্রিড')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Filter & Explore Panel */}
      {isDrawerOpen && (
        <div
          className={`mt-2.5 rounded-2xl border p-4 sm:p-5 shadow-xl transition-all animate-fadeIn ${
            isLight
              ? 'border-purple-200 bg-white/98 text-zinc-900 shadow-purple-950/5'
              : 'border-purple-900/60 bg-[#160f22]/98 text-zinc-100 shadow-black/60'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-3 mb-4 border-purple-150 dark:border-purple-900/40">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-pink-500" />
              <h3 className="text-xs sm:text-sm font-bold">{t('filter_explore', 'ফিল্টার ও এক্সপ্লোর')}</h3>
              <span
                className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}
              >
                ({matchingStoryCount} {t('stories_found', 'টি গল্প')})
              </span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className={`p-1 rounded-lg transition-colors ${
                isLight ? 'hover:bg-purple-100 text-zinc-600' : 'hover:bg-purple-900/40 text-zinc-400'
              }`}
              aria-label={t('close', 'বন্ধ করুন')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 0. Story Language */}
            {onSelectLanguageFilter && (
              <div className="sm:col-span-2 lg:col-span-4 pb-3 border-b border-purple-500/20">
                <span
                  className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${
                    isLight ? 'text-purple-900' : 'text-purple-300'
                  }`}
                >
                  {t('language_filter_title', 'গল্পের ভাষা')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: 'all', label: t('language_filter_all', 'সব ভাষার গল্প'), flag: '🌐' },
                      { id: 'bn', label: 'বাংলা গল্প (Bengali)', flag: '🎭' },
                      { id: 'hi', label: 'हिन्दी कहानियाँ (Hindi)', flag: '🪔' },
                      { id: 'en', label: 'English Stories', flag: '🎙️' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectLanguageFilter(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedLanguageFilter === item.id
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : isLight
                          ? 'bg-purple-50 text-zinc-700 hover:bg-purple-100'
                          : 'bg-[#1e152d] text-zinc-300 hover:text-white'
                      }`}
                    >
                      <span>{item.flag}</span>
                      <span>{item.label}</span>
                      {selectedLanguageFilter === item.id && <Check className="h-3 w-3 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 1. Genre / Category */}
            <div>
              <span
                className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${
                  isLight ? 'text-purple-900' : 'text-purple-300'
                }`}
              >
                {t('genre_heading', 'জনরা / বিষয়')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {genres.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => onSelectGenre(g.value)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      selectedGenre === g.value
                        ? 'bg-purple-600 text-white font-bold shadow-xs'
                        : isLight
                        ? 'bg-purple-50 text-zinc-700 hover:bg-purple-100'
                        : 'bg-[#1e152d] text-zinc-300 hover:text-white'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Access Type */}
            <div>
              <span
                className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${
                  isLight ? 'text-purple-900' : 'text-purple-300'
                }`}
              >
                {t('access_heading', 'গল্পের ধরন')}
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => onSelectAccessFilter('all')}
                  className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    accessFilter === 'all'
                      ? 'bg-purple-600 text-white font-bold'
                      : isLight
                      ? 'bg-purple-50 text-zinc-700 hover:bg-purple-100'
                      : 'bg-[#1e152d] text-zinc-300 hover:text-white'
                  }`}
                >
                  <span>{t('access_all', 'সব গল্প')}</span>
                  {accessFilter === 'all' && <Check className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => onSelectAccessFilter('free')}
                  className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    accessFilter === 'free'
                      ? 'bg-emerald-600 text-white font-bold'
                      : isLight
                      ? 'bg-purple-50 text-zinc-700 hover:bg-purple-100'
                      : 'bg-[#1e152d] text-zinc-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Gift className="h-3 w-3 text-emerald-400" />
                    <span>{t('access_free', 'ফ্রি গল্প (উন্মুক্ত)')}</span>
                  </span>
                  {accessFilter === 'free' && <Check className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => onSelectAccessFilter('little_pass')}
                  className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    accessFilter === 'little_pass'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold'
                      : isLight
                      ? 'bg-purple-50 text-zinc-700 hover:bg-purple-100'
                      : 'bg-[#1e152d] text-zinc-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Crown className="h-3 w-3 text-pink-400" />
                    <span>{t('access_pass', 'পাস গল্প (প্রিমিয়াম)')}</span>
                  </span>
                  {accessFilter === 'little_pass' && <Check className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* 3. Duration */}
            <div>
              <span
                className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${
                  isLight ? 'text-purple-900' : 'text-purple-300'
                }`}
              >
                {t('duration_heading', 'গল্পের দৈর্ঘ্য')}
              </span>
              <div className="flex flex-col gap-1.5">
                {durationOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onSelectLengthCategory(opt.value)}
                    className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      selectedLengthCategory === opt.value
                        ? 'bg-purple-600 text-white font-bold'
                        : isLight
                        ? 'bg-purple-50 text-zinc-700 hover:bg-purple-100'
                        : 'bg-[#1e152d] text-zinc-300 hover:text-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[10px] opacity-75">{opt.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Sort & Popularity */}
            <div>
              <span
                className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${
                  isLight ? 'text-purple-900' : 'text-purple-300'
                }`}
              >
                {t('sort_heading', 'সাজানোর ক্রম')}
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => onSelectSortBy('trending')}
                  className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    sortBy === 'trending'
                      ? 'bg-purple-600 text-white font-bold'
                      : isLight
                      ? 'bg-purple-50 text-zinc-700 hover:bg-purple-100'
                      : 'bg-[#1e152d] text-zinc-300 hover:text-white'
                  }`}
                >
                  <span>{t('sort_trending', 'প্রস্তাবিত ও ট্রেন্ডিং')}</span>
                  {sortBy === 'trending' && <Check className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => onSelectSortBy('popular')}
                  className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    sortBy === 'popular'
                      ? 'bg-purple-600 text-white font-bold'
                      : isLight
                      ? 'bg-purple-50 text-zinc-700 hover:bg-purple-100'
                      : 'bg-[#1e152d] text-zinc-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Flame className="h-3 w-3 text-amber-500" />
                    <span>{t('sort_popular', 'সর্বাধিক শোনা')}</span>
                  </span>
                  {sortBy === 'popular' && <Check className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => onSelectSortBy('rating')}
                  className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    sortBy === 'rating'
                      ? 'bg-purple-600 text-white font-bold'
                      : isLight
                      ? 'bg-purple-50 text-zinc-700 hover:bg-purple-100'
                      : 'bg-[#1e152d] text-zinc-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Star className="h-3 w-3 text-amber-400" />
                    <span>{t('sort_rating', 'শীর্ষ রেটিং')}</span>
                  </span>
                  {sortBy === 'rating' && <Check className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Panel Footer Actions */}
          <div className="mt-4 pt-3 border-t border-purple-150 dark:border-purple-900/40 flex items-center justify-between">
            <button
              onClick={onResetAll}
              className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                isLight ? 'text-zinc-600 hover:text-purple-700' : 'text-zinc-400 hover:text-pink-300'
              }`}
            >
              <RotateCcw className="h-3 w-3" />
              <span>{t('reset_all', 'সব রিসেট করুন')}</span>
            </button>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-95"
            >
              {t('view_results', 'ফলাফল দেখুন')} ({matchingStoryCount})
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Chips (if any filter is applied) */}
      {activeFilterCount > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          <span className={`text-[11px] font-medium ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {t('active_filters', 'সক্রিয় ফিল্টার:')}
          </span>

          {selectedGenre !== 'All' && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                isLight
                  ? 'border-purple-200 bg-purple-100 text-purple-900'
                  : 'border-purple-900/50 bg-purple-950/60 text-purple-200'
              }`}
            >
              <span>{selectedGenre}</span>
              <button
                onClick={() => onSelectGenre('All')}
                className="hover:opacity-75"
                aria-label="X"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {accessFilter !== 'all' && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                isLight
                  ? 'border-purple-200 bg-purple-100 text-purple-900'
                  : 'border-purple-900/50 bg-purple-950/60 text-purple-200'
              }`}
            >
              <span>{accessFilter === 'free' ? t('tab_free', 'ফ্রি গল্প') : t('badge_pass', 'পাস গল্প')}</span>
              <button
                onClick={() => onSelectAccessFilter('all')}
                className="hover:opacity-75"
                aria-label="X"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {selectedLengthCategory !== 'all' && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                isLight
                  ? 'border-purple-200 bg-purple-100 text-purple-900'
                  : 'border-purple-900/50 bg-purple-950/60 text-purple-200'
              }`}
            >
              <span>
                {selectedLengthCategory === 'mini'
                  ? t('dur_mini', 'ছোট গল্প')
                  : selectedLengthCategory === 'medium'
                  ? t('dur_medium', 'মাঝারি গল্প')
                  : t('dur_mega', 'মেগা গল্প')}
              </span>
              <button
                onClick={() => onSelectLengthCategory('all')}
                className="hover:opacity-75"
                aria-label="X"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {sortBy !== 'trending' && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                isLight
                  ? 'border-purple-200 bg-purple-100 text-purple-900'
                  : 'border-purple-900/50 bg-purple-950/60 text-purple-200'
              }`}
            >
              <span>{sortBy === 'popular' ? t('sort_popular', 'সর্বাধিক শোনা') : t('sort_rating', 'শীর্ষ রেটিং')}</span>
              <button
                onClick={() => onSelectSortBy('trending')}
                className="hover:opacity-75"
                aria-label="X"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          <button
            onClick={onResetAll}
            className="text-[11px] font-bold text-pink-500 hover:underline ml-1"
          >
            {t('clear_all', 'সব মুছুন')}
          </button>
        </div>
      )}
    </div>
  );
};
