export interface Brand {
  id: string;

  name: string;
  slug: string;

  description?: string;
  logoUrl?: string;

  isVerified: boolean;
  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;

  _count?: {
    products: number;
  };
}