import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  BehaviorSubject,
  combineLatest,
  map,
  shareReplay,
  switchMap
} from 'rxjs';

import { SaleService } from '@app/services/sale/sale.service';
import { Sale } from '@app/models/sale.model';
import { SaleItem } from '@app/models/sale-item.model';
import { ApiResponse } from '@app/models/api-response.model';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { SummaryCardsComponent } from '@app/shared/summary-cards/summary-cards.component';

type SaleStatusFilter = 'all' | 'active' | 'canceled';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, SummaryCardsComponent],
  templateUrl: './sales.component.html'
})
export class SalesComponent implements OnInit {

  /* =========================
   * CONSTANTS
   * ========================= */
  readonly pageSize = 10;

  /* =========================
   * UI STATE
   * ========================= */
  isLoading = false;
  isSalePanelVisible = false;
  isDetailsLoading = false;

  /* =========================
   * SEARCH / FILTER STATE
   * ========================= */
  searchCustomerId = '';
  statusFilter: SaleStatusFilter = 'all';

  private customerIdSubject = new BehaviorSubject<number | null>(null);
  customerId$ = this.customerIdSubject.asObservable();

  private statusFilterSubject =
    new BehaviorSubject<SaleStatusFilter>('all');
  statusFilter$ = this.statusFilterSubject.asObservable();

  /* =========================
   * PAGINATION STATE
   * ========================= */
  currentPage = 1;
  private currentPageSubject = new BehaviorSubject<number>(1);
  currentPage$ = this.currentPageSubject.asObservable();

  /* =========================
   * SELECTION STATE
   * ========================= */
  selectedSaleId: number | null = null;
  saleItems: SaleItem[] = [];
  itemImageLoaded: Record<number, boolean> = {};

  /* =========================
   * DATA STREAMS
   * ========================= */

  /** Base sales source (API driven) */
  private baseSales$ = this.customerId$.pipe(
    switchMap(custId =>
      custId
        ? this.saleSrv.getSalesByCustomerId(custId)
        : this.saleSrv.getSales()
    ),
    map((res: ApiResponse<Sale[]>) =>
      (res.data ?? []).slice().sort(
        (a, b) =>
          new Date(b.saleDate).getTime() -
          new Date(a.saleDate).getTime()
      )
    ),
    shareReplay(1)
  );

  /** Status filtered sales */
  private filteredSales$ = combineLatest([
    this.baseSales$,
    this.statusFilter$
  ]).pipe(
    map(([sales, filter]) => {
      if (filter === 'active') {
        return sales.filter(s => !s.isCanceled);
      }
      if (filter === 'canceled') {
        return sales.filter(s => s.isCanceled);
      }
      return sales;
    })
  );

  /* =========================
  * SUMMARY METRICS
  * ========================= */
  summary$ = this.filteredSales$.pipe(
    map(sales => {
      const completed = sales.filter(s => !s.isCanceled);
      const canceled = sales.filter(s => s.isCanceled);

      return {
        totalCount: sales.length,
        completedCount: completed.length,
        canceledCount: canceled.length,
        totalRevenue: completed.reduce(
          (sum, s) => sum + s.totalInvoiceAmount,
          0
        ),
        totalDiscount: completed.reduce(
          (sum, s) => sum + s.discount,
          0
        )
      };
    })
  );


  /** Paged sales */
  pagedSales$ = combineLatest([
    this.filteredSales$,
    this.currentPage$
  ]).pipe(
    map(([sales, page]) => {
      const start = (page - 1) * this.pageSize;
      return sales.slice(start, start + this.pageSize);
    })
  );

  totalPages$ = this.filteredSales$.pipe(
    map(list => Math.max(1, Math.ceil(list.length / this.pageSize)))
  );

  /* =========================
   * CONSTRUCTOR
   * ========================= */
  constructor(
    private saleSrv: SaleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /* =========================
   * INIT
   * ========================= */
  ngOnInit(): void {
    const page = Number(this.route.snapshot.queryParamMap.get('page'));
    const custId = Number(this.route.snapshot.queryParamMap.get('custId'));
    const status =
      this.route.snapshot.queryParamMap.get('status') as SaleStatusFilter;
    const saleId = Number(this.route.snapshot.queryParamMap.get('saleId'));

    if (page > 0) {
      this.currentPage = page;
      this.currentPageSubject.next(page);
    }

    if (custId) {
      this.searchCustomerId = custId.toString();
      this.customerIdSubject.next(custId);
    }

    if (status) {
      this.statusFilter = status;
      this.statusFilterSubject.next(status);
    }

    if (saleId) {
      this.selectedSaleId = saleId;
      this.isSalePanelVisible = true;
      this.openSaleDetailsById(saleId);
    }
  }

  /* =========================
   * SEARCH
   * ========================= */
  onCustomerSearch(value: string): void {
    if (!value) {
      this.clearCustomerSearch();
      return;
    }

    const id = Number(value);
    if (!id) return;

    this.customerIdSubject.next(id);
    this.currentPageSubject.next(1);
    this.updateUrl();
  }

  clearCustomerSearch(): void {
    this.searchCustomerId = '';
    this.customerIdSubject.next(null);
    this.currentPageSubject.next(1);
    this.updateUrl();
  }

  /* =========================
   * FILTER
   * ========================= */
  onStatusFilterChange(filter: SaleStatusFilter): void {
    this.statusFilter = filter;
    this.statusFilterSubject.next(filter);
    this.currentPageSubject.next(1);
    this.updateUrl();
  }

  /* =========================
   * PAGINATION
   * ========================= */
  changePage(page: number): void {
    if (page < 1) return;
    this.currentPage = page;
    this.currentPageSubject.next(page);
    this.updateUrl();
  }

  /* =========================
   * SALE DETAILS
   * ========================= */
  openSaleDetails(sale: Sale): void {
    this.selectedSaleId = sale.saleId;
    this.openSaleDetailsById(sale.saleId);
    this.updateUrl();
  }

  private openSaleDetailsById(saleId: number): void {
    this.isSalePanelVisible = true;
    this.isDetailsLoading = true;
    this.saleItems = [];

    this.saleSrv.getSaleById(saleId).subscribe({
      next: res => {
        if (res.result && res.data) {
          this.saleItems = res.data;
        }
        this.isDetailsLoading = false;
      },
      error: () => {
        this.isDetailsLoading = false;
      }
    });
  }

  closeSaleDetails(): void {
    this.isSalePanelVisible = false;
    this.selectedSaleId = null;
    this.saleItems = [];
    this.updateUrl();
  }

  /* =========================
   * URL SYNC
   * ========================= */
  updateUrl(): void {
    this.router.navigate([], {
      queryParams: {
        page: this.currentPage,
        custId: this.customerIdSubject.value || null,
        status: this.statusFilter !== 'all' ? this.statusFilter : null,
        saleId: this.selectedSaleId || null
      },
      queryParamsHandling: 'merge'
    });
  }

  /* =========================
   * IMAGE HELPERS
   * ========================= */
  onImageLoad(itemId: number): void {
    this.itemImageLoaded[itemId] = true;
  }

  onImageError(event: Event, itemId: number): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/image-placeholder.png';
    this.itemImageLoaded[itemId] = true;
  }
}
