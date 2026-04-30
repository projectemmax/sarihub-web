import { Product } from "@app/models/product.model";
import { Constant } from "@app/services/constant/constant";

export function getImageUrl(url: string): string {
    if (!url) return '';

    // already full URL → DO NOT TOUCH
    if (url.startsWith('http')) return url;

    const clean = url.replace(/^\/?uploads\//, '');

    return `${Constant.UPLOADS_BASE_URL}${clean}`;
}

export function getImageUrlCloudinary(publicId: string, width = 100) {
  if (!publicId) return '/assets/img/no-image.png';

  // Cloudinary case
  if (!publicId.startsWith('http')) {
    return `https://res.cloudinary.com/dygz1olfn/image/upload/w_${width},c_fill,f_auto,q_auto/${publicId}`;
  }

  // fallback (old images)
  return publicId;
}

export function getProductImageUrl(product: Product): string {
    // ✅ PRIORITY 1 — new images table
    if (product.images?.length) {
        const primary =
        product.images.find(img => img.isPrimary) ||
        product.images[0];

        if (primary?.url) {

        // 🔥 FIX: already full URL
        if (primary.url.startsWith('http')) {
            return primary.url;
        }

        // 🔥 fallback for relative path
        const clean = primary.url.replace(/^\/?uploads\//, '');

        return `${Constant.UPLOADS_BASE_URL}${clean}`;
        }
    }

    // ✅ FALLBACK — old imageUrl
    if (product.imageUrl) {

        if (product.imageUrl.startsWith('http')) {
        return product.imageUrl;
        }

        const clean = product.imageUrl.replace(/^\/?uploads\//, '');

        return `${Constant.UPLOADS_BASE_URL}${clean}`;
    }

    return 'assets/img/no-image.png';
}

export function getItemImage(item: any): string {
  // ✅ 1. Use productImage FIRST (from order snapshot)
  if (item.productImage) {
    return item.productImage.startsWith('http')
      ? item.productImage
      : `${Constant.UPLOADS_BASE_URL}${item.productImage.replace(/^\/?uploads\//, '')}`;
  }

  // ✅ 2. fallback to product.images (if available)
  const primary =
    item.product?.images?.find((img: any) => img.isPrimary) ??
    item.product?.images?.[0];

  if (primary?.url) {
    return primary.url.startsWith('http')
      ? primary.url
      : `${Constant.UPLOADS_BASE_URL}${primary.url.replace(/^\/?uploads\//, '')}`;
  }

  return 'assets/img/no-image.png';
}