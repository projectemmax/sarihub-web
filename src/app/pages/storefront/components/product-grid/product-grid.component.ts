import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '@app/models/product.model';
import { Constant } from '@app/services/constant/constant';
import { Router, RouterLink } from '@angular/router';
import { StorefrontCartService } from '@app/services/storefront/storefront-cart.service';
import { getProductImageUrl } from '@app/core/utils/image.util';
import { ToastService } from '@app/core/services/toast.service';
import { AuthService } from '@app/core/auth/auth.service';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.scss']
})
export class ProductGridComponent {
    @Input() products: Product[] = [];
    @Input() columns: 3 | 4 = 4;

    getProductImageUrl = getProductImageUrl;

    constructor(
        private router: Router, 
        private cartService: StorefrontCartService,
        private toast: ToastService,
        private authService: AuthService
    ) {}


    addToCart(productId: string): void {
        console.log('Adding to cart:', productId);

        if (!productId) {
            this.toast.error('Invalid product');
            return;
        }

        if (!this.authService.isLoggedIn()) {
            sessionStorage.setItem(
            'pendingCartItem',
            JSON.stringify({
                productId,
                quantity: 1
            })
            );

            this.toast.info('Please sign in to add this item to your cart');

            this.router.navigate(['/login'], {
            queryParams: {
                returnUrl: this.router.url
            }
            });

            return;
        }

        this.cartService.addToCart(productId, 1).subscribe({
            next: () => {
            this.toast.success('Item added to cart');
            },
            error: () => {
            this.toast.error('Failed to add item to cart');
            }
        });
    }

    getMinPrice(variants?: any[]): number {
        if (!variants?.length) return 0;

        return Math.min(...variants.map(v => Number(v.price) || 0));
    }

    getMaxPrice(variants?: any[]): number {
        if (!variants?.length) return 0;

        return Math.max(...variants.map(v => Number(v.price) || 0));
    }

}
