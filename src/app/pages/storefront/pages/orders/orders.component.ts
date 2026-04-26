import { Component, OnInit } from '@angular/core';
import { StorefrontOrdersService } from '@app/services/storefront/storefront-orders.service';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {

  orders: any[] = [];
  meta: any;
  isLoading = true;

  currentPage = 1;
  limit = 10;

  constructor(private ordersService: StorefrontOrdersService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;

    this.ordersService.getOrders(this.currentPage, this.limit)
      .subscribe({
        next: (res: any) => {
          this.orders = res.data;
          this.meta = res.meta;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  

}