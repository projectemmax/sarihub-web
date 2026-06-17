export interface CreateBrandPayload {
    name: string;
    description?: string;
    logoUrl?: string;
    isVerified?: boolean;
    isActive?: boolean;
}