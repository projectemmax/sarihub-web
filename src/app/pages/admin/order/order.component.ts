import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, delay, distinctUntilChanged, finalize, interval, Subject, takeUntil } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminOrdersService } from '@app/services/admin/admin-orders.service';
import { AdminOrder } from '@app/models/order.model';
import { OrderDetailsDialogComponent } from '@app/shared/order-details-dialog/order-details-dialog.component';
import { ShipOrderDialogComponent } from '@app/shared/ship-order-dialog/ship-order-dialog.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatTabsModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
})
export class OrderComponent implements OnInit {
    tabs = [
        'ALL',
        'PLACED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
    ];

    selectedTab = 'ALL';
    searchControl = new FormControl('');

    displayedColumns = [
        'orderNumber',
        'customer',
        'createdAt',
        'total',
        'status',
        'paymentStatus',
        'courier',
        'actions',
    ];

    orders: AdminOrder[] = [];
    total = 0;
    page = 1;
    limit = 10;
    private destroy$ = new Subject<void>();

    readonly showTableSkeleton = signal(false);
    readonly skeletonRows = Array(8);

    constructor(
        private ordersService: AdminOrdersService,
        private dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.loadOrders();

        this.searchControl.valueChanges
        .pipe(debounceTime(400), distinctUntilChanged())
        .subscribe(() => {
            this.page = 1;
            this.loadOrders();
        });

        interval(5000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.loadOrders(false);
            });

    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onTabChange(index: number) {
        this.selectedTab = this.tabs[index];
        this.page = 1;
        this.loadOrders();
    }

    loadOrders(showLoader = true) {
        if (showLoader) {
            this.showLoadingSkeleton();
        }

        this.ordersService
            .getOrders({
                page: this.page,
                limit: this.limit,
                status: this.selectedTab,
                search: this.searchControl.value || '',
            })
            .pipe(
                delay(300),
                finalize(() => {
                    if (showLoader) {
                        this.hideLoadingSkeleton();
                    }
                })
            )
            .subscribe({
                next: (res: any) => {
                    this.orders = res.data;
                    this.total = res.meta.total;
                },
            });

    }

    onPageChange(event: PageEvent) {
        this.page = event.pageIndex + 1;
        this.limit = event.pageSize;
        this.loadOrders();
    }

    openOrder(order: AdminOrder) {
        this.dialog.open(OrderDetailsDialogComponent, {
            width: '1100px',
            maxWidth: '95vw',
            data: order.id,
        });
    }

    getNextAction(status: string): string | null {
        switch (status) {
        case 'PLACED':
            return 'PROCESSING';
        case 'PROCESSING':
            return 'SHIPPED';
        case 'SHIPPED':
            return 'DELIVERED';
        case 'DELIVERED':
            return 'COMPLETED';
        default:
            return null;
        }
    }

    getNextActionLabel(status: string): string {
        switch (status) {
        case 'PLACED':
            return 'Process';
        case 'PROCESSING':
            return 'Ship';
        case 'SHIPPED':
            return 'Deliver';
        case 'DELIVERED':
            return 'Complete';
        default:
            return '';
        }
    }

    updateStatus(order: AdminOrder) {
        const nextStatus = this.getNextAction(order.status);

        if (!nextStatus) return;

        if (nextStatus === 'SHIPPED') {
            this.openShipDialog(order);
            return;
        }

        this.ordersService
        .updateStatus(order.id, { status: nextStatus })
        .subscribe(() => this.loadOrders());
    }

    openShipDialog(order: AdminOrder) {
        const dialogRef = this.dialog.open(ShipOrderDialogComponent, {
            width: '620px',
            maxWidth: '95vw',
            data: order,
        });

        dialogRef.afterClosed().subscribe(payload => {
            if (!payload) return;

            this.ordersService
                .shipOrder(order.id, payload)
                .subscribe(() => this.loadOrders());
        });
    }

    clearSearch(): void {
        this.searchControl.setValue('');
    }

    getStatusBadge(status: string): string {
        switch (status) {
            case 'PLACED':
            return 'badge-warning';
            case 'PROCESSING':
            return 'badge-info';
            case 'SHIPPED':
            return 'badge-primary';
            case 'DELIVERED':
            return 'badge-success';
            case 'COMPLETED':
            return 'badge-success';
            case 'CANCELLED':
            return 'badge-danger';
            default:
            return 'badge-secondary';
        }
    }

    getPaymentBadge(status: string): string {
        switch (status) {
            case 'PENDING':
            return 'badge-warning';
            case 'PAID':
            return 'badge-success';
            case 'FAILED':
            return 'badge-danger';
            case 'EXPIRED':
            return 'badge-dark';
            default:
            return 'badge-secondary';
        }
    }

    //SKELETON LOADERS
    private showLoadingSkeleton() {
        this.showTableSkeleton.set(true);
    }

    private hideLoadingSkeleton() {
        this.showTableSkeleton.set(false);
    }

}
