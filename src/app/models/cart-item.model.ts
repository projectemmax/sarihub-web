export interface CartItem {
  cartId: number;
  custId: number;
  productId: number;
  quantity: number;

  productShortName: string;
  productName: string;
  categoryName: string;

  productImageUrl: string;
  productPrice: number;

  addedDate: string;
}
