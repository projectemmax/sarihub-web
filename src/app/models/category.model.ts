export interface Category {
  id: string;
  name: string;
  slug: string; 
  description?: string;
  parentId?: string; // for sub-categories
  isActive: boolean;
  productCount?: number;

  variantTemplate?: {
    attributes: string[];
  };

  createdAt: Date;
  deletedAt?: string | null;
}
