export interface CartValidationResponse {
  valid: boolean;
  items: {
    productId: string;
    name: string;
    requestedQty: number;
    availableStock: number;
    valid: boolean;
    adjustedQty?: number;
    message?: string;
  }[];
}