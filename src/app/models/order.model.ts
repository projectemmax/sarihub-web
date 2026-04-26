export type OrderStatus =
    | 'PLACED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELLED';

export interface AdminOrder {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    trackingNumber?: string;

    user?: {
        email: string;
        customer?: {
            firstName: string;
            lastName: string;
        };
    };
}