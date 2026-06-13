export interface ProductApi {
  id: string;
  sku: string;
  name: string;
  description?: string;
  shortDescription?: string;
  seoDescription?: string;
  price: number;
  stock: number;
  categoryId: string;
  categoryName?: string;
  imageUrl?: string;
  isActive: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
}
