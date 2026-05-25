import { Injectable, signal } from '@angular/core';
import { DashboardService } from '@app/services/admin/admin-dashboard.service';
import { Analytics } from '@app/models/dashboard.model';
import { delay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardFacade {

    range = signal<'1D' | '7D' | '1M' | '1Y'>('7D');
    analytics = signal<Analytics | null>(null);
    analyticsLoading = signal(false);

    constructor(private dashboardService: DashboardService) {
        this.loadAnalytics(); // initial load
    }

    loadAnalytics() {
        const r = this.range();
        this.analyticsLoading.set(true);

        this.dashboardService
            .getAnalytics(r)
            .subscribe({
                next: (res) => {
                    this.analytics.set(res);
                    this.analyticsLoading.set(false);
                },

                error: () => {
                    this.analyticsLoading.set(false);
                }
            });
    }

    setRange(r: '1D' | '7D' | '1M' | '1Y') {
        if (this.range() === r) return; // ✅ prevent duplicate calls

        this.range.set(r);
        this.loadAnalytics();
    }
}