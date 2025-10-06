import { ReviewRatingScore } from '../models/BusinessReview';

export interface CreateBusinessReview {
  rating: ReviewRatingScore;
  comment: string;
  businessId: string;
}
