export interface ShopFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'latest';
  isFeatured?: boolean;
  isBestSeller?: boolean;
  inStock?: boolean;

  // 🔥 ADD THESE
  priceMin?: number;
  priceMax?: number;

}