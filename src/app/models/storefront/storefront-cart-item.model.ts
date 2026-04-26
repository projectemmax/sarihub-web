export interface StorefrontCartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  priceSnapshot: string;
  quantity: number;
  subtotal: string;

  availableStock?: number;
  error?: string | null;
}