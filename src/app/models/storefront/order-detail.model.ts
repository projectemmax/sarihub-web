export interface OrderDetail {
  id: string;
  status: string;
  placedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;

  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;

  shippingFee: number;
  totalAmount: number;

  messageForSeller?: string;

  items: {
    productName: string;
    productImage?: string;
    quantity: number;
    priceSnapshot: number;
  }[];
}