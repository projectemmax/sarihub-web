import { ProductApi } from './product-api.model';
import { Product } from './product.model';

export function mapProductApiToUi(
  api: ProductApi,
  categoryName: string
): Product {
  return {
    id: api.id,
    sku: api.sku,
    name: api.name,
    description: api.description,
    price: api.price,
    stock: api.stock,
    imageUrl: api.imageUrl,
    isActive: api.isActive,
    status: api.status,
    category: {
      id: api.categoryId,
      name: categoryName,
    },
  };
}
