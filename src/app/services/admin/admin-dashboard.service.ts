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

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) {}

    // =========================
    // DASHBOARD STATS
    // =========================
    getStats() {
        return this.http
            .get<any>(`${Constant.API_BASE_URL}/${Constant.ADMIN.DASHBOARD.STATS}`)
            .pipe(map(res => res.data)); // ✅ unwrap
    }

    // =========================
    // SALES ANALYTICS
    // =========================
   
    getAnalytics(range: '1D' | '7D' | '1M' | '1Y') {
        return this.http
            .get<any>(
            `${Constant.API_BASE_URL}/${Constant.ADMIN.DASHBOARD.ANALYTICS}?range=${range}`
            )
            .pipe(map(res => res.data)); // ✅ unwrap
    }

    // =========================
    // TOP PRODUCTS
    // =========================
    getTopProducts() {
        return this.http
            .get<any>(
            `${Constant.API_BASE_URL}/${Constant.ADMIN.DASHBOARD.TOP_PRODUCTS}`
            )
            .pipe(map(res => res.data ?? []));
    }

    // =========================
    // LATEST CUSTOMERS
    // =========================
    getLatestCustomers() {
        return this.http
            .get<any>(
            `${Constant.API_BASE_URL}/${Constant.ADMIN.DASHBOARD.LATEST_CUSTOMERS}`
            )
            .pipe(map(res => res.data ?? []));
    }

    // =========================
    // PENDING REVIEWS
    // =========================
    getPendingReviews() {
        return this.http
            .get<any>(
            `${Constant.API_BASE_URL}/${Constant.ADMIN.REVIEWS.PENDING}`
            )
            .pipe(map(res => res.data ?? []));
    }

}