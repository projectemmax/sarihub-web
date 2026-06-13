export interface ProductPayload {
  sku: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;

  imageUrl?: string;
  description?: string;
  shortDescription?: string;
  seoDescription?: string;
  status?: 'DRAFT' | 'PUBLISHED';
}
