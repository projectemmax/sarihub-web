import { ApiMeta } from "./api-response.model";
import { Product } from "./product.model";

export interface ProductListResponse {
  data: Product[];
  meta: ApiMeta;
}