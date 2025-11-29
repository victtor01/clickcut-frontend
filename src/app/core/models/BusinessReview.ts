import { Business } from './Business';

export interface Review {
  id: string;
  rating: ReviewRatingScore;
  authorId: string;
  avatarUrl?: string;
  authorName: string;
  comment?: string;
  createdAt: Date;
}

export interface BusinessReview extends Review {
  businessId: string;
  business?: Business;
  reply?: string;
  repliedAt?: Date;
}

export type ReviewRatingScore =
  | 0 
  | 1 
  | 2 
  | 3 
  | 4 
  | 5;

export const ReviewRatingScoreLabels: Record<ReviewRatingScore, string> = {
  0: 'Not Rated',
  1: 'Terrible',
  2: 'Bad',
  3: 'Regular',
  4: 'Good',
  5: 'Excellent',
};
