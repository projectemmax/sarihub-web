import { Component, OnInit } from '@angular/core';
import { AccountService } from 'src/app/services/storefront/storefront-account.service';
import { RecentOrdersComponent } from '../components/recent-orders/recent-orders.component';
import { OrderSummaryComponent } from '../components/order-summary/order-summary.component';
import { AccountDashboard } from '@app/models/storefront/account-dashboard.model';


@Component({
  selector: 'app-account-overview',
  standalone: true,
  imports: [RecentOrdersComponent, OrderSummaryComponent],
  templateUrl: './account-overview.component.html',
})
export class AccountOverviewComponent implements OnInit {

    stats: any = {};
    recentOrders: any[] = [];
    loading = true;

    constructor(private accountService: AccountService) {}

    ngOnInit(): void {
        this.loadDashboard();
    }

    loadDashboard() {
        this.accountService.getDashboard().subscribe({
            next: (dashboard: AccountDashboard) => {
                this.stats = dashboard.orderStats;
                this.recentOrders = dashboard.recentOrders;
                this.loading = false;

                console.log('Dashboard stats:', this.stats);
            }
        });
    }


}