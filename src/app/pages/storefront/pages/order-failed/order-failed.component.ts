import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StorefrontOrdersService } from '@app/services/storefront/storefront-orders.service';
import { PaymentService } from '@app/services/storefront/storefront-payment.service';

@Component({
  selector: 'app-order-failed',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-failed.component.html',
  styleUrls: ['./order-failed.component.scss']
})
export class OrderFailedComponent implements OnInit {
    order: any;
    orderId: string | null = null;
    isLoading = false;
    selectedMethod: 'GCASH' | 'MAYA' | 'CARD' = 'GCASH';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private orderService: StorefrontOrdersService,
        private paymentService: PaymentService
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.orderId = params['orderId'];

            if (!this.orderId) {
                this.router.navigate(['/storefront']);
                return;
            }

            this.orderService.getOrder(this.orderId).subscribe({
                next: (res: any) => {
                    this.order = res.data ?? res;
                },
                error: () => {
                    this.router.navigate(['/storefront/account/orders']);
                }
            });
        });
    }

    retryPayment() {
        if (!this.orderId) {
            console.error('orderId is missing');
            return;
        }

        this.isLoading = true;

        this.paymentService.retry(this.orderId, this.selectedMethod)
            .subscribe({
            next: (res) => {
                if (res?.redirectUrl) {
                    window.location.href = res.redirectUrl;
                    return;
                }

                console.error('No redirect URL', res);
                alert('Payment could not be started. Please try another method.');
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }
}