export enum GalleryImageType {
    PRODUCT = 'product',
    VARIANT = 'variant'
}

export interface GalleryImage {
    id: string;
    imageSource: string;
    type: GalleryImageType;
    isPrimary: boolean;

    variantId?: string;
    variantName?: string;
}