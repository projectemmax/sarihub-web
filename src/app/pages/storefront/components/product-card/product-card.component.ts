import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '@app/models/product.model';
import { Constant } from '@app/services/constant/constant';
import { Router, RouterLink } from '@angular/router';
import { getProductImageUrl } from '@app/core/utils/image.util';
import {
    getProductPriceSummary
} from '@app/core/utils/product-price.util';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
    @Input() product!: Product;
    @Output() add = new EventEmitter<Product>();

    getProductImageUrl = getProductImageUrl;
    getProductPriceSummary = getProductPriceSummary;

    constructor(private router: Router) {}

    onAddToCart(): void {
        if ((this.product?.stock ?? 0) <= 0) {
            return;
        }

        this.add.emit(this.product);
    }

    isOutOfStock(product: Product): boolean {
        return Number(
            this.product?.stock ?? 0
        ) <= 0;
    }

    


}
