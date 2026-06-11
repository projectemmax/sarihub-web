export interface SellerReview {
    _id: string;

    rating: number;
    comment: string;

    images?: string[];

    createdAt: string;

    product: {
        _id: string;
        name: string;
        slug: string;
        images?: {
            url: string;
        }[];
    };

    user: {
        _id: string;
        customer?: {
            firstName?: string;
            lastName?: string;
        };
    };
}