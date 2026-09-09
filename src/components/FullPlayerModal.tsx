import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Bookmark,
  Moon,
  List,
  FileText,
  Sliders,
  Sparkles,
  Share2,
  Check,
  Headphones,
  BookOpen,
  Type,
  Star,
  MessageSquare,
  ThumbsUp,
  Send,
  User,
  CheckCircle2
} from 'lucide-react';
import { Story, UserSubscription, ItemReview } from '../types';
import { getStoredReviews, saveReview, calculateAverageRating } from '../data/reviews';

interface FullPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: Story | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  sleepTimerRemaining: number | null;
  currentLineIndex: number;
  isBookmarked: boolean;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onChangeRate: (rate: number) => void;
  onChangeVolume: (vol: number) => void;
  onSetSleepTimer: (minutes: number | null) => void;
  onToggleBookmark: (story: Story, note?: string) => void;
  onOpenAmbientMixer: () => void;
  subscription: UserSubscription;
  onOpenReviews?: (itemId: string, itemTitle: string, itemType: 'story' | 'life_story') => void;
}

export const FullPlayerModal: React.FC<FullPlayerModalProps> = ({
  isOpen,
  onClose,
  story,
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  sleepTimerRemaining,
  currentLineIndex,
  isBookmarked,
  onTogglePlay,
  onSeek,
  onSkipBack,
  onSkipForward,
  onChangeRate,
  onSetSleepTimer,
  onToggleBookmark,
  onOpenAmbientMixer,
  onOpenReviews,
}) => {
  // Mobile mode: 'player' (artwork + big controls), 'script' (justified reading view), 'chapters', 'reviews'
  const [mobileMode, setMobileMode] = useState<'player' | 'script' | 'chapters' | 'reviews'>('player');
  // Script mode: 'sync' (karaoke style transcript), 'full' (continuous story book view), 'reviews' (rating and comments)
  const [scriptViewType, setScriptViewType] = useState<'sync' | 'full' | 'reviews'>('sync');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  const [showBookmarkInput, setShowBookmarkInput] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Review & Rating State
  const [reviewsList, setReviewsList] = useState<ItemReview[]>([]);
  const [userRating, setUserRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());

  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Load reviews whenever story changes
  useEffect(() => {
    if (story) {
      const all = getStoredReviews();
      setReviewsList(all.filter((r) => r.itemId === story.id));
    }
  }, [story]);

  // Auto-scroll transcript to active line if in sync mode
  useEffect(() => {
    if (scriptViewType === 'sync' && activeLineRef.current && transcriptContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentLineIndex, scriptViewType, mobileMode]);

  if (!isOpen || !story) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const { avg: averageRating, count: reviewCount } = calculateAverageRating(reviewsList, Number(story.rating || '4.9'));

  const handleSaveBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    onToggleBookmark(story, bookmarkNote || undefined);
    setShowBookmarkInput(false);
    setBookmarkNote('');
  };

  const handleShare = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;

    const newRev: ItemReview = {
      id: `rev-${Date.now()}`,
      itemId: story.id,
      itemTitle: story.title,
      itemType: 'story',
      userName: reviewAuthor.trim(),
      rating: userRating,
      comment: reviewComment.trim(),
      createdAt: 'এইমাত্র',
      likes: 0,
    };

    saveReview(newRev);
    setReviewsList((prev) => [newRev, ...prev]);
    setReviewComment('');
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  const handleToggleLike = (id: string) => {
    setLikedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getFontSizeClass = () => {
    if (fontSize === 'large') return 'text-base sm:text-lg leading-relaxed sm:leading-loose';
    if (fontSize === 'xlarge') return 'text-lg sm:text-xl leading-relaxed sm:leading-loose';
    return 'text-sm sm:text-base leading-relaxed';
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#120a1c] text-white overflow-hidden animate-fadeIn">
      
      {/* Background Ambient Glow: Light Purple & Pink */}
      <div
        className="absolute inset-0 opacity-20 filter blur-3xl pointer-events-none scale-125"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 20%, #9333ea, #db2777, #120a1c)`
        }}
      />

      {/* TOP PINNED HEADER */}
      <header className="sticky top-0 z-50 flex h-14 sm:h-16 shrink-0 items-center justify-between px-3 sm:px-6 border-b border-purple-900/30 bg-[#120a1c]/95 backdrop-blur-xl shadow-lg">
        {/* Large touch-friendly Back to Home / Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="হোমে ফিরুন"
          className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-black/60 border border-purple-900/40 hover:border-pink-500/50 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-zinc-200 hover:text-white transition-all shadow-md active:scale-95 touch-manipulation"
        >
          <ArrowLeft className="h-4 w-4 text-pink-400 shrink-0" />
          <span className="font-sans">হোমে ফিরুন</span>
        </button>

        {/* Story Title & Genre in Center */}
        <div className="flex-1 text-center px-2 truncate min-w-0 max-w-[180px] sm:max-w-md md:max-w-lg">
          <span className="text-[10px] uppercase font-bold tracking-wider text-pink-400 block truncate">
            {story.genre}
          </span>
          <h2 className="font-serif-story text-xs sm:text-sm font-bold text-white truncate">
            {story.title}
          </h2>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Rating & Reviews Open */}
          <button
            onClick={() => {
              if (onOpenReviews) {
                onOpenReviews(story.id, story.title, 'story');
              } else {
                setMobileMode('reviews');
                setScriptViewType('reviews');
              }
            }}
            type="button"
            className="flex items-center gap-1 h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl bg-black/60 border border-purple-900/40 text-pink-300 hover:text-white hover:border-pink-400 transition-colors text-xs font-bold"
            title="রেটিং ও মন্তব্য"
          >
            <Star className="h-3.5 w-3.5 fill-pink-400 text-pink-400" />
            <span className="font-mono">{averageRating}</span>
          </button>

          <button
            onClick={handleShare}
            type="button"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-black/60 border border-purple-900/40 text-zinc-300 hover:text-pink-400 transition-colors"
            title="লিংক কপি করুন"
          >
            {copiedLink ? <Check className="h-4 w-4 text-pink-400" /> : <Share2 className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => setShowBookmarkInput(!showBookmarkInput)}
            type="button"
            className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-black/60 border transition-colors ${
              isBookmarked ? 'text-pink-400 border-pink-500/40' : 'border-purple-900/40 text-zinc-300 hover:text-white'
            }`}
            title="বুকমার্ক করুন"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-pink-400' : ''}`} />
          </button>

          {/* Quick Exit Cross Button */}
          <button
            onClick={onClose}
            type="button"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition-colors"
            title="বন্ধ করুন"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* MOBILE SWITCHER TABS: Under the header on small screens */}
      <div className="lg:hidden shrink-0 border-b border-purple-900/30 bg-[#160e22] px-3 py-2">
        <div className="flex items-center justify-between gap-1 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setMobileMode('player')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
              mobileMode === 'player'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'bg-black/50 text-zinc-400 hover:text-white'
            }`}
          >
            <Headphones className="h-3.5 w-3.5" />
            <span>প্লেয়ার</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMode('script')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
              mobileMode === 'script'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'bg-black/50 text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>স্ক্রিপ্ট</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMode('chapters')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
              mobileMode === 'chapters'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'bg-black/50 text-zinc-400 hover:text-white'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>অধ্যায় ({story.chapters?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMode('reviews')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
              mobileMode === 'reviews'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'bg-black/50 text-zinc-400 hover:text-white'
            }`}
          >
            <Star className="h-3.5 w-3.5 fill-current text-pink-400" />
            <span>রিভিউ</span>
          </button>
        </div>
      </div>

      {/* Bookmark Note Floating Popup */}
      {showBookmarkInput && (
        <div className="relative z-30 mx-auto w-full max-w-md px-4 pt-2">
          <form onSubmit={handleSaveBookmark} className="rounded-2xl border border-purple-500/40 bg-[#160e22] p-3 shadow-2xl">
            <div className="text-xs font-semibold text-pink-300 mb-1.5 flex items-center justify-between">
              <span>{formatTime(currentTime)}-এ নোট রাখুন</span>
              <button
                type="button"
                onClick={() => setShowBookmarkInput(false)}
                className="text-zinc-400 hover:text-zinc-200 text-xs"
              >
                বাতিল
              </button>
            </div>
            <input
              type="text"
              placeholder="একটি ছোট নোট লিখুন..."
              value={bookmarkNote}
              onChange={(e) => setBookmarkNote(e.target.value)}
              className="w-full rounded-xl border border-purple-900/30 bg-black/70 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
              autoFocus
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
              >
                সেভ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="relative z-10 flex-1 overflow-y-auto px-3 sm:px-6 py-4 max-w-7xl mx-auto w-full">
        
        {/* DESKTOP LAYOUT (lg: and above) */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-start h-full">
          
          {/* Left Column: Artwork & Player Controls */}
          <div className="lg:col-span-5 flex flex-col items-center text-center p-5 rounded-3xl border border-purple-900/30 bg-[#160e22]/80 shadow-xl">
            <div className="relative aspect-square w-64 md:w-72 rounded-3xl overflow-hidden border border-purple-900/40 shadow-2xl shadow-purple-950/50">
              <img
                src={story.coverImage}
                alt={story.title}
                className={`h-full w-full object-cover transition-transform duration-1000 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute top-3 left-3">
                {story.isLittlePassOnly ? (
                  <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                    <Sparkles className="h-3 w-3 fill-white" />
                    ₹২০ পাস
                  </span>
                ) : (
                  <span className="rounded-full bg-pink-500/20 border border-pink-500/40 px-2.5 py-0.5 text-xs font-bold text-pink-300">
                    ফ্রি গল্প
                  </span>
                )}
              </div>

              {isPlaying && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center items-end gap-1.5 px-6">
                  {[40, 65, 85, 50, 95, 70, 80, 45, 60, 90, 75, 55].map((height, idx) => (
                    <div
                      key={idx}
                      className="w-1 bg-pink-400 rounded-full animate-pulse"
                      style={{
                        height: `${Math.max(12, (height * (idx % 2 === 0 ? 0.7 : 1)) * 0.35)}px`,
                        animationDelay: `${idx * 0.1}s`,
                        animationDuration: '0.8s'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4">
              <h1 className="font-serif-story text-xl font-bold text-white">
                {story.title}
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                রচনা: <span className="text-zinc-200 font-medium">{story.author}</span> • কণ্ঠে: <span className="text-pink-400 font-medium">{story.narrator}</span>
              </p>
            </div>

            {/* Quick 5-Star Rating Pill */}
            <button
              type="button"
              onClick={() => setScriptViewType('reviews')}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/50 border border-purple-500/30 text-pink-300 hover:border-pink-400 transition-colors text-xs"
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-3 w-3 ${
                      s <= Math.round(Number(averageRating))
                        ? 'fill-pink-400 text-pink-400'
                        : 'text-zinc-600'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono font-bold text-white">{averageRating}</span>
              <span className="text-zinc-400">• ({reviewsList.length} রিভিউ)</span>
            </button>

            {/* Progress Slider */}
            <div className="w-full max-w-sm mt-4">
              <div className="relative w-full h-2 bg-black/60 rounded-full cursor-pointer">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={1}
                  value={currentTime}
                  onChange={(e) => onSeek(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs font-mono text-zinc-400 mt-1.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-6 mt-3">
              <button
                onClick={onSkipBack}
                title="১৫ সেকেন্ড পেছনে"
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full transition-colors"
              >
                <RotateCcw className="h-6 w-6" />
              </button>

              <button
                onClick={onTogglePlay}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 text-white font-bold shadow-xl shadow-purple-950/60 transition-transform active:scale-95 hover:scale-105"
              >
                {isPlaying ? (
                  <Pause className="h-7 w-7 fill-current" />
                ) : (
                  <Play className="h-7 w-7 fill-current ml-1" />
                )}
              </button>

              <button
                onClick={onSkipForward}
                title="১৫ সেকেন্ড সামনে"
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full transition-colors"
              >
                <RotateCw className="h-6 w-6" />
              </button>
            </div>

            {/* Auxiliary Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-zinc-400">
              <button
                onClick={onOpenAmbientMixer}
                className="flex items-center gap-1.5 rounded-full border border-purple-900/30 bg-black/60 px-3 py-1.5 hover:border-pink-500/40 hover:text-pink-300 transition-colors"
              >
                <Sliders className="h-3.5 w-3.5 text-pink-400" />
                <span>আবহ শব্দ</span>
              </button>

              <div className="flex items-center gap-1.5 rounded-full border border-purple-900/30 bg-black/60 px-3 py-1.5">
                <Moon className="h-3.5 w-3.5 text-pink-400" />
                <span>
                  {sleepTimerRemaining !== null
                    ? `${Math.ceil(sleepTimerRemaining / 60)}মিনিট স্লিপ`
                    : 'টাইমার বন্ধ'}
                </span>
              </div>

              {/* Playback speed */}
              <div className="flex items-center gap-1 bg-black/60 border border-purple-900/30 rounded-full px-2 py-1 text-[11px]">
                {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => onChangeRate(rate)}
                    className={`px-1.5 py-0.5 rounded-full ${
                      playbackRate === rate ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Desktop Justified Script Reader, Chapters & Reviews */}
          <div className="lg:col-span-7 flex flex-col h-[560px] rounded-3xl border border-purple-900/30 bg-[#160e22]/90 overflow-hidden shadow-xl">
            {/* Header / Sub-tabs */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-purple-900/30 bg-black/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScriptViewType('sync')}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                    scriptViewType === 'sync'
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>লাইভ স্ক্রিপ্ট</span>
                </button>

                <button
                  onClick={() => setScriptViewType('full')}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                    scriptViewType === 'full'
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>বইয়ের পাতা</span>
                </button>

                <button
                  onClick={() => setScriptViewType('reviews')}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                    scriptViewType === 'reviews'
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Star className="h-3.5 w-3.5 fill-pink-400 text-pink-400" />
                  <span>রেটিং ও মন্তব্য ({reviewsList.length})</span>
                </button>
              </div>

              {/* Font controls (only in script modes) */}
              {scriptViewType !== 'reviews' && (
                <div className="flex items-center gap-1 text-xs text-zinc-400 bg-black/60 rounded-xl px-2 py-1 border border-purple-900/30">
                  <Type className="h-3.5 w-3.5 text-zinc-500 mr-1" />
                  <button
                    onClick={() => setFontSize('normal')}
                    className={`px-1.5 py-0.5 rounded ${fontSize === 'normal' ? 'text-pink-300 font-bold' : 'hover:text-white'}`}
                  >
                    ছোট
                  </button>
                  <button
                    onClick={() => setFontSize('large')}
                    className={`px-1.5 py-0.5 rounded ${fontSize === 'large' ? 'text-pink-300 font-bold' : 'hover:text-white'}`}
                  >
                    মাঝারি
                  </button>
                  <button
                    onClick={() => setFontSize('xlarge')}
                    className={`px-1.5 py-0.5 rounded ${fontSize === 'xlarge' ? 'text-pink-300 font-bold' : 'hover:text-white'}`}
                  >
                    বড়
                  </button>
                </div>
              )}
            </div>

            {/* Content Display */}
            <div
              ref={transcriptContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 font-sans leading-relaxed"
            >
              {scriptViewType === 'sync' && (
                story.transcript && story.transcript.length > 0 ? (
                  story.transcript.map((line, idx) => {
                    const isActive = idx === currentLineIndex;
                    return (
                      <div
                        key={line.id}
                        ref={isActive ? activeLineRef : null}
                        onClick={() => onSeek(line.time)}
                        className={`p-3.5 rounded-2xl transition-all cursor-pointer text-justify ${
                          isActive
                            ? 'bg-purple-950/60 border border-pink-500/50 text-white font-medium shadow-md'
                            : 'text-zinc-300 hover:text-white hover:bg-black/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-semibold text-pink-400/90">
                            {formatTime(line.time)}
                          </span>
                          {isActive && (
                            <span className="flex h-2 w-2 rounded-full bg-pink-400 animate-ping" />
                          )}
                        </div>
                        <p className={`${getFontSizeClass()} text-justify`}>{line.text}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-zinc-400 italic">স্ক্রিপ্ট প্রস্তুত হচ্ছে...</p>
                )
              )}

              {scriptViewType === 'full' && (
                <div className="space-y-4 max-w-prose mx-auto">
                  <div className="border-b border-purple-900/30 pb-3 mb-4">
                    <h3 className="font-serif-story text-lg font-bold text-pink-300">{story.title}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">লেখক: {story.author} • কথক: {story.narrator}</p>
                  </div>
                  {story.fullStoryText ? (
                    story.fullStoryText.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx} className={`${getFontSizeClass()} text-zinc-200 text-justify indent-6`}>
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    story.transcript.map((line) => (
                      <p key={line.id} className={`${getFontSizeClass()} text-zinc-200 text-justify`}>
                        {line.text}
                      </p>
                    ))
                  )}
                </div>
              )}

              {scriptViewType === 'reviews' && (
                <div className="space-y-6">
                  {/* Rating Header */}
                  <div className="rounded-2xl bg-black/60 border border-purple-900/40 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-black text-pink-300 font-mono">{averageRating}</span>
                      <div>
                        <div className="flex items-center gap-1 text-pink-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-4 w-4 ${
                                s <= Math.round(Number(averageRating))
                                  ? 'fill-pink-400 text-pink-400'
                                  : 'text-zinc-700'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-zinc-400 mt-0.5 block">মোট {reviewsList.length} জন শ্রোতার রেটিং</span>
                      </div>
                    </div>
                  </div>

                  {/* Add Rating Form */}
                  <form onSubmit={handleAddReview} className="rounded-2xl bg-black/40 border border-purple-900/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        রেটিং ও মন্তব্য দিন
                      </span>
                      {reviewSuccess && (
                        <span className="text-xs text-pink-400 flex items-center gap-1 font-semibold animate-pulse">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          মন্তব্য সংরক্ষিত হয়েছে!
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 bg-zinc-950/70 p-2.5 rounded-xl border border-purple-900/30">
                      <span className="text-xs text-zinc-400">রেটিং নির্বাচন করুন:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <button
                            key={starVal}
                            type="button"
                            onMouseEnter={() => setHoverRating(starVal)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setUserRating(starVal)}
                            className="p-1 hover:scale-125 transition-transform"
                          >
                            <Star
                              className={`h-4 w-4 ${
                                (hoverRating || userRating) >= starVal
                                  ? 'fill-pink-400 text-pink-400'
                                  : 'text-zinc-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-mono font-bold text-pink-300 ml-auto">
                        {hoverRating || userRating} / ৫
                      </span>
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="আপনার নাম..."
                      value={reviewAuthor}
                      onChange={(e) => setReviewAuthor(e.target.value)}
                      className="w-full rounded-xl border border-purple-900/30 bg-black/70 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                    />

                    <textarea
                      required
                      rows={2}
                      placeholder="গল্পের অনুভূতি, আবহের মান বা সাউন্ড কোয়ালিটি নিয়ে আপনার মতামত লিখুন..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full rounded-xl border border-purple-900/30 bg-black/70 p-3 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none resize-none"
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 px-4 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-all shadow-md"
                      >
                        <Send className="h-3 w-3" />
                        <span>মন্তব্য প্রকাশ করুন</span>
                      </button>
                    </div>
                  </form>

                  {/* List of Reviews */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                      শ্রোতাদের মন্তব্য ({reviewsList.length})
                    </span>

                    {reviewsList.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-purple-900/30 rounded-2xl text-xs text-zinc-500">
                        এখনো কোনো মন্তব্য নেই। প্রথম রিভিউটি আপনিই দিন!
                      </div>
                    ) : (
                      reviewsList.map((rev) => {
                        const isLiked = likedReviews.has(rev.id);
                        return (
                          <div
                            key={rev.id}
                            className="rounded-2xl border border-purple-900/30 bg-black/40 p-3.5 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-purple-500/20 text-pink-300 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold">
                                  {rev.userName.slice(0, 1)}
                                </div>
                                <span className="text-xs font-bold text-white">{rev.userName}</span>
                                <span className="text-[10px] text-zinc-500 font-mono">{rev.createdAt}</span>
                              </div>
                              <div className="flex items-center gap-0.5 bg-black/60 px-2 py-0.5 rounded-md border border-purple-900/30">
                                <Star className="h-3 w-3 fill-pink-400 text-pink-400" />
                                <span className="text-[10px] font-bold text-pink-300 font-mono">{rev.rating}</span>
                              </div>
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed pl-8">{rev.comment}</p>
                            <div className="pl-8 pt-1">
                              <button
                                type="button"
                                onClick={() => handleToggleLike(rev.id)}
                                className={`flex items-center gap-1 text-[10px] ${
                                  isLiked ? 'text-pink-300 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                              >
                                <ThumbsUp className="h-3 w-3" />
                                <span>ভালো লেগেছে ({rev.likes + (isLiked ? 1 : 0)})</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* MOBILE LAYOUT (lg:hidden) */}
        <div className="lg:hidden">
          
          {/* MODE 1: PLAYER VIEW */}
          {mobileMode === 'player' && (
            <div className="flex flex-col items-center text-center space-y-4 py-2 pb-24">
              <div className="relative aspect-square w-52 sm:w-64 rounded-3xl overflow-hidden border border-purple-900/40 shadow-2xl">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className={`h-full w-full object-cover transition-transform duration-1000 ${
                    isPlaying ? 'scale-105' : 'scale-100'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                <div className="absolute top-3 left-3">
                  {story.isLittlePassOnly ? (
                    <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                      <Sparkles className="h-3 w-3 fill-white" />
                      ₹২০ পাস
                    </span>
                  ) : (
                    <span className="rounded-full bg-pink-500/20 border border-pink-500/40 px-2.5 py-0.5 text-xs font-bold text-pink-300">
                      ফ্রি গল্প
                    </span>
                  )}
                </div>

                {isPlaying && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center items-end gap-1 px-4">
                    {[35, 60, 80, 45, 90, 65, 75, 40, 55, 85].map((height, idx) => (
                      <div
                        key={idx}
                        className="w-1 bg-pink-400 rounded-full animate-pulse"
                        style={{
                          height: `${Math.max(10, (height * (idx % 2 === 0 ? 0.7 : 1)) * 0.3)}px`,
                          animationDelay: `${idx * 0.1}s`,
                          animationDuration: '0.8s'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h1 className="font-serif-story text-lg sm:text-xl font-bold text-white px-2">
                  {story.title}
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  রচনা: <span className="text-zinc-200">{story.author}</span> • কণ্ঠে: <span className="text-pink-400">{story.narrator}</span>
                </p>
                {/* 5-Star Rating Pill on Mobile */}
                <button
                  type="button"
                  onClick={() => setMobileMode('reviews')}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-pink-300 text-xs"
                >
                  <Star className="h-3 w-3 fill-pink-400 text-pink-400" />
                  <span className="font-mono font-bold text-white">{averageRating}</span>
                  <span className="text-zinc-400 font-normal">({reviewsList.length} রিভিউ ও মন্তব্য)</span>
                </button>
              </div>

              {/* Progress Slider */}
              <div className="w-full max-w-sm px-4">
                <div className="relative w-full h-2.5 bg-black/60 rounded-full cursor-pointer">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={1}
                    value={currentTime}
                    onChange={(e) => onSeek(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between text-xs font-mono text-zinc-400 mt-1.5">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-7 pt-1">
                <button
                  onClick={onSkipBack}
                  title="১৫ সেকেন্ড পেছনে"
                  className="p-2 text-zinc-400 hover:text-white rounded-full transition-colors active:scale-95"
                >
                  <RotateCcw className="h-6 w-6" />
                </button>

                <button
                  onClick={onTogglePlay}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 text-white font-bold shadow-xl shadow-purple-950/60 active:scale-95 hover:scale-105"
                >
                  {isPlaying ? (
                    <Pause className="h-7 w-7 fill-current" />
                  ) : (
                    <Play className="h-7 w-7 fill-current ml-1" />
                  )}
                </button>

                <button
                  onClick={onSkipForward}
                  title="১৫ সেকেন্ড সামনে"
                  className="p-2 text-zinc-400 hover:text-white rounded-full transition-colors active:scale-95"
                >
                  <RotateCw className="h-6 w-6" />
                </button>
              </div>

              {/* Action Buttons: Script and Reviews */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setMobileMode('script')}
                  className="flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-950/40 px-3.5 py-1.5 text-xs font-bold text-pink-300 hover:bg-purple-900/40 transition-all shadow-sm"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>স্ক্রিপ্ট পড়ুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMobileMode('reviews')}
                  className="flex items-center gap-1.5 rounded-full border border-pink-500/40 bg-pink-950/30 px-3.5 py-1.5 text-xs font-bold text-pink-300 hover:bg-pink-900/40 transition-all shadow-sm"
                >
                  <Star className="h-3.5 w-3.5 fill-pink-400" />
                  <span>রেটিং দিন</span>
                </button>
              </div>

              {/* Auxiliary */}
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <button
                  onClick={onOpenAmbientMixer}
                  className="flex items-center gap-1.5 rounded-full border border-purple-900/30 bg-black/60 px-3 py-1.5"
                >
                  <Sliders className="h-3.5 w-3.5 text-pink-400" />
                  <span>আবহ</span>
                </button>

                <div className="flex items-center gap-1.5 rounded-full border border-purple-900/30 bg-black/60 px-3 py-1.5">
                  <Moon className="h-3.5 w-3.5 text-pink-400" />
                  <span>
                    {sleepTimerRemaining !== null
                      ? `${Math.ceil(sleepTimerRemaining / 60)}মি.`
                      : 'টাইমার বন্ধ'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: MOBILE SCRIPT & READER VIEW */}
          {mobileMode === 'script' && (
            <div className="flex flex-col h-full space-y-3 pb-28">
              
              {/* Reader Sub-Toolbar */}
              <div className="flex items-center justify-between bg-[#160e22] p-2.5 rounded-2xl border border-purple-900/30 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setScriptViewType('sync')}
                    className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                      scriptViewType === 'sync' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-zinc-400'
                    }`}
                  >
                    লাইভ স্ক্রিপ্ট
                  </button>
                  <button
                    onClick={() => setScriptViewType('full')}
                    className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                      scriptViewType === 'full' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-zinc-400'
                    }`}
                  >
                    বইয়ের পাতা
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-black/60 rounded-xl px-2 py-1 border border-purple-900/30">
                  <span className="text-[11px] text-zinc-400 font-semibold mr-1">ফন্ট:</span>
                  <button
                    onClick={() => setFontSize('normal')}
                    className={`px-1 rounded ${fontSize === 'normal' ? 'text-pink-300 font-bold' : 'text-zinc-400'}`}
                  >
                    ক
                  </button>
                  <button
                    onClick={() => setFontSize('large')}
                    className={`px-1 text-sm rounded ${fontSize === 'large' ? 'text-pink-300 font-bold' : 'text-zinc-400'}`}
                  >
                    খ
                  </button>
                  <button
                    onClick={() => setFontSize('xlarge')}
                    className={`px-1 text-base rounded ${fontSize === 'xlarge' ? 'text-pink-300 font-bold' : 'text-zinc-400'}`}
                  >
                    গ
                  </button>
                </div>
              </div>

              {/* Reading Surface */}
              <div
                ref={transcriptContainerRef}
                className="bg-[#160e22]/70 border border-purple-900/30 rounded-2xl p-4 sm:p-5 space-y-3 font-sans text-justify leading-relaxed"
              >
                {scriptViewType === 'sync' ? (
                  story.transcript.map((line, idx) => {
                    const isActive = idx === currentLineIndex;
                    return (
                      <div
                        key={line.id}
                        ref={isActive ? activeLineRef : null}
                        onClick={() => onSeek(line.time)}
                        className={`p-3 rounded-xl transition-all cursor-pointer ${
                          isActive
                            ? 'bg-purple-950/60 border border-pink-500/60 text-white font-medium shadow-md'
                            : 'text-zinc-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-semibold text-pink-400">
                            {formatTime(line.time)}
                          </span>
                          {isActive && (
                            <span className="flex h-1.5 w-1.5 rounded-full bg-pink-400 animate-ping" />
                          )}
                        </div>
                        <p className={`${getFontSizeClass()} text-justify leading-relaxed`}>{line.text}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="space-y-4">
                    <div className="border-b border-purple-900/30 pb-2 mb-2">
                      <h3 className="font-serif-story text-base font-bold text-pink-300">{story.title}</h3>
                      <p className="text-xs text-zinc-400">{story.author} • পাঠে: {story.narrator}</p>
                    </div>
                    {story.fullStoryText ? (
                      story.fullStoryText.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx} className={`${getFontSizeClass()} text-zinc-200 text-justify indent-4 leading-relaxed`}>
                          {paragraph}
                        </p>
                      ))
                    ) : (
                      story.transcript.map((line) => (
                        <p key={line.id} className={`${getFontSizeClass()} text-zinc-200 text-justify leading-relaxed`}>
                          {line.text}
                        </p>
                      ))
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* MODE 3: CHAPTERS VIEW */}
          {mobileMode === 'chapters' && (
            <div className="space-y-2 pb-28">
              <div className="text-xs font-semibold text-zinc-400 px-1 mb-2">
                যেকোনো অধ্যায়ে ট্যাপ করে সরাসরি সেই অংশ থেকে শুনুন:
              </div>
              {story.chapters.map((chap, idx) => {
                const isCurrentChapter =
                  currentTime >= chap.timestamp &&
                  currentTime < chap.timestamp + chap.duration;

                return (
                  <button
                    key={chap.id}
                    onClick={() => {
                      onSeek(chap.timestamp);
                      setMobileMode('player');
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isCurrentChapter
                        ? 'bg-purple-950/60 border-pink-500/50 text-white font-bold'
                        : 'border-purple-900/30 bg-[#160e22]/60 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] text-pink-400 uppercase font-mono">
                        পর্ব {idx + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-semibold text-white">{chap.title}</h4>
                    </div>
                    <span className="text-xs font-mono text-zinc-400">
                      {formatTime(chap.timestamp)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* MODE 4: REVIEWS & RATINGS VIEW */}
          {mobileMode === 'reviews' && (
            <div className="space-y-4 pb-28">
              {/* Summary Card */}
              <div className="rounded-2xl bg-[#160e22] border border-purple-900/40 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-pink-300 font-mono">{averageRating}</span>
                  <div>
                    <div className="flex items-center gap-1 text-pink-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            s <= Math.round(Number(averageRating))
                              ? 'fill-pink-400 text-pink-400'
                              : 'text-zinc-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-zinc-400 mt-0.5 block">মোট {reviewsList.length} জন শ্রোতার রেটিং</span>
                  </div>
                </div>
              </div>

              {/* Add Review Form */}
              <form onSubmit={handleAddReview} className="rounded-2xl bg-[#160e22] border border-purple-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    ৫-স্টার রেটিং ও মন্তব্য লিখুন
                  </span>
                  {reviewSuccess && (
                    <span className="text-xs text-pink-400 flex items-center gap-1 font-semibold animate-pulse">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      যুক্ত হয়েছে!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 bg-black/60 p-2.5 rounded-xl border border-purple-900/30">
                  <span className="text-xs text-zinc-400">রেটিং:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setUserRating(starVal)}
                        className="p-1"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            userRating >= starVal ? 'fill-pink-400 text-pink-400' : 'text-zinc-700'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-mono font-bold text-pink-300 ml-auto">
                    {userRating} / ৫
                  </span>
                </div>

                <input
                  type="text"
                  required
                  placeholder="আপনার নাম..."
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                  className="w-full rounded-xl border border-purple-900/30 bg-black/60 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                />

                <textarea
                  required
                  rows={2}
                  placeholder="গল্পের অনুভূতি বা অডিও অভিজ্ঞতা সম্পর্কে আপনার মতামত লিখুন..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full rounded-xl border border-purple-900/30 bg-black/60 p-3 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none resize-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 px-4 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-all shadow-md"
                  >
                    <Send className="h-3 w-3" />
                    <span>মন্তব্য প্রকাশ করুন</span>
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  সকল মন্তব্য ({reviewsList.length})
                </span>

                {reviewsList.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-purple-900/30 rounded-2xl text-xs text-zinc-500">
                    এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই দিন!
                  </div>
                ) : (
                  reviewsList.map((rev) => {
                    const isLiked = likedReviews.has(rev.id);
                    return (
                      <div
                        key={rev.id}
                        className="rounded-2xl border border-purple-900/30 bg-[#160e22]/70 p-3.5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-purple-500/20 text-pink-300 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold">
                              {rev.userName.slice(0, 1)}
                            </div>
                            <span className="text-xs font-bold text-white">{rev.userName}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{rev.createdAt}</span>
                          </div>
                          <div className="flex items-center gap-0.5 bg-black/60 px-2 py-0.5 rounded-md border border-purple-900/30">
                            <Star className="h-3 w-3 fill-pink-400 text-pink-400" />
                            <span className="text-[10px] font-bold text-pink-300 font-mono">{rev.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed pl-8">{rev.comment}</p>
                        <div className="pl-8 pt-1">
                          <button
                            type="button"
                            onClick={() => handleToggleLike(rev.id)}
                            className={`flex items-center gap-1 text-[10px] ${
                              isLiked ? 'text-pink-300 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span>ভালো লেগেছে ({rev.likes + (isLiked ? 1 : 0)})</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* STICKY MINI-CONTROL DOCK FOR MOBILE SCRIPT/CHAPTERS/REVIEWS MODE */}
      {mobileMode !== 'player' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#120a1c]/95 border-t border-purple-900/40 p-2.5 backdrop-blur-xl shadow-2xl safe-area-bottom">
          <div className="flex items-center gap-3">
            <img
              src={story.coverImage}
              alt={story.title}
              className="h-11 w-11 rounded-xl object-cover border border-purple-900/40 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white truncate font-serif-story">{story.title}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-zinc-400">{formatTime(currentTime)} / {formatTime(duration)}</span>
                <div className="flex-1 h-1 bg-black/60 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-400" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={onSkipBack}
                className="p-1.5 text-zinc-400 hover:text-white"
                title="১৫ সেকেন্ড পেছনে"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={onTogglePlay}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-md"
              >
                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
              </button>
              <button
                onClick={onSkipForward}
                className="p-1.5 text-zinc-400 hover:text-white"
                title="১৫ সেকেন্ড সামনে"
              >
                <RotateCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING EXTRA QUICK RETURN / CLOSE BUTTON */}
      <button
        onClick={onClose}
        type="button"
        className="sm:hidden fixed bottom-14 right-4 z-40 flex items-center gap-1.5 rounded-full bg-black/80 border border-purple-900/40 px-3 py-1.5 text-[11px] font-bold text-white shadow-xl backdrop-blur-md active:scale-95"
      >
        <ArrowLeft className="h-3 w-3 text-pink-400" />
        <span>হোমে যান</span>
      </button>

    </div>
  );
};
