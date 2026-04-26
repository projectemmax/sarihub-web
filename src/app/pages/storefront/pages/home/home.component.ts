import { Component } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import { Router } from '@angular/router';

import { Product } from '@app/models/product.model';
import { Category } from '@app/models/category.model';

import { StorefrontProductService } from '@app/services/storefront/storefront-product.service';
import { StorefrontCategoryService } from '@app/services/storefront/storefront-category.service';

import { HeroComponent } from '@app/pages/storefront/components/hero/hero.component';
import { FeaturesComponent } from '@app/pages/storefront/components/features/features.component';
import { CategoryTabsComponent } from '../../components/category-tabs/category-tabs.component';
import { ProductGridComponent } from '@app/pages/storefront/components/product-grid/product-grid.component';
import { ProductCarouselComponent } from '../../components/product-carousel/product-carousel.component';
import { OffersComponent } from '@app/pages/storefront/components/offers/offers.component';

@Component({
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    CommonModule,
    AsyncPipe,
    HeroComponent,
    FeaturesComponent,
    CategoryTabsComponent,
    ProductGridComponent,
    ProductCarouselComponent,
    OffersComponent
  ],
})
export class HomeComponent {

    // 🔑 category selection state
    private selectedCategory$ = new BehaviorSubject<string | null>(null);
    activeCategoryId: string | null = null;

    // =============================
    // CATEGORIES
    // =============================
    categories$: Observable<Category[]> =
        this.storefrontCategoryService.getCategories()
        .pipe(
            map(res => res.data.data ?? [])
        );

    // =============================
    // FEATURED PRODUCTS
    // =============================
    featuredProducts$ = this.storefrontProductService
        .getProducts({
            page: 1,
            limit: 8,
            isFeatured: true,
        })
        .pipe(
            map(res => Array.isArray(res?.data) ? res.data : [])
        );

    // =============================
    // BESTSELLERS
    // =============================
    bestsellerProducts$ = this.storefrontProductService
        .getProducts({
        page: 1,
        limit: 8,
        isBestSeller: true,
        })
        .pipe(
            map(res => Array.isArray(res?.data) ? res.data : [])
        );

    // =============================
    // PRODUCTS BY CATEGORY (🔑 THIS IS THE ONE)
    // =============================
    productsByCategory$ = this.selectedCategory$.pipe(
        switchMap(categoryId =>
        this.storefrontProductService.getProducts({
            page: 1,
            limit: 8,
            categoryId: categoryId ?? undefined,
        })
        ),
        map(res => Array.isArray(res?.data) ? res.data : [])
    );

    constructor(
        private router: Router,
        private storefrontProductService: StorefrontProductService,
        private storefrontCategoryService: StorefrontCategoryService
    ) {}

    // =============================
    // CATEGORY TAB CLICK
    // =============================
    onCategorySelect(categoryId: string | null): void {
        this.activeCategoryId = categoryId;
        this.selectedCategory$.next(categoryId);
    }
}
