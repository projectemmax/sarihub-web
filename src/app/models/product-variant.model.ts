export interface ProductVariant {
  id: string;
  sku: string;

  price: number;
  stock: number;

  attributes: string[]; // ["250ml", "Bottle"]

  image?: string;

  createdAt?: string;
  updatedAt?: string;
}