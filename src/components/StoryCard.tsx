import React from 'react';
import {
  Play,
  Pause,
  Lock,
  Clock,
  Sparkles,
  Bookmark,
  Headphones,
  Crown,
  Star,
  MessageSquare,
  Flame
} from 'lucide-react';
import { Story, UserSubscription, ThemeMode } from '../types';

interface StoryCardProps {
  story: Story;
  isPlayingThis?: boolean;
  isPlaying?: boolean;
  isCurrentStory?: boolean;
  onPlay: (story: Story) => void;
  onPause: () => void;
  onSelect?: (story: Story) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (story: Story) => void;
  subscription?: UserSubscription;
  isSubscribed?: boolean;
  isUnlockedSingle?: boolean;
  onPromptSubscription?: (story: Story) => void;
  onOpenPaywall?: (story: Story) => void;
  reviewsCount?: number;
  onOpenReviews?: (itemId: string, itemTitle: string, itemType: 'story' | 'life_story') => void;
  theme?: ThemeMode;
  compact?: boolean;
  rankingNumber?: number;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  isPlayingThis,
  isPlaying,
  isCurrentStory,
  onPlay,
  onPause,
  onSelect,
  isBookmarked = false,
  onToggleBookmark,
  subscription,
  isSubscribed: isSubscribedProp,
  isUnlockedSingle: isUnlockedSingleProp,
  onPromptSubscription,
  onOpenPaywall,
  reviewsCount = 12,
  onOpenReviews,
  theme = 'purple-light',
  compact = false,
  rankingNumber,
}) => {
  const isLight = theme === 'purple-light' || theme === 'calm-green';
  const isCurrentlyPlaying = Boolean(isPlayingThis ?? isPlaying);
  const isSubscribed = Boolean(isSubscribedProp ?? (subscription?.status === 'active'));
  const isUnlockedIndividually = Boolean(
    isUnlockedSingleProp ?? (subscription?.unlockedStoryIds?.includes(story.id))
  );
  const isLocked = story.isLittlePassOnly && !isSubscribed && !isUnlockedIndividually;

  const triggerPaywall = () => {
    if (onOpenPaywall) {
      onOpenPaywall(story);
    } else if (onPromptSubscription) {
      onPromptSubscription(story);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} মি.`;
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocked) {
      triggerPaywall();
      return;
    }
    if (isCurrentlyPlaying) {
      onPause();
    } else {
      onPlay(story);
    }
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(story);
    } else if (isLocked) {
      triggerPaywall();
    } else if (isCurrentlyPlaying) {
      onPause();
    } else {
      onPlay(story);
    }
  };

  const handleReviewsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenReviews) {
      onOpenReviews(story.id, story.title, 'story');
    }
  };

  return (
    <div
      id={`story-card-${story.id}`}
      onClick={handleCardClick}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer ${
        isCurrentlyPlaying
          ? isLight
            ? 'border-purple-600 bg-purple-50/80 shadow-md ring-1 ring-purple-500/40'
            : 'border-pink-400 bg-[#171022] shadow-lg shadow-pink-950/40 ring-1 ring-pink-400/40'
          : isLight
            ? 'border-purple-200/90 bg-white hover:border-purple-400 hover:shadow-md hover:shadow-purple-100/60'
            : 'border-purple-900/40 bg-[#120a1c]/90 hover:border-pink-400/40 hover:bg-[#170e24] hover:shadow-md'
      }`}
    >
      {/* Compact Proportional Cover Image Container */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-black">
        <img
          src={story.coverImage}
          alt={story.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Top Badges: Free vs Pass + Ranking + Bookmark */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            {rankingNumber !== undefined && (
              <span className="flex items-center gap-1 rounded-md bg-amber-400 text-zinc-950 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black shadow-sm border border-amber-300">
                <Flame className="h-2.5 w-2.5 fill-current text-zinc-950" />
                <span>#{rankingNumber}</span>
              </span>
            )}
            {story.isLittlePassOnly ? (
              story.lengthCategory === 'mega' ? (
                <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-sm">
                  <Crown className="h-2.5 w-2.5 fill-white" />
                  <span>মেগা পাস</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-sm">
                  <Sparkles className="h-2.5 w-2.5 fill-white" />
                  <span>₹২০ পাস</span>
                </span>
              )
            ) : (
              <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-bold shadow-xs ${
                isLight
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/40'
              }`}>
                ✓ ফ্রি গল্প
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          {onToggleBookmark && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(story);
              }}
              className={`pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md transition-colors ${
                isLight
                  ? 'bg-white/90 text-zinc-600 hover:bg-white hover:text-purple-700 shadow-xs'
                  : 'bg-black/70 text-zinc-300 hover:bg-zinc-800 hover:text-pink-300'
              }`}
              title="বুকমার্ক করুন"
            >
              <Bookmark
                className={`h-3.5 w-3.5 ${
                  isBookmarked ? (isLight ? 'fill-purple-600 text-purple-600' : 'fill-pink-400 text-pink-400') : ''
                }`}
              />
            </button>
          )}
        </div>

        {/* Play/Pause Button Overlay (Sleeker & Proportional) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            type="button"
            onClick={handleActionClick}
            className={`pointer-events-auto flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full shadow-md transition-transform duration-300 ${
              isCurrentlyPlaying
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105 ring-2 ring-pink-400/40'
                : 'bg-black/75 backdrop-blur-md text-white hover:scale-105 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 border border-white/20'
            }`}
          >
            {isLocked ? (
              <Lock className="h-4 w-4 text-purple-200" />
            ) : isCurrentlyPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Bottom Duration Tag inside cover */}
        <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-zinc-200 pointer-events-none">
          <span className="flex items-center gap-1 bg-black/80 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/10 font-medium">
            <Clock className="h-2.5 w-2.5 text-pink-400" />
            <span>{formatDuration(story.duration)}</span>
          </span>

          <span className="rounded-md bg-black/80 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-medium text-purple-200 border border-white/10">
            {story.lengthCategory === 'mini' ? 'মিনি' : story.lengthCategory === 'medium' ? 'মাঝারি' : 'মেগা'}
          </span>
        </div>
      </div>

      {/* Content Meta - Compact & High-Contrast Typography */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3 space-y-1.5 justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`rounded px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold ${
              isLight
                ? 'bg-purple-100 border border-purple-200 text-purple-900'
                : 'bg-purple-500/15 border border-purple-500/30 text-purple-300'
            }`}>
              {story.genre}
            </span>
            <span className={`text-[9px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              • {story.chapters.length} পর্ব
            </span>
          </div>

          <h3 className={`font-serif-story text-xs sm:text-sm font-bold transition-colors line-clamp-1 ${
            isLight
              ? 'text-zinc-950 group-hover:text-purple-700'
              : 'text-white group-hover:text-pink-300'
          }`}>
            {story.title}
          </h3>

          <p className={`text-[10px] sm:text-[11px] line-clamp-1 leading-snug mt-0.5 ${
            isLight ? 'text-zinc-600 font-medium' : 'text-zinc-400'
          }`}>
            {story.tagline}
          </p>
        </div>

        {/* Footer info: Narrator & Interactive Rating / Reviews Button */}
        <div className={`pt-2 border-t flex items-center justify-between text-[10px] gap-1 ${
          isLight ? 'border-purple-100' : 'border-purple-900/30'
        }`}>
          <div className={`flex items-center gap-1 truncate max-w-[90px] sm:max-w-[110px] ${
            isLight ? 'text-zinc-700 font-semibold' : 'text-zinc-300'
          }`}>
            <Headphones className="h-3 w-3 text-purple-600 shrink-0" />
            <span className="truncate text-[10px]">{story.narrator}</span>
          </div>

          {/* Interactive Rating & Comments trigger */}
          <button
            type="button"
            onClick={handleReviewsClick}
            className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-lg transition-all border shrink-0 ${
              isLight
                ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900'
                : 'bg-black/60 hover:bg-purple-950/40 border-purple-500/30 hover:border-pink-400 text-zinc-200'
            }`}
            title="রেটিং ও মন্তব্য"
          >
            <Star className={`h-2.5 w-2.5 ${
              story.rating && story.rating > 0 
                ? (isLight ? 'fill-purple-600 text-purple-600' : 'fill-pink-400 text-pink-400')
                : (isLight ? 'text-zinc-400' : 'text-zinc-500')
            }`} />
            <span className="font-bold text-[10px] font-mono">
              {story.rating && story.rating > 0 ? story.rating.toFixed(1) : 'নতুন'}
            </span>
            <span className="text-[9px] opacity-70">
              ({story.reviewsCount || 0})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
