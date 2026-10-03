import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  Lock,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Tag,
  Radio,
  Share2,
  Check,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Series, Episode, UserSubscription, ThemeMode } from '../../types';
import { evaluateEpisodeAccess } from '../../utils/episodeAccess';
import { useLanguage } from '../../context/LanguageContext';

interface SeriesDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: Series | null;
  episodes: Episode[];
  subscription?: UserSubscription | null;
  currentPlayingEpisodeId?: string | null;
  isPlaying?: boolean;
  onPlayEpisode: (series: Series, episode: Episode) => void;
  onUnlockEpisode: (series: Series, episode: Episode) => void;
  onRenewMainPass: () => void;
  theme?: ThemeMode;
}

export const SeriesDetailModal: React.FC<SeriesDetailModalProps> = ({
  isOpen,
  onClose,
  series,
  episodes,
  subscription,
  currentPlayingEpisodeId,
  isPlaying = false,
  onPlayEpisode,
  onUnlockEpisode,
  onRenewMainPass,
  theme = 'purple-light',
}) => {
  const { t } = useLanguage();
  const isLight = theme === 'purple-light' || theme === 'calm-green';
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !series) return null;

  const isMainPassActive = subscription?.status === 'active';

  const handleShare = () => {
    const url = `${window.location.origin}/series/${series.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }).catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col transition-colors ${
        isLight
          ? 'bg-white border-purple-200 text-zinc-900 shadow-purple-950/20'
          : 'bg-[#130a1e] border-purple-900/50 text-white shadow-purple-950/80'
      }`}>
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400" />

        {/* Header / Hero Cover of Series */}
        <div className="relative">
          <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-black/50">
            <img
              src={series.thumbnail}
              alt={series.title}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 ${
              isLight
                ? 'bg-gradient-to-t from-white via-white/40 to-transparent'
                : 'bg-gradient-to-t from-[#130a1e] via-[#130a1e]/60 to-transparent'
            }`} />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer z-10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="absolute top-3.5 right-13 h-8 px-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center gap-1.5 text-xs backdrop-blur-md transition-all cursor-pointer z-10"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400">কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-purple-300" />
                  <span className="text-[10px] text-purple-200">শেয়ার</span>
                </>
              )}
            </button>

            {/* Floating Tags */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-600 text-white shadow-sm">
                {series.category}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/60 text-purple-200 backdrop-blur-md border border-purple-500/30">
                {episodes.length}টি পর্ব
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${
                isLight ? 'bg-purple-100 text-purple-900 border-purple-200' : 'bg-purple-950/80 text-pink-300 border-purple-800/40'
              }`}>
                {series.genre}
              </span>
            </div>
          </div>
        </div>

        {/* Series Info Body */}
        <div className="px-5 pt-3 pb-2 space-y-2 border-b border-purple-900/20">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${
                isLight ? 'text-purple-950' : 'text-white'
              }`}>
                {series.title}
              </h2>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-600' : 'text-purple-300/80'}`}>
                লেখক ও নির্মাতা: <span className="font-semibold text-pink-500">{series.author}</span>
              </p>
            </div>
          </div>

          <p className={`text-xs sm:text-[13px] leading-relaxed ${
            isLight ? 'text-zinc-700' : 'text-zinc-300'
          }`}>
            {series.description}
          </p>
        </div>

        {/* Episode List Scroll Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 scrollbar-thin">
          <div className="flex items-center justify-between pb-1">
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-zinc-600' : 'text-zinc-400'
            }`}>
              <Radio className="w-3.5 h-3.5 text-pink-500" />
              <span>ধারাবাহিক পর্বসমূহ ({episodes.length})</span>
            </h3>

            {!isMainPassActive && (
              <span className="text-[10px] text-pink-400 font-mono">
                * পেইড পর্ব শুনতে ২০ টাকার পাস প্রয়োজন
              </span>
            )}
          </div>

          {episodes.map((ep) => {
            const access = evaluateEpisodeAccess(ep, subscription);
            const isCurrentlyPlaying = currentPlayingEpisodeId === ep.id && isPlaying;
            const isFreeOrTrailer = ep.accessType === 'free' || ep.accessType === 'trailer';

            return (
              <div
                key={ep.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isCurrentlyPlaying
                    ? 'border-pink-500/80 bg-gradient-to-r from-purple-950/40 via-pink-950/30 to-purple-950/40 shadow-sm'
                    : isLight
                    ? 'bg-purple-50/40 border-purple-200/80 hover:border-purple-300'
                    : 'bg-[#190d29]/60 border-purple-900/30 hover:border-purple-700/50'
                }`}
              >
                {/* Left: Episode Number & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                    isCurrentlyPlaying
                      ? 'bg-pink-600 text-white border-pink-400 animate-pulse'
                      : access.unlocked
                      ? isLight
                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                        : 'bg-purple-900/40 text-purple-200 border-purple-700/40'
                      : 'bg-black/40 text-zinc-400 border-zinc-800'
                  }`}>
                    <span className="text-[9px] uppercase font-bold text-pink-400 leading-none">পর্ব</span>
                    <span className="text-sm font-bold leading-none mt-0.5">{ep.episodeNumber}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className={`text-sm font-bold truncate ${
                        isCurrentlyPlaying
                          ? 'text-pink-400'
                          : isLight
                          ? 'text-zinc-900'
                          : 'text-white'
                      }`}>
                        {ep.title}
                      </h4>

                      {/* Access Badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                        isFreeOrTrailer
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : access.unlocked
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                      }`}>
                        {ep.accessType === 'free'
                          ? 'ফ্রি'
                          : ep.accessType === 'trailer'
                          ? 'ট্রেলার'
                          : access.unlocked
                          ? 'আনলকড'
                          : `₹${ep.price || 5}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3 h-3 text-purple-400" />
                        {Math.floor(ep.duration / 60)} মিনিট
                      </span>
                      {ep.description && (
                        <span className="truncate max-w-xs text-[11px] hidden sm:inline">
                          • {ep.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Button */}
                <div className="shrink-0">
                  {access.unlocked ? (
                    /* Play Button */
                    <button
                      type="button"
                      onClick={() => onPlayEpisode(series, ep)}
                      className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
                        isCurrentlyPlaying
                          ? 'bg-pink-600 text-white shadow-pink-600/30'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                      }`}
                    >
                      {isCurrentlyPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>চলছে</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>শুনুন</span>
                        </>
                      )}
                    </button>
                  ) : access.reason === 'needs_pass' ? (
                    /* Pass Expired -> Renew Pass Prompt */
                    <button
                      type="button"
                      onClick={onRenewMainPass}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer"
                      title="অ্যাক্সেস পাস রিনিউ করুন"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>পাস রিনিউ (₹২০)</span>
                    </button>
                  ) : (
                    /* Needs Episode Purchase (₹X) */
                    <button
                      type="button"
                      onClick={() => onUnlockEpisode(series, ep)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-pink-950/40 active:scale-95 transition-all cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>আনলক ₹{ep.price || 5}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info bar */}
        <div className={`p-3.5 border-t text-center text-xs ${
          isLight ? 'border-purple-100 bg-purple-50/50 text-zinc-600' : 'border-purple-900/30 bg-black/40 text-zinc-400'
        }`}>
          <span>গপ্পো কাহিনী অরিজিনাল অডিও সিরিজ • অনলাইন স্ট্রিমিং ও আবহ শব্দে তৈরি</span>
        </div>
      </div>
    </div>
  );
};
