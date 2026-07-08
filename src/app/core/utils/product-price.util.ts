import { Product } from '@app/models/product.model';

export interface ProductPriceSummary {
    minPrice: number;
    maxPrice: number;
    hasVariants: boolean;
    hasPriceRange: boolean;
}

export function getProductPriceSummary(
    product: Product
): ProductPriceSummary {

    const variants = product.variants ?? [];

    if (!variants.length) {
        const price = Number(product.price ?? 0);

        return {
            minPrice: price,
            maxPrice: price,
            hasVariants: false,
            hasPriceRange: false
        };
    }

    const prices = variants.map(v => Number(v.price) || 0);

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return {
        minPrice,
        maxPrice,
        hasVariants: true,
        hasPriceRange: minPrice !== maxPrice
    };
}