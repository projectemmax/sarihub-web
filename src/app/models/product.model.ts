import { ProductImageApi } from "./product-image-api.model";
import { ProductVariant } from "./product-variant.model";

// product.model.ts
export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description?: string;
  shortDescription?: string;
  seoDescription?: string;

  price?: number;
  stock?: number;
  imageUrl?: string;

  rating?: number;        // e.g. 4.2
  reviewCount?: number;   // e.g. 18

  categoryId: string;
  category?: {
    id: string;
    name: string;
  };

  brand?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };

  isActive: boolean;

  isFeatured: boolean;
  isBestSeller: boolean;

  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

  variants?: ProductVariant[];
  variantOptions?: any;

  images?: ProductImageApi[];

  createdAt?: string;
  updatedAt?: string;
}
