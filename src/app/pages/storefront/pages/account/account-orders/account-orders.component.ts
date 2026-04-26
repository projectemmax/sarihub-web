import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AccountService } from '@app/services/storefront/storefront-account.service';
import { Constant } from '@app/services/constant/constant';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { StorefrontCartService } from '@app/services/storefront/storefront-cart.service';
import { PaginationComponent } from "@app/shared/pagination/pagination.component";
import {getProductImageUrl, getItemImage, getImageUrl } from "@app/core/utils/image.util";


interface OrderItem {
    name: string;
    image: string;
    qty: number;
}

interface Order {
    id: string;
    status: string;
    date: string;
    total: number;
    items: OrderItem[];
}

@Component({
  selector: 'app-account-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, MatSnackBarModule, PaginationComponent],
  templateUrl: './account-orders.component.html',
  styleUrls: ['./account-orders.component.scss']
})
export class AccountOrdersComponent implements OnInit {

    activeTab: string = 'ALL';

    orders: any[] = [];
    loading = true;
    page = 1;
    limit = 5;
    totalPages = 1;
    getProductImageUrl = getProductImageUrl;
    getItemImage = getItemImage;
    getImageUrl = getImageUrl;

    constructor(
        private accountService: AccountService,
        private storefrontCartService: StorefrontCartService,
        private snackBar: MatSnackBar,
        private router: Router,
        private route: ActivatedRoute
    ){}

    ngOnInit() {

        this.route.queryParams.subscribe(params => {
            this.activeTab = params['tab'] || 'ALL';
            this.page = Number(params['page'] || 1);
            this.loadOrders();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
        });
    }

    

    setTab(tab: string) {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { tab, page: 1 },
            queryParamsHandling: 'merge'
        });
    }

    get filteredOrders() {
        if (this.activeTab === 'ALL') {
            return this.orders;
        }

        return this.orders.filter(
            (o: any) => o.status === this.activeTab
        );
    }

    imageUrl(path?: string) {
        if (!path) {
            return 'assets/img/no-image.png';
        }

        return Constant.UPLOADS_BASE_URL + path.replace('/uploads/', '');
    }

    loadOrders() {

        this.loading = true;

        const status = this.activeTab === 'ALL' ? undefined : this.activeTab;

        this.accountService
            .getMyOrders(this.page, this.limit, status)
            .subscribe({
            next: (res: any) => {

                this.orders = res.data;
                this.totalPages = res.meta?.totalPages ?? 1;

                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    refreshCart() {
        this.storefrontCartService.loadCart().subscribe();
    }

    buyAgain(orderId: string) {
        this.accountService.reorder(orderId).subscribe({
            next: (res: any) => {
                this.refreshCart();
                this.snackBar.open(
                    `${res.results.added} items added to cart`,
                    'View Cart',
                    {
                        duration: 4000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    }
                );
            }
        });
    }

    changePage(page: number) {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { page },
            queryParamsHandling: 'merge'
        });
    }

}