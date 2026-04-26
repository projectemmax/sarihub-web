import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StorefrontOrdersService } from '@app/services/storefront/storefront-orders.service';
import { Constant } from '@app/services/constant/constant';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.scss']
})
export class OrderSuccessComponent implements OnInit {

    order: any;

    constructor(
        private route: ActivatedRoute,
        private orderService: StorefrontOrdersService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            const orderId = params['orderId'];

            if (!orderId) {
                this.router.navigate(['/storefront']);
                return;
            }

            this.orderService.getOrder(orderId).subscribe((res: any) => {
                this.order = res.data ?? res;
            });
        });
    }

    getImageUrl(path?: string): string {
        if (!path) return 'assets/no-image.png';

        return `${Constant.UPLOADS_BASE_URL}${path.replace('/uploads/', '')}`;
    }

}