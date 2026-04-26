import { Product } from './product.model';

export function createEmptyProduct(): Product {
  return {
    id: '',
    slug: '',
    sku: '',
    name: '',
    description: '',
    imageUrl: '',

    price: 0,
    stock: 0,
    categoryId: '',

    rating: 0,
    reviewCount: 0,

    // ✅ NEW FLAGS
    isFeatured: false,
    isBestSeller: false,

    isActive: true,
    status: 'DRAFT',
  };
}