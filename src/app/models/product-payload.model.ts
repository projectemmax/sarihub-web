export interface ProductPayload {
  sku: string;
  name: string;

  categoryId: string;

  price?: number;
  stock?: number;

  brandId?: string | null;

  imageUrl?: string;

  description?: string;
  shortDescription?: string;
  seoDescription?: string;

  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

  isFeatured?: boolean;
  isBestSeller?: boolean;

  variantOptions?: any[];
  variants?: any[];
  images?: any[];
}