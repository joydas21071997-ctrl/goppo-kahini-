import React from 'react';
import {
  Layers,
  Sparkles,
  ChevronRight,
  Radio,
  Play,
  Clock,
  BookOpen
} from 'lucide-react';
import { Series, ThemeMode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface SeriesSectionProps {
  seriesList: Series[];
  onSelectSeries: (series: Series) => void;
  theme?: ThemeMode;
}

export const SeriesSection: React.FC<SeriesSectionProps> = ({
  seriesList,
  onSelectSeries,
  theme = 'purple-light',
}) => {
  const { t } = useLanguage();
  const isLight = theme === 'purple-light' || theme === 'calm-green';

  if (!seriesList || seriesList.length === 0) return null;

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border shrink-0 ${
            isLight
              ? 'bg-purple-100 border-purple-200 text-purple-700'
              : 'bg-purple-950/60 border-purple-800/40 text-pink-400'
          }`}>
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base sm:text-lg font-bold tracking-tight ${
                isLight ? 'text-zinc-900' : 'text-white'
              }`}>
                {t('series_section_title', 'ধারাবাহিক অডিও সিরিজ ও নাটক')}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30">
                Series
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {t('series_section_subtitle', 'একটির পর একটি শ্বাসরুদ্ধকর পর্ব — সম্পূর্ণ ধারাবাহিক অডিও নাটক')}
            </p>
          </div>
        </div>
      </div>

      {/* Series Cards Horizontal Scroll / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {seriesList.map((series) => (
          <div
            key={series.id}
            onClick={() => onSelectSeries(series)}
            className={`group rounded-3xl border overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between ${
              isLight
                ? 'bg-white border-purple-200/90 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-100'
                : 'bg-gradient-to-b from-[#170c24] to-[#12081d] border-purple-900/40 hover:border-pink-500/50 hover:shadow-xl hover:shadow-purple-950/60'
            }`}
          >
            {/* Thumbnail Header with Tags */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60">
              <img
                src={series.thumbnail}
                alt={series.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              {/* Badges on Top */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600/95 text-white backdrop-blur-md shadow-sm">
                  {series.category}
                </span>

                {series.featured && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>জনপ্রিয়</span>
                  </span>
                )}
              </div>

              {/* Bottom Info on Cover */}
              <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                <div className="flex items-center gap-1.5 text-xs text-purple-200 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl border border-purple-500/30">
                  <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                  <span className="font-mono font-bold text-white">
                    {series.episodesCount ? `${series.episodesCount}টি পর্ব` : 'ধারাবাহিক পর্ব'}
                  </span>
                </div>

                <div className="h-8 w-8 rounded-full bg-pink-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
            </div>

            {/* Series Text Details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className={`text-base font-bold line-clamp-1 group-hover:text-pink-500 transition-colors ${
                  isLight ? 'text-zinc-900' : 'text-white'
                }`}>
                  {series.title}
                </h3>
                <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                  isLight ? 'text-zinc-600' : 'text-purple-300/80'
                }`}>
                  {series.description}
                </p>
              </div>

              <div className={`pt-2.5 border-t flex items-center justify-between text-xs ${
                isLight ? 'border-purple-100 text-zinc-500' : 'border-purple-900/30 text-zinc-400'
              }`}>
                <span className="truncate max-w-[140px]">
                  লেখক: {series.author}
                </span>

                <div className="flex items-center gap-1 text-pink-500 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>সব পর্ব শুনুন</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
