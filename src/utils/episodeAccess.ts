import { Episode, UserSubscription } from '../types';

export type EpisodeAccessReason = 
  | 'free'
  | 'unlocked'
  | 'needs_pass'
  | 'needs_purchase'
  | 'needs_pass_and_purchase';

export interface EpisodeAccessResult {
  unlocked: boolean;
  reason: EpisodeAccessReason;
  messageBn: string;
  messageEn: string;
  price: number;
}

/**
 * Evaluates whether an Episode is currently playable according to Goppo Kahini business logic:
 * 
 * 1. FREE / TRAILER episodes: Always unlocked for listeners.
 * 2. PAID episodes:
 *    - Must have ACTIVE ₹20 Main Access Pass.
 *    - AND must have purchased this specific Episode (recorded in user's unlockedStoryIds / unlockedEpisodeIds).
 * 
 * Rule: MAIN PASS ACTIVE + EPISODE PURCHASED = UNLOCKED
 * Rule: MAIN PASS EXPIRED + EPISODE PURCHASED = LOCKED (Previous purchase remains saved! When user renews Main Pass, automatically unlocks without paying again).
 * Rule: MAIN PASS ACTIVE + EPISODE NOT PURCHASED = LOCKED (Can be unlocked for episode price, e.g. ₹5).
 */
export function evaluateEpisodeAccess(
  episode: Episode,
  subscription?: UserSubscription | null
): EpisodeAccessResult {
  // 1. Free or Trailer episodes
  if (episode.accessType === 'free' || episode.accessType === 'trailer' || !episode.price || episode.price <= 0) {
    return {
      unlocked: true,
      reason: 'free',
      messageBn: episode.accessType === 'trailer' ? 'ট্রেলার • সবার জন্য উন্মুক্ত' : 'ফ্রি পর্ব • সবার জন্য উন্মুক্ত',
      messageEn: episode.accessType === 'trailer' ? 'Trailer • Free for all' : 'Free Episode • Open to all',
      price: 0,
    };
  }

  const isPassActive = subscription?.status === 'active';
  const isPurchased = Boolean(
    subscription?.unlockedStoryIds?.includes(episode.id) ||
    subscription?.unlockedEpisodeIds?.includes(episode.id)
  );
  const price = episode.price || 5;

  // 2. Main Pass is Active AND Episode is Purchased -> Unlocked!
  if (isPassActive && isPurchased) {
    return {
      unlocked: true,
      reason: 'unlocked',
      messageBn: 'পর্বটি আনলক রয়েছে',
      messageEn: 'Episode is unlocked',
      price,
    };
  }

  // 3. Purchased previously, but Main Pass has expired -> Locked until Pass renewal
  if (!isPassActive && isPurchased) {
    return {
      unlocked: false,
      reason: 'needs_pass',
      messageBn: `এই পর্বটি আপনার পূর্বে কেনা রয়েছে। শুনতে ২০ টাকার অ্যাক্সেস পাস রিনিউ করুন।`,
      messageEn: `You already purchased this episode. Renew your ₹20 Main Access Pass to stream.`,
      price,
    };
  }

  // 4. Main Pass is Active, but this new Episode has NOT been purchased -> Locked with individual price
  if (isPassActive && !isPurchased) {
    return {
      unlocked: false,
      reason: 'needs_purchase',
      messageBn: `এই পর্বটি শুনতে ₹${price} দিয়ে আনলক করুন।`,
      messageEn: `Unlock this episode for ₹${price} to stream.`,
      price,
    };
  }

  // 5. Main Pass is Inactive AND Episode not purchased
  return {
    unlocked: false,
    reason: 'needs_pass_and_purchase',
    messageBn: `এই প্রিমিয়াম পর্বটি শুনতে ২০ টাকার পাস এবং ₹${price} টিকিট প্রয়োজন।`,
    messageEn: `Requires ₹20 Main Access Pass + ₹${price} ticket to unlock.`,
    price,
  };
}
