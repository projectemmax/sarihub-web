import { Product } from "@app/models/product.model";
import { Constant } from "@app/services/constant/constant";

export function getImageUrl(url: string): string {
    if (!url) return '';

    // already full URL → DO NOT TOUCH
    if (url.startsWith('http')) return url;

    const clean = url.replace(/^\/?uploads\//, '');

    return `${Constant.UPLOADS_BASE_URL}${clean}`;
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
  const primary =
    item.product?.images?.find((img: any) => img.isPrimary) ??
    item.product?.images?.[0];

  if (primary?.url) {
    return primary.url.startsWith('http')
      ? primary.url
      : `${Constant.UPLOADS_BASE_URL}${primary.url.replace(/^\/?uploads\//, '')}`;
  }

  if (item.product?.imageUrl) {
    return item.product.imageUrl.startsWith('http')
      ? item.product.imageUrl
      : `${Constant.UPLOADS_BASE_URL}${item.product.imageUrl.replace(/^\/?uploads\//, '')}`;
  }

  return 'assets/img/no-image.png';
}