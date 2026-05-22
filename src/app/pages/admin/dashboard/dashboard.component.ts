import {
  Component,
  OnInit,
  inject,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DashboardService } from '@app/services/admin/admin-dashboard.service';
import {
  DashboardStats,
  TopProduct,
  LatestCustomer,
  PendingReview,
  Analytics
} from '@app/models/dashboard.model';

import { AnalyticsChartComponent } from '@app/shared/analytics-chart/analytics-chart.component';
import { DashboardFacade } from './dashboard.facade';
import { FiltersComponent } from '@app/shared/ui/filters.component';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AnalyticsChartComponent,
    FiltersComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

    private destroyRef = inject(DestroyRef);

    // =========================
    // STATE
    // =========================
    isLoading = true;
    errorMessage: string | null = null;

    stats: DashboardStats = {
        orders: 0,
        sales: 0,
        customers: 0,
        pendingReviews: 0
    };

    topProducts: TopProduct[] = [];
    customers: LatestCustomer[] = [];
    reviews: PendingReview[] = [];

    analytics: Analytics = {
        timeline: [],
        totalRevenue: 0,
        totalOrders: 0,
        growth: 0
    };

    constructor(
        private dashboardService: DashboardService,
        public facade: DashboardFacade
    ) {
        console.log('AnalyticsChartComponent loaded');
    }

    // =========================
    // INIT
    // =========================
    ngOnInit(): void {
        this.loadDashboard();
    }

    // =========================
    // LOAD DATA
    // =========================
    private loadDashboard(): void {
        this.isLoading = true;
        this.errorMessage = null;

        forkJoin({
                stats: this.dashboardService.getStats(),
                analytics: this.dashboardService.getAnalytics('7D'),
                products: this.dashboardService.getTopProducts(),
                customers: this.dashboardService.getLatestCustomers(),
                reviews: this.dashboardService.getPendingReviews()
            })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (res) => {

                this.stats = {
                ...res.stats,
                sales: Number(res.stats.sales)
                };

                this.analytics = res.analytics;

                this.topProducts = res.products;
                this.customers = res.customers;
                this.reviews = res.reviews;

                this.isLoading = false;
            },
            error: (err) => {
                console.error('Dashboard load error:', err);
                this.errorMessage = 'Failed to load dashboard data.';
                this.isLoading = false;
            }
        });
    }
}