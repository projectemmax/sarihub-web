import { Review } from './review.model';

export interface ReviewResponse {
  rating: number;
  reviewCount: number;
  page: number;
  totalPages: number;
  reviews: Review[];
}