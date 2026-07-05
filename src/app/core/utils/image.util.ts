import { Product } from "@app/models/product.model";
import { Constant } from "@app/services/constant/constant";

function normalizeUploadUrl(url: string): string {
    if (!url) return '';

    const localUploadMatch = url.match(/^https?:\/\/localhost:\d+\/uploads\/(.+)$/);
    if (localUploadMatch?.[1]) {
        return `${Constant.UPLOADS_BASE_URL}${localUploadMatch[1]}`;
    }

    if (url.startsWith('http')) return url;

    const clean = url.replace(/^\/?uploads\//, '');
    return `${Constant.UPLOADS_BASE_URL}${clean}`;
}

export function getImageUrl(url: string): string {
    return normalizeUploadUrl(url);
}

export function getImageUrlCloudinary(
    publicId: string,
    width = 100,
    height?: number
): string {
    if (!publicId) {
        return '/assets/img/no-image.png';
    }

    if (!publicId.startsWith('http')) {
        const transformation = height
            ? `w_${width},h_${height},c_fill,g_auto,f_auto,q_auto`
            : `w_${width},c_fit,f_auto,q_auto`;

        return `https://res.cloudinary.com/dygz1olfn/image/upload/${transformation}/${publicId}`;
    }

    return publicId;
}

export function getProductImageUrl(product: Product): string {
    // ✅ PRIORITY 1 — new images table
    if (product.images?.length) {
        const primary =
        product.images.find(img => img.isPrimary) ||
        product.images[0];

        if (primary?.url) {

        return normalizeUploadUrl(primary.url);
        }
    }

    // ✅ FALLBACK — old imageUrl
    if (product.imageUrl) {

        return normalizeUploadUrl(product.imageUrl);
    }

    return 'assets/img/no-image.png';
}

export function getItemImage(item: any): string {
  // ✅ 1. Use productImage FIRST (from order snapshot)
  if (item.productImage) {
    return normalizeUploadUrl(item.productImage);
  }

  // ✅ 2. fallback to product.images (if available)
  const primary =
    item.product?.images?.find((img: any) => img.isPrimary) ??
    item.product?.images?.[0];

  if (primary?.url) {
    return normalizeUploadUrl(primary.url);
  }

  return 'assets/img/no-image.png';
}

export function getReviewImage(review: any): string {

    const firstImage = review.images?.[0];

    if (firstImage?.url) {
        return firstImage.url;
    }

    return 'assets/img/no-image.png';

}
