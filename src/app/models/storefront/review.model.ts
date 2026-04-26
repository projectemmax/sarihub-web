export interface Review {
  id: string;
  rating: number;
  comment?: string;

  createdAt: string;

  status: ReviewStatus;
  isVerified: boolean;

  helpfulCount: number;

  deletedAt?: string | null;

  images?: ReviewImage[];

  user?: {
    customer?: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface ReviewImage {
  id: string;
  url: string;
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}