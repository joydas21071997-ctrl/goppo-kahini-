import { ItemReview } from '../types';

export const INITIAL_REVIEWS: ItemReview[] = [];

export const getStoredReviews = (): ItemReview[] => {
  return [];
};

export const saveReview = (newReview: ItemReview): ItemReview[] => {
  return [newReview];
};

export const getReviewsForItem = (reviews: ItemReview[], itemId: string): ItemReview[] => {
  return reviews.filter((r) => r.itemId === itemId);
};

export const calculateAverageRating = (reviews: ItemReview[], fallbackRating = 0): { avg: number; count: number } => {
  if (!reviews || reviews.length === 0) {
    return { avg: fallbackRating, count: 0 };
  }
  const valid = reviews.filter((r) => typeof r.rating === 'number' && r.rating >= 1 && r.rating <= 5);
  if (valid.length === 0) {
    return { avg: fallbackRating, count: 0 };
  }
  const sum = valid.reduce((acc, r) => acc + r.rating, 0);
  const avg = Number((sum / valid.length).toFixed(1));
  return { avg, count: valid.length };
};
