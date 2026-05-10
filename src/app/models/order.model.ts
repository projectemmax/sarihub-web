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
    orderNumber?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    courierName?: string;
    courierCode?: string;
    shippingMethod?: string;
    shippingStatus?: string;
    shippingFee?: number;

    user?: {
        email: string;
        customer?: {
            firstName: string;
            lastName: string;
        };
    };
}
