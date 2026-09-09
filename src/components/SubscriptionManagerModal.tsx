import React, { useState } from 'react';
import {
  X,
  Crown,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Clock,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { UserSubscription, PaymentTransaction } from '../types';

interface SubscriptionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  userTransaction?: PaymentTransaction | null;
  onCancelSubscription: (reason: string) => void;
  onRequestRefund: (reason: string) => void;
  onOpenNewSubscription: () => void;
}

export const SubscriptionManagerModal: React.FC<SubscriptionManagerModalProps> = ({
  isOpen,
  onClose,
  subscription,
  userTransaction,
  onCancelSubscription,
  onRequestRefund,
  onOpenNewSubscription,
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundSubmitted, setRefundSubmitted] = useState(false);

  if (!isOpen) return null;

  const isPending = subscription.status === 'pending';
  const isActive = subscription.status === 'active';
  const isCancelled = subscription.status === 'cancelled';
  const isRefundRequested = userTransaction?.status === 'refund_requested';
  const isRefunded = userTransaction?.status === 'refunded';

  const handleConfirmCancel = () => {
    onCancelSubscription(cancelReason || 'ব্যবহারকারী নিজ ইচ্ছায় বাতিল করেছেন।');
    setShowCancelModal(false);
  };

  const handleConfirmRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundReason.trim()) return;
    onRequestRefund(refundReason.trim());
    setShowRefundModal(false);
    setRefundSubmitted(true);
    setTimeout(() => setRefundSubmitted(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Sticky Header: Mobile-Safe */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-zinc-850 bg-zinc-950/95 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Crown className="h-5 w-5 fill-amber-400" />
            </div>
            <div>
              <h2 className="font-serif-story text-sm sm:text-base font-bold text-white">
                আমার সাবস্ক্রিপশন ও পাস
              </h2>
              <p className="text-[11px] text-zinc-400">Goppo Kahini Entertainment</p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="flex items-center gap-1 rounded-xl bg-zinc-900 border border-zinc-750 px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">বন্ধ</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* NOTIFICATION: Refund submitted */}
          {refundSubmitted && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-950/40 p-3 text-xs text-amber-300 animate-fadeIn">
              ✓ রিফান্ডের অনুরোধ সফলভাবে জমা হয়েছে! অ্যাডমিন ব্যাংক রেকর্ড যাচাই করে আপনার অ্যাকাউন্টে টাকা ফেরত পাঠাবেন।
            </div>
          )}

          {/* STATUS CARDS */}

          {/* 1. Pending Verification Card */}
          {isPending && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-400 animate-pulse" />
                  <h3 className="font-serif-story text-sm font-bold text-amber-300">
                    যাচাইয়ের অপেক্ষায় (Pending Verification)
                  </h3>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                আপনার পেমেন্ট UTR নম্বরটি অ্যাডমিনের কাছে সফলভাবে জমা আছে। অ্যাডমিন ব্যাংক স্টেটমেন্টে রিসিভ হওয়া নিশ্চিত করার সঙ্গে সঙ্গে আপনার পাস সক্রিয় (Approve) করে দেবেন।
              </p>

              <div className="bg-black/40 rounded-xl p-3 border border-zinc-800 text-[11px] space-y-1 font-mono text-zinc-300">
                <div>প্ল্যান: <span className="font-bold text-white">{subscription.planName}</span></div>
                <div>পরিশোধ: <span className="font-bold text-pink-400">₹{subscription.price}</span></div>
                {subscription.pendingUtr && (
                  <div>আপনার UTR: <span className="font-bold text-pink-300">{subscription.pendingUtr}</span></div>
                )}
              </div>
            </div>
          )}

          {/* 2. Active Subscription Card */}
          {isActive && (
            <div className="rounded-2xl border border-purple-900/40 bg-black/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">বর্তমান প্ল্যান</span>
                  <h3 className="font-serif-story text-base font-bold text-white mt-0.5">
                    {subscription.planName}
                  </h3>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-pink-500/20 border border-pink-500/30 px-2.5 py-0.5 text-xs font-bold text-pink-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  সক্রিয় (Active)
                </span>
              </div>

              <div className="flex items-baseline gap-1 text-pink-400 font-serif-story text-xl font-bold">
                ₹{subscription.price}
                <span className="text-xs text-zinc-400 font-sans">
                  / {subscription.period === 'year' ? 'বছর' : subscription.period === 'month' ? 'মাস' : 'আজীবন'}
                </span>
              </div>

              <div className="pt-3 border-t border-zinc-850 space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                    শুরুর তারিখ:
                  </span>
                  <span className="text-white font-mono">{subscription.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                    মেয়াদ শেষ / রিনিউয়াল:
                  </span>
                  <span className="text-white font-mono">{subscription.subscriptionExpiryDate || subscription.nextBillingDate}</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Refund Requested Notice */}
          {isRefundRequested && (
            <div className="rounded-2xl border border-purple-500/50 bg-purple-950/30 p-3.5 text-xs text-zinc-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-pink-300 font-bold">
                <RotateCcw className="h-4 w-4" />
                <span>রিফান্ডের অনুরোধ বিবেচনাধীন</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                আপনার রিফান্ডের অনুরোধটি অ্যাডমিনের কাছে জমা আছে। জয় (সুপার অ্যাডমিন) ব্যাংক অ্যাকাউন্ট থেকে রিফান্ড পাঠানোর পর স্ট্যাটাস &quot;Refunded&quot; হিসেবে আপডেট হবে।
              </p>
            </div>
          )}

          {/* 4. Refunded Notice */}
          {isRefunded && (
            <div className="rounded-2xl border border-purple-500/40 bg-purple-950/30 p-3.5 text-xs text-zinc-300 space-y-1">
              <div className="flex items-center gap-1.5 text-pink-400 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>রিফান্ড সম্পন্ন হয়েছে</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                আপনার পেমেন্ট ব্যাংক/UPI মাধ্যমে ফেরত পাঠানো হয়েছে।
              </p>
            </div>
          )}

          {/* 5. Cancelled Notice */}
          {isCancelled && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-center space-y-2">
              <span className="inline-block rounded-full bg-rose-500/20 border border-rose-500/30 px-3 py-0.5 text-xs font-bold text-rose-300">
                সাবস্ক্রিপশন বাতিলকৃত (Cancelled)
              </span>
              <p className="text-xs text-zinc-400">
                আপনার বর্তমান সাবস্ক্রিপশন বাতিল করা হয়েছে। নতুন পাস নিতে নিচে ক্লিক করুন।
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNewSubscription();
                }}
                className="rounded-xl bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 text-xs font-bold transition-all"
              >
                নতুন পাস সক্রিয় করুন
              </button>
            </div>
          )}

          {/* ACTIONS: REFUND & CANCEL (Only available if active) */}
          {isActive && !isRefundRequested && !isRefunded && (
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between gap-3 text-xs">
                {/* Request Refund */}
                <button
                  type="button"
                  onClick={() => setShowRefundModal(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 font-bold transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>রিফান্ড চান?</span>
                </button>

                {/* Cancel Subscription */}
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-rose-400 hover:border-rose-500/40 transition-all"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>পাস বাতিল করুন</span>
                </button>
              </div>
            </div>
          )}

          {/* DIALOG: REFUND REQUEST */}
          {showRefundModal && (
            <div className="rounded-2xl border border-amber-500/40 bg-zinc-900 p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span className="flex items-center gap-1.5">
                  <RotateCcw className="h-4 w-4" />
                  রিফান্ডের অনুরোধ ফর্ম
                </span>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  বাতিল
                </button>
              </div>

              <div className="bg-black/50 p-2.5 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <div>মূল পেমেন্ট: <span className="font-bold text-white">{subscription.planName} (₹{subscription.price})</span></div>
                {userTransaction?.utrTransactionId && (
                  <div>Transaction UTR: <span className="font-mono text-amber-300">{userTransaction.utrTransactionId}</span></div>
                )}
              </div>

              <form onSubmit={handleConfirmRefund} className="space-y-2.5">
                <div>
                  <label className="text-[11px] text-zinc-300 block mb-1">
                    রিফান্ড চাওয়ার কারণ লিখুন *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="উদা: ভুলবশত দুবার পেমেন্ট হয়েছে / সেবা সংক্রান্ত সমস্যা..."
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full rounded-xl border border-zinc-750 bg-black p-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRefundModal(false)}
                    className="rounded-xl bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300"
                  >
                    ফিরে যান
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold px-3.5 py-1.5 text-xs"
                  >
                    অনুরোধ পাঠান
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* DIALOG: CANCEL SUBSCRIPTION */}
          {showCancelModal && (
            <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <AlertTriangle className="h-4 w-4" />
                <span>আপনি কি নিশ্চিত যে পাসটি বাতিল করবেন?</span>
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed">
                পাস বাতিল করলে আর স্বয়ংক্রিয় রিনিউয়াল হবে না।
              </p>

              <div>
                <label className="text-[11px] text-zinc-300 block mb-1">
                  বাতিল করার কারণ (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  placeholder="উদা: কিছুদিনের জন্য গল্প শোনা বন্ধ রাখব"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="rounded-xl bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
                >
                  না, রাখব
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white px-3.5 py-1.5 text-xs shadow-md"
                >
                  হ্যাঁ, বাতিল করুন
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
