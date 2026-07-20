import { Brand } from './brand.model';

export interface BrandListResponse {
  items: Brand[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}