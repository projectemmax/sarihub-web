export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;

  priceRange?: {
    min: number;
    max: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string | null;
  data: T;
  meta?: ApiMeta;
}
