import { CartItem } from "../cart-item.model";

export interface Cart {
    id: string;
    items: CartItem[];
    totalAmount: number;
}