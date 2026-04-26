import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Constant } from '@app/services/constant/constant';
import { StorefrontOrdersService } from '@app/services/storefront/storefront-orders.service'
import { PaymentService } from '@app/services/storefront/storefront-payment.service';
import { PaymentTimelineComponent } from "../../components/payment-timeline/payment-timeline.component";
import { getProductImageUrl, getImageUrl } from "@app/core/utils/image.util";

interface OrderItem {
  name: string;
  image: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PaymentTimelineComponent],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent {

    Constant = Constant;

    order: any;
    orderId: string | null = null;
    items: any[] = [];
    timeline: any[] = [];
    attempts: any[] = [];
    getImageUrl = getImageUrl;
    getProductImageUrl = getProductImageUrl;

    formatDate(date: string) {
        return date ? date.split('T')[0] : null;
    }

    constructor(
        private route: ActivatedRoute,
        private storefrontOrdersService: StorefrontOrdersService,
        private paymentService: PaymentService
    ) {}

    ngOnInit() {
        this.orderId = this.route.snapshot.paramMap.get('id');

        console.log('Order ID from route:', this.orderId);

        if (!this.orderId) return;

        // ✅ Load order FIRST
        this.storefrontOrdersService.getOrderById(this.orderId).subscribe({
            next: (order: any) => {
            this.order = order;
            this.items = order.items;
            this.buildTimeline(order);

            // ✅ THEN load attempts (correct timing)
            this.loadAttempts();
            }
        });
    }

    loadAttempts() {
        if (!this.orderId) return;

        this.paymentService.getAttempts(this.orderId)
            .subscribe((res: any) => {
            this.attempts = res.data ?? res;

            // 🔥 ensure latest first
            this.attempts.sort((a, b) => b.attemptNo - a.attemptNo);
        });
    }

    retryPayment() {
        if (!this.orderId) return;

        // 👉 you can later make this dynamic (GCASH/MAYA)
        const method = 'GCASH';

        this.paymentService.retry(this.orderId, method)
            .subscribe({
            next: (res: any) => {
                if (res?.redirectUrl) {
                window.location.href = res.redirectUrl;
                } else {
                alert('No redirect URL returned');
                }
            },
            error: (err) => {
                console.error(err);
                alert('Retry failed');
            }
        });
    }

    buildTimeline(order: any) {
        const steps = [
            { key: 'placedAt', label: 'PLACED' },
            { key: 'paidAt', label: 'PAID' },
            { key: 'shippedAt', label: 'SHIPPED' },
            { key: 'deliveredAt', label: 'DELIVERED' }
        ];

        this.timeline = steps.map(step => {
            let completed = !!order[step.key];
            let date = order[step.key];

            // 🔥 Fallback logic based on status
            if (!completed) {
                if (step.label === 'PAID' && ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
                    completed = true;
                    date = order.updatedAt; // fallback date
                }

                if (step.label === 'SHIPPED' && ['SHIPPED', 'DELIVERED'].includes(order.status)) {
                    completed = true;
                    date = order.shippedAt || order.updatedAt;
                }

                if (step.label === 'DELIVERED' && order.status === 'DELIVERED') {
                    completed = true;
                    date = order.deliveredAt || order.updatedAt;
                }
            }

            return {
                status: step.label,
                date,
                completed
            };
        });
    }

    getProgressWidth() {
        const lastCompletedIndex = this.timeline
            .map(s => s.completed)
            .lastIndexOf(true);

        if (lastCompletedIndex <= 0) return '0%';

        const percent = (lastCompletedIndex / (this.timeline.length - 1)) * 100;

        return percent + '%';
    }

    get latestPayment() {
        return this.attempts?.[0]; // already sorted desc
    }

    formatMethod(method: string) {
        const map: any = {
            GCASH: 'GCash',
            MAYA: 'Maya',
            CARD: 'Card',
            COD: 'Cash on Delivery'
        };
        return map[method] || method;
    }

}