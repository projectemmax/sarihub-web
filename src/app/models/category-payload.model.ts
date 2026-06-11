export interface CategoryPayload {
    name: string;
    parentId?: string | null;
    isActive?: boolean;
    sortOrder?: number;
}