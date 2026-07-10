import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { getImageUrlCloudinary } from '@app/core/utils/image.util';
import { ProductVariant } from '@app/models/product-variant.model';

@Component({
  selector: 'app-product-variant-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-variant-picker.component.html',
  styleUrl: './product-variant-picker.component.css'
})
export class ProductVariantPickerComponent {

    @Input({ required: true })
    variants: ProductVariant[] = [];

    @Input()
    selectedVariant: ProductVariant | null = null;

    @Output()
    variantSelected = new EventEmitter<ProductVariant>();

    onVariantClick(variant: ProductVariant): void {
        if (variant.stock === 0) {
            return;
        }

        this.variantSelected.emit(variant);
    }

    getVariantLabel(variant: ProductVariant): string {
        if (Array.isArray(variant.attributes)) {
            return variant.attributes.filter(Boolean).join(' / ');
        }

        if (variant.attributes && typeof variant.attributes === 'object') {
            return Object.values(variant.attributes).filter(Boolean).join(' / ');
        }

        return variant.sku;
    }

}
