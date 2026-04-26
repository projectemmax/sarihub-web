import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BehaviorSubject, combineLatest, map } from 'rxjs';

import { CustomerService } from '@app/services/customer/customer.service';
import { AdminCustomer } from '@app/models/customer-admin.model';
import { SearchComponent } from '@app/shared/search/search.component';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchComponent, PaginationComponent],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css'
})
export class CustomerComponent implements OnInit {

  // ------------------------
  // CONFIG
  // ------------------------
  readonly pageSize = 10;
  readonly maxPagesToShow = 5;
  private readonly STORAGE_KEY = 'admin_customer_state';

  // ------------------------
  // UI STATE
  // ------------------------
  isLoading = false;
  searchTerm = '';

  // ------------------------
  // PAGINATION STATE
  // ------------------------
  private currentPageSubject = new BehaviorSubject<number>(1);
  currentPage$ = this.currentPageSubject.asObservable();
  currentPage = 1;

  // ------------------------
  // DATA STATE
  // ------------------------
  private customersSource = new BehaviorSubject<AdminCustomer[]>([]);
  customers$ = this.customersSource.asObservable();

  pagedCustomers$ = combineLatest([
    this.customers$,
    this.currentPage$
  ]).pipe(
    map(([customers, page]) => {
      const start = (page - 1) * this.pageSize;
      return customers.slice(start, start + this.pageSize);
    })
  );

  totalPages$ = this.customers$.pipe(
    map(list => Math.max(1, Math.ceil(list.length / this.pageSize)))
  );

  pages$ = combineLatest([
    this.totalPages$,
    this.currentPage$
  ]).pipe(
    map(([totalPages, currentPage]) => {
      const half = Math.floor(this.maxPagesToShow / 2);

      let start = Math.max(currentPage - half, 1);
      let end = Math.min(start + this.maxPagesToShow - 1, totalPages);

      if (end - start + 1 < this.maxPagesToShow) {
        start = Math.max(end - this.maxPagesToShow + 1, 1);
      }

      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    })
  );

  constructor(
    private customerSrv: CustomerService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // ------------------------
  // INIT
  // ------------------------
  ngOnInit(): void {
    const pageParam = Number(this.route.snapshot.queryParamMap.get('page'));
    const searchParam = this.route.snapshot.queryParamMap.get('q');

    if (pageParam) {
      this.currentPage = pageParam;
      this.currentPageSubject.next(pageParam);
    }

    if (searchParam) {
      this.searchTerm = searchParam;
    }

    this.loadCustomers();
  }

  // ------------------------
  // LOAD
  // ------------------------
  loadCustomers(): void {
    this.isLoading = true;

    this.customerSrv.getCustomers().subscribe({
      next: res => {
        const customers = res.data ?? [];
        this.customersSource.next(
          this.searchTerm ? this.applyFilter(customers) : customers
        );
        this.isLoading = false;
        this.saveState();
      },
      error: () => {
        this.customersSource.next([]);
        this.isLoading = false;
      }
    });
  }

  // ------------------------
  // SEARCH
  // ------------------------
  onSearch(value: string): void {
    this.searchTerm = value.toLowerCase();
    this.currentPage = 1;
    this.currentPageSubject.next(1);

    this.loadCustomers();
    this.updateUrl();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.currentPageSubject.next(1);

    localStorage.removeItem(this.STORAGE_KEY);
    this.updateUrl();
    this.loadCustomers();
  }

  private applyFilter(customers: AdminCustomer[]): AdminCustomer[] {
    return customers.filter(c =>
      c.email.toLowerCase().includes(this.searchTerm) ||
      this.getFullName(c).toLowerCase().includes(this.searchTerm) ||
      c.customer?.mobileNo?.includes(this.searchTerm)
    );
  }

  // ------------------------
  // PAGINATION
  // ------------------------
  changePage(page: number): void {
    if (page < 1) return;

    this.currentPage = page;
    this.currentPageSubject.next(page);
    this.updateUrl();
    this.saveState();
  }

  // ------------------------
  // URL + STORAGE
  // ------------------------
  saveState(): void {
    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify({
        page: this.currentPage,
        q: this.searchTerm
      })
    );
  }

  updateUrl(): void {
    this.router.navigate([], {
      queryParams: {
        page: this.currentPage,
        q: this.searchTerm || null
      },
      queryParamsHandling: 'merge'
    });
  }

  // ------------------------
  // UI HELPERS
  // ------------------------
  getFullName(c: AdminCustomer): string {
    if (!c.customer) return '—';
    return `${c.customer.firstName} ${c.customer.lastName}`;
  }

  getMobile(c: AdminCustomer): string {
    return c.customer?.mobileNo ?? '—';
  }

  processingId: string | null = null;

  onToggleStatus(cust: AdminCustomer, event: Event) {
    const input = event.target as HTMLInputElement;
    const nextState = input.checked;

    // Confirm only when deactivating
    if (!nextState) {
      const confirmed = confirm(`Deactivate ${cust.email}?`);
      if (!confirmed) {
        input.checked = true;
        return;
      }
    }

    this.processingId = cust.id;

    const request$ = nextState
      ? this.customerSrv.activateCustomer(cust.id)
      : this.customerSrv.deactivateCustomer(cust.id);

    request$.subscribe({
      next: () => {
        cust.isActive = nextState;
      },
      error: () => {
        // rollback UI if API fails
        input.checked = !nextState;
      },
      complete: () => {
        this.processingId = null;
      }
    });
  }



}
