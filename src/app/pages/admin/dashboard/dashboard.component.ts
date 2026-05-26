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
import { getImageUrl } from '@app/core/utils/image.util';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/auth/auth.service';


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

    getImageUrl = getImageUrl;

    // =========================
    // SKELETON HELPER
    readonly statsCardSkeleton = Array.from({ length: 4 });
    readonly statSkeleton = Array.from({ length: 3 });
    readonly productSkeleton = Array.from({ length: 5 });
    readonly reviewSkeleton = Array.from({ length: 4 });

    trackByIndex = (i: number) => i;

    constructor(
        private dashboardService: DashboardService,
        public facade: DashboardFacade,
        private router: Router,
        private authService: AuthService,
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

    console.log(
        'DASHBOARD RESPONSE',
        res
    );

    const stats =
        res.stats?.data
        ?? res.stats;

    const customers =
        res.customers?.data
        ?? res.customers;

    const reviews =
        res.reviews?.data
        ?? res.reviews;

    this.stats = {

        orders:
            Number(
                stats?.orders ?? 0
            ),

        sales:
            Number(
                stats?.sales ?? 0
            ),

        customers:
            Number(
                stats?.customers ?? 0
            ),

        pendingReviews:
            Number(
                stats?.pendingReviews ?? 0
            )
    };

    this.analytics =
        res.analytics;

    // already array
    this.topProducts =
        res.products;

    // unwrap only these
    this.customers =
        customers ?? [];

    this.reviews =
        reviews ?? [];

    this.isLoading =
        false;
},
            error: (err) => {
                console.error('Dashboard load error:', err);
                this.errorMessage = 'Failed to load dashboard data.';
                this.isLoading = false;
            }
        });
    }

    canOpenProducts(): boolean {
        return this.authService.isAdmin();
    }

    viewAllProducts(): void {

        if (
            !this.canOpenProducts()
        ) {
            return;
        }

        this.router.navigate([
            '/admin/products'
        ]);

    }

    openProduct(
        product: any
    ): void {

        if (
            !this.canOpenProducts()
        ) {
            return;
        }

        this.router.navigate([
            '/admin/products'
        ]);

    }



}