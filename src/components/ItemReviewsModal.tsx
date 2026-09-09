import React, { useState } from 'react';
import {
  X,
  Star,
  MessageSquare,
  ThumbsUp,
  Send,
  User,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ItemReview } from '../types';

interface ItemReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemTitle: string;
  itemType: 'story' | 'life_story';
  reviews: ItemReview[];
  onAddReview: (review: ItemReview) => void;
}

export const ItemReviewsModal: React.FC<ItemReviewsModalProps> = ({
  isOpen,
  onClose,
  itemId,
  itemTitle,
  itemType,
  reviews,
  onAddReview,
}) => {
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [commentText, setCommentText] = useState('');
  const [likedReviewIds, setLikedReviewIds] = useState<Set<string>>(new Set());
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen) return null;

  const itemReviews = reviews.filter((r) => r.itemId === itemId);
  const avgRating = itemReviews.length > 0
    ? (itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length).toFixed(1)
    : '5.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !commentText.trim()) return;

    const newRev: ItemReview = {
      id: `rev-${Date.now()}`,
      itemId,
      itemTitle,
      itemType,
      userName: userName.trim(),
      rating,
      comment: commentText.trim(),
      createdAt: 'এইমাত্র',
      likes: 0,
    };

    onAddReview(newRev);
    setCommentText('');
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
    }, 3000);
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
          title="বন্ধ করুন"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5 sm:p-7 max-h-[85vh] overflow-y-auto space-y-6">
          
          {/* Header */}
          <div className="space-y-1.5 pr-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-bold">
              <Sparkles className="h-3 w-3 text-pink-400" />
              <span>{itemType === 'life_story' ? 'জীবন কথা পডকাস্ট' : 'অডিও গল্প'} রিভিউ</span>
            </div>
            <h2 className="font-serif-story text-xl sm:text-2xl font-bold text-white leading-tight">
              {itemTitle}
            </h2>
            <p className="text-xs text-zinc-400">
              শ্রোতাদের মতামত ও ৫-স্টার রেটিং সেকশন
            </p>
          </div>

          {/* Rating Summary Card */}
          <div className="rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#181124] to-pink-950/30 border border-purple-900/40 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl sm:text-4xl font-black text-pink-300 font-mono">
                {avgRating}
              </div>
              <div>
                <div className="flex items-center gap-1 text-pink-300">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(Number(avgRating))
                          ? 'fill-pink-400 text-pink-400'
                          : 'text-zinc-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  মোট {itemReviews.length} জন শ্রোতার রেটিং
                </div>
              </div>
            </div>

            <div className="hidden sm:block text-right text-[11px] text-pink-300 font-medium bg-pink-500/10 border border-pink-500/20 rounded-xl px-3 py-1.5">
              ✓ যাচাইকৃত শ্রোতা মতামত
            </div>
          </div>

          {/* Write a Review & Rate Form */}
          <form onSubmit={handleSubmit} className="rounded-2xl bg-[#160e22] border border-purple-900/40 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-purple-200 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-pink-400" />
                <span>আপনার রেটিং ও মন্তব্য দিন</span>
              </h3>
              {submitSuccess && (
                <span className="text-xs text-pink-400 flex items-center gap-1 font-semibold animate-pulse">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>মন্তব্য যোগ হয়েছে!</span>
                </span>
              )}
            </div>

            {/* Interactive 5-Star Selection */}
            <div className="flex items-center gap-3 bg-black/50 p-2.5 rounded-xl border border-purple-900/30">
              <span className="text-xs text-zinc-300 font-medium">রেটিং বাছুন:</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isHighlighted = (hoverRating || rating) >= starVal;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(starVal)}
                      className="p-1 hover:scale-125 transition-transform"
                      title={`${starVal} স্টার`}
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
                {hoverRating || rating} / ৫
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 mb-1 block">আপনার নাম</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ সৌমেন ঘোষ"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full rounded-xl border border-purple-900/30 bg-black/60 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">আপনার মূল্যবান মন্তব্য</label>
              <textarea
                required
                rows={3}
                placeholder="গল্পের অনুভূতি, সাউন্ড কোয়ালিটি বা আপনার অভিজ্ঞতা সম্পর্কে লিখুন..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full rounded-xl border border-purple-900/30 bg-black/60 p-3 text-xs text-white placeholder-zinc-500 focus:border-pink-400 focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 px-5 py-2 text-xs font-bold text-white hover:opacity-95 transition-all shadow-md active:scale-95"
              >
                <Send className="h-3.5 w-3.5" />
                <span>মন্তব্য প্রকাশ করুন</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              সকল মন্তব্য ({itemReviews.length})
            </h3>

            {itemReviews.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-purple-900/30 rounded-2xl text-xs text-zinc-500">
                এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই দিন!
              </div>
            ) : (
              <div className="space-y-2.5">
                {itemReviews.map((rev) => {
                  const isLiked = likedReviewIds.has(rev.id);
                  const displayLikes = rev.likes + (isLiked ? 1 : 0);

                  return (
                    <div
                      key={rev.id}
                      className="rounded-2xl border border-purple-900/30 bg-[#160e22]/70 p-3.5 space-y-2 hover:border-pink-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-purple-500/20 text-pink-300 border border-purple-500/30 flex items-center justify-center text-xs font-bold">
                            {rev.userName.slice(0, 1)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white">{rev.userName}</span>
                            <span className="text-[10px] text-zinc-500 ml-2 font-mono">{rev.createdAt}</span>
                          </div>
                        </div>

                        {/* Star Rating Badge */}
                        <div className="flex items-center gap-0.5 bg-black/60 px-2 py-0.5 rounded-md border border-purple-900/30">
                          <Star className="h-3 w-3 fill-pink-400 text-pink-400" />
                          <span className="text-[10px] font-bold text-pink-300 font-mono">{rev.rating}</span>
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
                          <span>ভালো লেগেছে ({displayLikes})</span>
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
