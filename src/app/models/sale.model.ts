export interface Sale {
  saleId: number;
  custId: number;
  saleDate: string;            // ISO date string from API
  totalInvoiceAmount: number;
  discount: number;
  paymentNaration: string;
  deliveryAddress1: string;
  deliveryAddress2: string;
  deliveryCity: string;
  deliveryPinCode: string;
  deliveryLandMark: string;
  isCanceled: boolean;
}
