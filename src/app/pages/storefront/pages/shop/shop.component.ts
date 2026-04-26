import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { StorefrontProductService } from '@app/services/storefront/storefront-product.service';
import { StorefrontCategoryService } from '@app/services/storefront/storefront-category.service';

import { ProductGridComponent } from '../../components/product-grid/product-grid.component';
import { CategorySidebarComponent } from '../../components/category-sidebar/category-sidebar.component';
import { SortDropdownComponent, SortOption } from '../../components/sort-dropdown/sort-dropdown.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { PriceRangeComponent } from '../../components/price-range/price-range.component';

import { ShopFilters } from '@app/models/storefront/shop-filters.model';
import { combineLatest, of } from 'rxjs';
import { AdditionalFilterComponent } from "../../components/additional-filter/additional-filter.component";
import { FeaturedProductsComponent } from "../../components/featured-products/featured-products.component";
import { SearchInputComponent } from '../../components/search-input/search-input.component';
import { BreadcrumbComponent } from "../../components/breadcrumb/breadcrumb.component";
import { Category } from '@app/models/category.model';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ProductGridComponent,
    CategorySidebarComponent,
    SortDropdownComponent,
    PaginationComponent,
    PriceRangeComponent,
    AdditionalFilterComponent,
    FeaturedProductsComponent,
    SearchInputComponent,
    BreadcrumbComponent
],
  templateUrl: './shop.component.html',
})
export class ShopComponent {

    // ✅ DEFAULT PRICE RANGE (PUT IT HERE)
    defaultMinPrice = 0;
    defaultMaxPrice = 5000;

    breadcrumb$ = of([
        { label: 'Home', url: '/' },
        { label: 'Shop' }
    ]);

    title$ = this.breadcrumb$.pipe(
        map(items => items[items.length - 1]?.label ?? '')
    );

    /* =======================
        CATEGORIES
    ======================= */
    categories$ = this.categoryService.getCategories().pipe(
        map(res => res.data.data ?? [])
    );

    activeCategoryId$ = this.route.queryParams.pipe(
        map(params => params['categoryId'] || null)
    );

    /* =======================
        PRODUCTS
    ======================= */
    productsResponse$ = this.route.queryParams.pipe(
        map(params => this.buildFiltersFromParams(params)),
        switchMap(filters => this.productService.getProducts(filters))
    );

    products$ = this.productsResponse$.pipe(
        map(res => res.data ?? [])
    );

    page$ = this.productsResponse$.pipe(
        map(res => res.meta?.page ?? 1)
    );

    totalPages$ = this.productsResponse$.pipe(
        map(res => res.meta?.totalPages ?? 1)
    );

    totalProducts$ = this.categories$.pipe(
        map(categories =>
            (categories ?? []).reduce(
                (sum: number, c: Category) => sum + (c.productCount ?? 0),
                0
            )
        )
    );

    /* =======================
        SORT
    ======================= */
    sort$ = this.route.queryParams.pipe(
        map(params => params['sort'] || '')
    );

    filters$ = this.route.queryParams.pipe(
        map(params => this.buildFiltersFromParams(params))
    );

    filtersWithoutPrice$ = this.filters$.pipe(
        map(({ priceMin, priceMax, ...rest }) => rest)
    );

    priceBounds$ = this.filtersWithoutPrice$.pipe(
        switchMap(filters =>
        this.productService.getProducts(filters)
        ),
        map(res => res.meta?.priceRange ?? {
        min: this.defaultMinPrice,
        max: this.defaultMaxPrice,
        }),
        distinctUntilChanged(
        (a, b) => a.min === b.min && a.max === b.max
        )
    );

    price$ = combineLatest([
        this.route.queryParams,
        this.priceBounds$,
    ]).pipe(
        map(([params, bounds]) => ({
        min: params['priceMin'] !== undefined
            ? Number(params['priceMin'])
            : bounds.min,
        max: params['priceMax'] !== undefined
            ? Number(params['priceMax'])
            : bounds.max,
        })),
        distinctUntilChanged(
        (a, b) => a.min === b.min && a.max === b.max
        )
    );

    additional$ = this.route.queryParams.pipe(
        map(params => params['additional'] ?? null)
    );

    featured$ = this.route.queryParams.pipe(
        map(params => params['featured'] === 'true')
    );

    search$ = this.route.queryParams.pipe(
        map(params => params['search'] || '')
    );

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private productService: StorefrontProductService,
        private categoryService: StorefrontCategoryService,
    ) {}

    /* =======================
        HELPERS
    ======================= */
    private buildFiltersFromParams(params: any): ShopFilters {
        return {
        page: +params['page'] || 1,
        limit: 9,
        categoryId: params['categoryId'] || undefined,
        search: params['search'] || undefined,
        sort: params['sort'] || undefined,

        isFeatured:
            params['featured'] === 'true' ||
            params['additional'] === 'featured'
            ? true
            : undefined,

        isBestSeller:
            params['bestSeller'] === 'true' ||
            params['additional'] === 'bestSeller'
            ? true
            : undefined,

        inStock:
            params['inStock'] === 'true' ||
            params['additional'] === 'inStock'
            ? true
            : undefined,

        // 🔥 THIS WAS MISSING
        priceMin: params['priceMin']
            ? Number(params['priceMin'])
            : undefined,
        priceMax: params['priceMax']
            ? Number(params['priceMax'])
            : undefined,
        };
    }

    /* =======================
        ACTIONS
    ======================= */
    onCategorySelect(categoryId: string | null) {
        this.router.navigate([], {
        queryParams: { categoryId, page: 1 },
        queryParamsHandling: 'merge',
        });
    }

    onPageChange(page: number) {
        this.router.navigate([], {
        queryParams: { page },
        queryParamsHandling: 'merge',
        });
    }

    onSortChange(sort: SortOption) {
        this.router.navigate([], {
        queryParams: {
            sort: sort || undefined,
            page: 1,
        },
        queryParamsHandling: 'merge',
        });
    }

    onPriceChange(range: { min: number; max: number }) {
        this.router.navigate([], {
        queryParams: {
            priceMin: range.min,
            priceMax: range.max,
            page: 1,
        },
        queryParamsHandling: 'merge',
        });
    }

    onClearPrice() {
        this.router.navigate([], {
        queryParams: {
            priceMin: null,
            priceMax: null,
            page: 1,
        },
        queryParamsHandling: 'merge',
        });
    }

    onAdditionalChange(value: 'featured' | 'bestSeller' | 'inStock' | 'new' | null) {
        this.router.navigate([], {
        queryParams: {
            additional: value,
            page: 1,
        },
        queryParamsHandling: 'merge',
        });
    }

    clearFeatured() {
        this.router.navigate([], {
        queryParams: {
            featured: null,     // 🔥 remove featured filter
            page: 1,
        },
        queryParamsHandling: 'merge',
        });
    }

    onSearchChange(value: string) {
        this.router.navigate([], {
        queryParams: {
            search: value || null,
            page: 1,
        },
        queryParamsHandling: 'merge',
        });
    }

}