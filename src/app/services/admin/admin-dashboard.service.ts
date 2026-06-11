import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constant } from '@app/services/constant/constant';
import {
  DashboardStats,
  Analytics,
  TopProduct,
  LatestCustomer,
  PendingReview
} from '@app/models/dashboard.model';
import { map } from 'rxjs';

import { AuthService } from '@app/core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private http: HttpClient,
    private auth: AuthService
) {}

    // =========================
    // DASHBOARD STATS
    // =========================
    getStats() {
        return this.http
            .get<any>(`${Constant.API_BASE_URL}/${
                this.dashboardEndpoint(
                Constant.ADMIN.DASHBOARD.STATS,
                Constant.SELLER.DASHBOARD.STATS
                )}`)
            .pipe(map(res => res.data)); // ✅ unwrap
    }

    // =========================
    // SALES ANALYTICS
    // =========================
   
    getAnalytics(range: '1D' | '7D' | '1M' | '1Y') {
        return this.http
            .get<any>(
            `${Constant.API_BASE_URL}/${
                this.dashboardEndpoint(
                Constant.ADMIN.DASHBOARD.ANALYTICS,
                Constant.SELLER.DASHBOARD.ANALYTICS
                )}?range=${range}`
            )
            .pipe(
                map(
                    res =>
                    this.unwrap<Analytics>(
                        res
                    )
                )
            );
    }

    // =========================
    // TOP PRODUCTS
    // =========================
    getTopProducts() {
        return this.http
            .get<any>(
            `${Constant.API_BASE_URL}/${
                this.dashboardEndpoint(
                Constant.ADMIN.DASHBOARD.TOP_PRODUCTS,
                Constant.SELLER.DASHBOARD.TOP_PRODUCTS
                )}`
            )
            .pipe(map(res => this.unwrap<TopProduct[]>(res))); // ✅ unwrap
    }

    // =========================
    // LATEST CUSTOMERS
    // =========================
    getLatestCustomers() {
        return this.http
            .get<any>(
            `${Constant.API_BASE_URL}/${
                this.dashboardEndpoint(
                Constant.ADMIN.DASHBOARD.LATEST_CUSTOMERS,
                Constant.SELLER.DASHBOARD.LATEST_CUSTOMERS
                )}`
            )
            .pipe(map(res => res.data ?? []));
    }

    // =========================
    // PENDING REVIEWS
    // =========================
    getPendingReviews() {
        return this.http
            .get<any>(
            `${Constant.API_BASE_URL}/${
                this.dashboardEndpoint(
                Constant.ADMIN.DASHBOARD.PENDING_REVIEWS,
                Constant.SELLER.DASHBOARD.PENDING_REVIEWS
                )}`
            )
            .pipe(map(res => res.data ?? []));
    }

    private isSeller(): boolean {
        return this.auth.isSeller();
    }

    private dashboardEndpoint(
        admin: string,
        seller: string
    ): string {

        return this.auth.isSeller()
            ? seller
            : admin;
    }

    private unwrap<T>(
        res: any
    ): T {

        return (
            res?.data?.data
            ?? res?.data
            ?? res
        ) as T;
    }

}