import { ItemReview } from '../types';

export const INITIAL_REVIEWS: ItemReview[] = [
  {
    id: 'rev-1',
    itemId: 'story-1', // নিশুতি রাতের ডাক
    itemTitle: 'নিশুতি রাতের ডাক',
    itemType: 'story',
    userName: 'অনির্বাণ ঘোষ',
    rating: 5,
    comment: 'অসাধারণ সাউন্ড এফেক্ট আর গা ছমছমে আবহ! হেডফোন লাগিয়ে শুনলে গায়ে কাঁটা দেয়। জয়ের ভয়েস মড্যুলেশন দারুণ।',
    createdAt: '২ দিন আগে',
    likes: 18,
  },
  {
    id: 'rev-2',
    itemId: 'story-1',
    itemTitle: 'নিশুতি রাতের ডাক',
    itemType: 'story',
    userName: 'প্রিয়াঙ্কা রায়',
    rating: 5,
    comment: 'বৃষ্টির শব্দের সাথে এই গল্পটা শোনা এক অবিশ্বাস্য অভিজ্ঞতা। এমন রোমাঞ্চ বহু বছর পর শুনলাম।',
    createdAt: '৪ দিন আগে',
    likes: 12,
  },
  {
    id: 'rev-3',
    itemId: 'story-2', // সুন্দরবনের বাঘ ও ডাকাত
    itemTitle: 'কালীঘাটের প্রাচীন সিন্দুক',
    itemType: 'story',
    userName: 'সৌমেন চক্রবর্তী',
    rating: 5,
    comment: 'ঐতিহাসিক রহস্য আর প্লট টুইস্ট সত্যিই অবাক করেছে। প্রতিটি মিনিট উত্তেজনাপূর্ণ।',
    createdAt: '১ সপ্তাহ আগে',
    likes: 9,
  },
  {
    id: 'rev-4',
    itemId: 'story-3', // বৃষ্টির দিনে মেঘে ঢাকা মন
    itemTitle: 'বৃষ্টির দিনে মেঘে ঢাকা মন',
    itemType: 'story',
    userName: 'তানজিলা হক',
    rating: 5,
    comment: 'একদম মনে ছুঁয়ে যাওয়ার মতো মিষ্টি প্রেমের গল্প। আবহ সঙ্গীতের সাথে কথকের কণ্ঠ অপূর্ব।',
    createdAt: '৩ দিন আগে',
    likes: 15,
  },
  {
    id: 'rev-5',
    itemId: 'life-1', // নদীর সাথে ৪৫ বছর লড়াই
    itemTitle: 'নদীর সাথে ৪৫ বছর লড়াই',
    itemType: 'life_story',
    userName: 'কৌশিক ব্যানার্জী',
    rating: 5,
    comment: 'বাস্তব জীবনের এই সত্য লড়াই কোনো সিনেমার চেয়ে কম নয়। রহমত কাকার মুখের বর্ণনা শুনে চোখে জল এসে গেল।',
    createdAt: '৫ দিন আগে',
    likes: 27,
  },
  {
    id: 'rev-6',
    itemId: 'life-2', // মধ্যরাতের শ্মশান ও এক বৃদ্ধের স্মৃতি
    itemTitle: 'মধ্যরাতের শ্মশান ও এক বৃদ্ধের স্মৃতি',
    itemType: 'life_story',
    userName: 'রুপম দাস',
    rating: 5,
    comment: 'বাস্তব অভিজ্ঞতার এমন সৎ বর্ণনা খুব বিরল। অসাধারণ পডকাস্ট সিরিজ, ২০ টাকার পাস একদম সার্থক!',
    createdAt: '১ সপ্তাহ আগে',
    likes: 31,
  }
];

export const getStoredReviews = (): ItemReview[] => {
  try {
    const saved = localStorage.getItem('goppo_item_reviews_v1');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load reviews:', e);
  }
  return INITIAL_REVIEWS;
};

export const saveReview = (newReview: ItemReview): ItemReview[] => {
  const current = getStoredReviews();
  const updated = [newReview, ...current];
  try {
    localStorage.setItem('goppo_item_reviews_v1', JSON.stringify(updated));
    window.dispatchEvent(new Event('goppo_reviews_updated'));
  } catch (e) {
    console.error('Failed to save review:', e);
  }
  return updated;
};

export const getReviewsForItem = (reviews: ItemReview[], itemId: string): ItemReview[] => {
  return reviews.filter((r) => r.itemId === itemId);
};

export const calculateAverageRating = (reviews: ItemReview[], fallbackRating = 4.9): { avg: number; count: number } => {
  if (!reviews || reviews.length === 0) {
    return { avg: fallbackRating, count: 1 };
  }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = Number((sum / reviews.length).toFixed(1));
  return { avg, count: reviews.length };
};
