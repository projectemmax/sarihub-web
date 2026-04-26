import { StorefrontCartItem } from "./storefront-cart-item.model";

export interface CartResponse {
  id: string;
  items: StorefrontCartItem[];
  status: string;
  totalAmount: string;
}