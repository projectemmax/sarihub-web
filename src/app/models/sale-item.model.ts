export interface SaleItem {
  saleItemId: number;
  productId: number;

  productName: string;
  productShortName: string;
  categoryName: string;

  productImageUrl: string;
  productPrice: number;
  quantity: number;
}
