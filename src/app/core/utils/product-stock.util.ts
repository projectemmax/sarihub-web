import { Product } from '@app/models/product.model';

export interface ProductStockSummary {
    totalStock: number;
    hasVariants: boolean;
    isOutOfStock: boolean;
}

export function getProductStockSummary(
    product: Product
): ProductStockSummary {

    const variants = product.variants ?? [];

    if (!variants.length) {

        const stock = Number(product.stock ?? 0);

        return {
            totalStock: stock,
            hasVariants: false,
            isOutOfStock: stock <= 0
        };
    }

    const totalStock = variants.reduce(
        (sum, variant) => sum + Number(variant.stock ?? 0),
        0
    );

    return {
        totalStock,
        hasVariants: true,
        isOutOfStock: totalStock <= 0
    };

}