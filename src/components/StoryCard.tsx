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
  MessageSquare
} from 'lucide-react';
import { Story, UserSubscription } from '../types';

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
}) => {
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
    return `${mins} মিনিট`;
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
      className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 cursor-pointer ${
        isCurrentlyPlaying
          ? 'border-pink-400 bg-[#171022] shadow-xl shadow-pink-950/50 ring-1 ring-pink-400/40'
          : 'border-purple-900/40 bg-[#120a1c]/90 hover:border-pink-400/50 hover:bg-[#191024] hover:shadow-xl hover:shadow-purple-950/30'
      }`}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
        <img
          src={story.coverImage}
          alt={story.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {/* Top Badges: Light Purple & Pink on Black */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {story.isLittlePassOnly ? (
            story.lengthCategory === 'mega' ? (
              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md">
                <Crown className="h-3 w-3 fill-white" />
                <span>মেগা গল্প • ₹১০ বা পাস</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md">
                <Sparkles className="h-3 w-3 fill-white" />
                <span>₹২০ পাস</span>
              </span>
            )
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-purple-500/20 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/40">
              ফ্রি গল্প
            </span>
          )}

          {/* Bookmark Button */}
          {onToggleBookmark && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(story);
              }}
              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/70 backdrop-blur-md text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-pink-300"
              title="বুকমার্ক করুন"
            >
              <Bookmark
                className={`h-4 w-4 ${
                  isBookmarked ? 'fill-pink-400 text-pink-400' : ''
                }`}
              />
            </button>
          )}
        </div>

        {/* Play/Pause Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            type="button"
            onClick={handleActionClick}
            className={`pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform duration-300 ${
              isCurrentlyPlaying
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105 ring-4 ring-pink-400/30'
                : 'bg-black/80 backdrop-blur-md text-white hover:scale-110 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white border border-purple-500/30'
            }`}
          >
            {isLocked ? (
              <Lock className="h-5 w-5 text-purple-300" />
            ) : isCurrentlyPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Bottom Time & Category Indicator inside cover */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-zinc-300 pointer-events-none">
          <span className="flex items-center gap-1 bg-black/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-purple-900/40">
            <Clock className="h-3 w-3 text-pink-400" />
            <span>{formatDuration(story.duration)}</span>
          </span>

          <span className="rounded-full bg-black/80 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-medium text-purple-300 border border-purple-500/30">
            {story.lengthCategory === 'mini' ? 'মিনি গল্প' : story.lengthCategory === 'medium' ? 'মাঝারি গল্প' : 'মেগা গল্প'}
          </span>
        </div>
      </div>

      {/* Content Meta */}
      <div className="flex flex-1 flex-col p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
            {story.genre}
          </span>
          <span className="text-[10px] text-zinc-400">
            • {story.chapters.length} টি অধ্যায়
          </span>
        </div>

        <h3 className="font-serif-story text-base font-bold text-white group-hover:text-pink-300 transition-colors line-clamp-1">
          {story.title}
        </h3>

        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed flex-1">
          {story.tagline}
        </p>

        {/* Footer info: Narrator & Interactive 5-Star Rating / Reviews Button */}
        <div className="pt-3 border-t border-purple-900/30 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 truncate max-w-[150px] text-zinc-400">
            <Headphones className="h-3 w-3 text-pink-400 shrink-0" />
            <span className="truncate">{story.narrator}</span>
          </div>

          {/* Interactive Rating & Comments trigger */}
          <button
            type="button"
            onClick={handleReviewsClick}
            className="flex items-center gap-1.5 bg-black/60 hover:bg-purple-950/40 border border-purple-500/30 hover:border-pink-400 px-2.5 py-1 rounded-xl text-zinc-300 transition-all"
            title="রেটিং ও মন্তব্য দেখুন বা যোগ করুন"
          >
            <div className="flex items-center gap-0.5 text-pink-400 font-bold font-mono">
              <Star className="h-3 w-3 fill-pink-400 text-pink-400" />
              <span>{story.rating || '4.9'}</span>
            </div>
            <span className="text-zinc-600">•</span>
            <div className="flex items-center gap-1 text-[10px] text-purple-300">
              <MessageSquare className="h-2.5 w-2.5" />
              <span>মন্তব্য</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
