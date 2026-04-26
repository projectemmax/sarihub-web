import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StorefrontCartService } from '@app/services/storefront/storefront-cart.service';
import { StorefrontCartItem } from '@app/models/storefront/storefront-cart-item.model';
import { Observable } from 'rxjs';
import { Constant } from '@app/services/constant/constant';
import { Router } from '@angular/router';
import { getProductImageUrl, getImageUrl } from '@app/core/utils/image.util'
import { SiteConfigService } from '@app/core/services/site-config.service';
import { QuantitySelectorComponent } from '@app/pages/storefront/components/quantity-selector/quantity-selector.component';

@Component({
  standalone: true,
  imports: [CommonModule, QuantitySelectorComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {

    items$!: Observable<StorefrontCartItem[]>;
    subtotal$ = this.cartService.subtotal$;
    cartCount$ = this.cartService.cartCount$;

    quantityErrors: Record<string, string | null> = {};

    getProductImageUrl = getProductImageUrl;
    getImageUrl = getImageUrl;

    constructor(
        private cartService: StorefrontCartService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.items$ = this.cartService.items$;
        this.cartService.loadCart().subscribe();
    }

    onQuantityChange(item: StorefrontCartItem, quantity: number): void {
        const previousQuantity = item.quantity;

        this.quantityErrors[item.id] = null;

        this.cartService.updateQuantity(item.id, quantity).subscribe({
            next: () => item.quantity = quantity,
            error: (err) => {
                const message = err?.error?.message || 'Unable to update quantity';
                this.quantityErrors[item.id] = message;
                item.quantity = previousQuantity;
            }
        });
    }

    remove(item: StorefrontCartItem) {
        this.cartService.remove(item.productId).subscribe();
    }

    trackByItemId(index: number, item: StorefrontCartItem) {
        return item.id;
    }

    goToCheckout() {
        this.router.navigate(['/storefront/checkout']);
    }

    getTotal(subtotal: number): number {
        return subtotal; // ✅ correct
    }
}