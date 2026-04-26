import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap, map, tap } from 'rxjs';

import { StorefrontProductService } from '@app/services/storefront/storefront-product.service';
import { StorefrontCategoryService } from '@app/services/storefront/storefront-category.service';

import { Product } from '@app/models/product.model';
import { ApiResponse } from '@app/models/api-response.model';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';

@Component({
  selector: 'app-storefront-products',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './products.component.html',
})
export class StorefrontProductsComponent implements OnInit {
  products$!: Observable<Product[]>;
  currentPage = 1;
  totalPages = 1;
  readonly pageSize = 12;

  selectedCategory: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productSrv: StorefrontProductService,
    private categorySrv: StorefrontCategoryService
  ) {}

  categories$ = this.categorySrv.getCategories().pipe(
    map(res => res.data ?? [])
  );

  onCategoryChange(categoryId: string): void {
    this.router.navigate([], {
      queryParams: {
        category: categoryId || null,
        page: 1, // reset pagination
      },
      queryParamsHandling: 'merge',
    });
  }


  ngOnInit(): void {
    this.products$ = this.route.queryParams.pipe(
      tap(params => {
        this.currentPage = Number(params['page']) || 1;
        this.selectedCategory = params['category'] || null;
      }),
      switchMap(params =>
        this.productSrv.getProducts({
          page: this.currentPage,
          limit: this.pageSize,
          categoryId: params['category'],
          search: params['q'],
        })
      ),
      tap(res => {
        this.totalPages = res.meta?.totalPages ?? 1;
      }),
      map(res => res.data ?? [])
    );
  }


  changePage(page: number): void {
    this.router.navigate([], {
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
  }
}
