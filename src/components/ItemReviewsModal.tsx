import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  MessageSquare,
  ThumbsUp,
  Send,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Loader2
} from 'lucide-react';
import { ItemReview, AudienceUser } from '../types';
import {
  subscribeStoryReviews,
  submitOrUpdateStoryReview,
  calculateReviewStats,
} from '../services/firestoreReviews';
import { useLanguage } from '../context/LanguageContext';

interface ItemReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemTitle: string;
  itemType: 'story' | 'life_story';
  currentUser?: AudienceUser | null;
  onRequireLogin?: (message?: string) => void;
  onStoryStatsUpdated?: (stats: { rating: number; reviewsCount: number }) => void;
}

export const ItemReviewsModal: React.FC<ItemReviewsModalProps> = ({
  isOpen,
  onClose,
  itemId,
  itemTitle,
  itemType,
  currentUser,
  onRequireLogin,
  onStoryStatsUpdated,
}) => {
  const { t, language } = useLanguage();
  const [reviewsList, setReviewsList] = useState<ItemReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [userRating, setUserRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [likedReviewIds, setLikedReviewIds] = useState<Set<string>>(new Set());

  // Subscribe to real-time Firestore reviews when modal is open
  useEffect(() => {
    if (!isOpen || !itemId) return;

    if (itemType === 'story') {
      setReviewsLoading(true);
      const unsubscribe = subscribeStoryReviews(itemId, (reviews) => {
        setReviewsList(reviews);
        setReviewsLoading(false);
        const stats = calculateReviewStats(reviews);
        if (onStoryStatsUpdated) {
          onStoryStatsUpdated(stats);
        }
      });
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } else {
      setReviewsList([]);
      setReviewsLoading(false);
    }
  }, [isOpen, itemId, itemType, onStoryStatsUpdated]);

  // Check if current logged-in user already has an existing review
  const userExistingReview = currentUser
    ? reviewsList.find((r) => r.userId === currentUser.uid || r.id === currentUser.uid)
    : undefined;

  // Pre-fill existing review data if user has already reviewed
  useEffect(() => {
    if (userExistingReview) {
      setUserRating(userExistingReview.rating || 5);
      setReviewComment(userExistingReview.comment || '');
    } else {
      setUserRating(5);
      setReviewComment('');
    }
  }, [userExistingReview?.id]);

  if (!isOpen) return null;

  const stats = calculateReviewStats(reviewsList);
  const hasRating = stats.reviewsCount > 0;
  const avgRatingDisplay = hasRating ? stats.rating.toFixed(1) : (language === 'bn' ? '০.০' : '0.0');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    if (!currentUser) {
      if (onRequireLogin) {
        onRequireLogin(t('review_login_prompt', 'গল্পে রেটিং ও মন্তব্য দেওয়ার জন্য অনুগ্রহ করে লগইন করুন'));
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      if (itemType === 'story') {
        await submitOrUpdateStoryReview({
          storyId: itemId,
          storyTitle: itemTitle,
          rating: userRating,
          comment: reviewComment.trim(),
          user: currentUser,
        });
      }

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3500);
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      setSubmitError(err?.message || t('review_save_error', 'রিভিউ সংরক্ষণ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = (reviewId: string) => {
    setLikedReviewIds((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl border border-purple-500/30 bg-zinc-950 shadow-2xl shadow-purple-950/40 overflow-hidden my-4 text-white">
        
        {/* Top Gradient Stripe: Light Purple & Pink on Soft Black */}
        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors border border-purple-900/30"
          title={t('close', 'বন্ধ করুন')}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5 sm:p-7 max-h-[85vh] overflow-y-auto space-y-6">
          
          {/* Header */}
          <div className="space-y-1.5 pr-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-bold">
              <Sparkles className="h-3 w-3 text-pink-400" />
              <span>{itemType === 'life_story' ? t('review_podcast_badge', 'জীবন কথা পডকাস্ট') : t('review_story_badge', 'অডিও গল্প')} {t('reviews_tab', 'রিভিউ')}</span>
            </div>
            <h2 className="font-serif-story text-xl sm:text-2xl font-bold text-white leading-tight">
              {itemTitle}
            </h2>
            <p className="text-xs text-zinc-400">
              {t('review_section_sub', 'শ্রোতাদের মতামত ও বাস্তব ৫-স্টার রেটিং সেকশন')}
            </p>
          </div>

          {/* Rating Summary Card */}
          <div className="rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#181124] to-pink-950/30 border border-purple-900/40 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl sm:text-4xl font-black text-pink-300 font-mono">
                {avgRatingDisplay}
              </div>
              <div>
                <div className="flex items-center gap-1 text-pink-300">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        hasRating && star <= Math.round(stats.rating)
                          ? 'fill-pink-400 text-pink-400'
                          : 'text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  {hasRating
                    ? `মোট ${stats.reviewsCount} ${t('total_listeners_rated', 'জন শ্রোতার রেটিং')}`
                    : t('no_ratings_yet', 'এখনো কোনো রেটিং নেই • প্রথম রেটিংটি আপনি দিন!')}
                </div>
              </div>
            </div>

            <div className="hidden sm:block text-right text-[11px] text-pink-300 font-medium bg-pink-500/10 border border-pink-500/20 rounded-xl px-3 py-1.5">
              ✓ {t('verified_listener_ratings', 'যাচাইকৃত শ্রোতা রেটিং')}
            </div>
          </div>

          {/* Write / Edit Review Form */}
          {!currentUser ? (
            <div className="rounded-2xl bg-[#160e22] border border-purple-900/40 p-5 text-center space-y-3">
              <div className="flex justify-center text-pink-400">
                <Star className="h-8 w-8 text-pink-400/80" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('how_was_story', 'গল্পটি শুনে কেমন লাগল?')}</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  {t('how_was_story_sub', 'রেটিং ও আপনার অনুভূতি জানাতে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন করুন।')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRequireLogin?.(t('review_login_prompt', 'গল্পে রেটিং ও মন্তব্য দেওয়ার জন্য অনুগ্রহ করে লগইন করুন'))}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 px-5 py-2 text-xs font-bold text-white hover:opacity-95 transition-all shadow-md shadow-pink-950/40"
              >
                <User className="h-3.5 w-3.5" />
                <span>{t('login_to_rate_btn', 'লগইন করে রেটিং দিন')}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl bg-[#160e22] border border-purple-900/40 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-purple-200 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-pink-400" />
                  <span>{userExistingReview ? t('update_review', 'আপনার রিভিউ আপডেট করুন') : t('give_rating_comment', 'আপনার রেটিং ও মন্তব্য দিন')}</span>
                </h3>
                {userExistingReview && (
                  <span className="text-[10px] text-pink-400 bg-pink-500/15 border border-pink-500/30 px-2 py-0.5 rounded-full font-medium">
                    {t('previous_rating', 'পূর্বের রেটিং')}: {userExistingReview.rating}★
                  </span>
                )}
              </div>

              {submitSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{t('review_success', 'আপনার রেটিং ও মন্তব্য সফলভাবে সংরক্ষিত হয়েছে!')}</span>
                </div>
              )}

              {submitError && (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Interactive 5-Star Selection */}
              <div className="flex items-center gap-3 bg-black/50 p-2.5 rounded-xl border border-purple-900/30">
                <span className="text-xs text-zinc-300 font-medium">{t('select_rating', 'রেটিং বাছুন')}:</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isHighlighted = (hoverRating || userRating) >= starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setUserRating(starVal)}
                        className="p-1 hover:scale-125 transition-transform"
                        title={`${starVal} Star`}
                      >
                        <Star
                          className={`h-5 w-5 ${
                            isHighlighted
                              ? 'fill-pink-400 text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]'
                              : 'text-zinc-600 hover:text-zinc-400'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-mono font-bold text-pink-300 ml-auto">
                  {hoverRating || userRating} / {language === 'bn' ? '৫' : '5'}
                </span>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 mb-1 block">
                  {t('commenter', 'মন্তব্যকারী')}: <strong className="text-zinc-200">{currentUser.displayName || currentUser.email?.split('@')[0]}</strong>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={t('review_placeholder', 'গল্পের অনুভূতি, সাউন্ড কোয়ালিটি বা আপনার অভিজ্ঞতা সম্পর্কে লিখুন...')}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full rounded-xl border border-purple-900/30 bg-black/60 p-3 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 px-5 py-2 text-xs font-bold text-white hover:opacity-95 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>{t('saving', 'সংরক্ষণ হচ্ছে...')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>
                        {userExistingReview ? t('update_review', 'রিভিউ আপডেট করুন') : t('publish_comment', 'মন্তব্য প্রকাশ করুন')}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              {t('all_comments', 'সকল মন্তব্য')} ({stats.reviewsCount})
            </h3>

            {reviewsLoading ? (
              <div className="text-center py-6 border border-dashed border-purple-900/30 rounded-2xl text-xs text-zinc-500 animate-pulse">
                {t('reviews_loading', 'মন্তব্য লোড হচ্ছে...')}
              </div>
            ) : reviewsList.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-purple-900/30 rounded-2xl text-xs text-zinc-500">
                {t('no_reviews_yet', 'এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই দিন!')}
              </div>
            ) : (
              <div className="space-y-2.5">
                {reviewsList.map((rev) => {
                  const isLiked = likedReviewIds.has(rev.id);
                  const displayLikes = (rev.likes || 0) + (isLiked ? 1 : 0);
                  const isMyReview = Boolean(
                    currentUser?.uid && (rev.userId === currentUser.uid || rev.id === currentUser.uid)
                  );

                  return (
                    <div
                      key={rev.id}
                      className={`rounded-2xl border p-3.5 space-y-2 transition-colors ${
                        isMyReview
                          ? 'border-pink-500/40 bg-pink-950/20'
                          : 'border-purple-900/30 bg-[#160e22]/70 hover:border-pink-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-purple-500/20 text-pink-300 border border-purple-500/30 flex items-center justify-center text-xs font-bold">
                            {rev.userName ? rev.userName.slice(0, 1) : 'U'}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white">{rev.userName}</span>
                            {isMyReview && (
                              <span className="text-[10px] font-bold text-pink-300 bg-pink-500/20 border border-pink-500/30 px-2 py-0.5 rounded-full ml-2">
                                {t('your_review_badge', 'আপনার রিভিউ')}
                              </span>
                            )}
                            <span className="text-[10px] text-zinc-500 ml-2 font-mono">{rev.createdAt}</span>
                          </div>
                        </div>

                        {/* Star Rating Badge & Edit Button */}
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5 bg-black/60 px-2 py-0.5 rounded-md border border-purple-900/30">
                            <Star className="h-3 w-3 fill-pink-400 text-pink-400" />
                            <span className="text-[10px] font-bold text-pink-300 font-mono">{rev.rating}</span>
                          </div>
                          {isMyReview && (
                            <button
                              type="button"
                              onClick={() => {
                                setUserRating(rev.rating);
                                setReviewComment(rev.comment);
                              }}
                              className="p-1 rounded text-zinc-400 hover:text-pink-300 transition-colors"
                              title={t('edit_your_review', 'আপনার রিভিউ এডিট করুন')}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed pl-9">
                        {rev.comment}
                      </p>

                      <div className="pl-9 pt-1 flex items-center justify-between text-[11px] text-zinc-500">
                        <button
                          type="button"
                          onClick={() => handleLike(rev.id)}
                          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors ${
                            isLiked
                              ? 'text-pink-300 bg-pink-500/20 font-bold'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span>{t('like_btn', 'ভালো লেগেছে')} ({displayLikes})</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
