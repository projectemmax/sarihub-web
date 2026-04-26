import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, of} from 'rxjs';
import { switchMap, map, finalize, concatMap} from 'rxjs/operators';

import { StorefrontProductService } from
  '@app/services/storefront/storefront-product.service';
import { AuthService } from '@app/core/auth/auth.service';
import { Constant } from '@app/services/constant/constant';

import { RatingComponent } from '../../components/rating/rating.component';
import { ReviewListComponent } from '../../components/review-list/review-list.component';
import { ReviewFormComponent } from '../../components/review-form/review-form.component';
import { ProductCarouselComponent } from '../../components/product-carousel/product-carousel.component';
import { ProductInfoSidebarComponent } from '../../components/product-info-sidebar/product-info-sidebar.component';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';

import { Product } from '@app/models/product.model';
import { BreadcrumbItem } from '@app/models/breadcrumb.model';
import { StorefrontCartService } from '@app/services/storefront/storefront-cart.service';
import { combineLatest, EMPTY } from 'rxjs';
import { catchError, tap, shareReplay } from 'rxjs/operators';
import { StorefrontReviewService } from '@app/services/storefront/storefront-review.service';
import { StorefrontPurchaseService } from '@app/services/storefront/storefront-purchase.service';
import { HttpEventType } from '@angular/common/http';
import { ReviewStatus } from '@app/models/storefront/review.model';
import { FormsModule } from '@angular/forms';
import { SiteConfigService } from '@app/core/services/site-config.service';
import { ProductVariant } from '@app/models/product-variant.model';
import { getProductImageUrl } from '@app/core/utils/image.util';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RatingComponent,
    ReviewListComponent,
    ReviewFormComponent,
    ProductCarouselComponent,
    ProductInfoSidebarComponent,
    BreadcrumbComponent,
    FormsModule
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent {
    private route = inject(ActivatedRoute);
    private productService = inject(StorefrontProductService);
    public authService = inject(AuthService);
    private router = inject(Router);
    private cartService = inject(StorefrontCartService);
    private reviewService = inject(StorefrontReviewService)
    private purchaseService = inject(StorefrontPurchaseService)
    private siteConfigService = inject(SiteConfigService)
    private refresh$ = new BehaviorSubject<void>(undefined);
    private addToCartTrigger$ = new BehaviorSubject<Product | null>(null);
    private reviewSubmitTrigger$ = new BehaviorSubject<any | null>(null);


    /** UI state */
    quantity = 1;
    reviewError: string | null = null;
    reviewSuccess = false;

    isLoadingProduct = true;
    productError: string | null = null;

    isAddingToCart = false;
    addToCartError: string | null = null;

    uploading = false;
    uploadProgress = 0;
    ReviewStatus = ReviewStatus;
    stockWarning: string | null = null;
    selectedVariant: ProductVariant | null = null;

    getProductImageUrl = getProductImageUrl;

    siteConfig = this.siteConfigService.snapshot;

    ngOnInit() {
        console.log(this.siteConfigService.snapshot);

        this.hasPurchased$.subscribe(value =>
            console.log('hasPurchased:', value)
        );

        this.myReview$.subscribe(value =>
            console.log('myReview:', value)
        );

        this.canReview$.subscribe(value =>
            console.log('canReview:', value)
        );

    }

    /** route param */
    slug$ = this.route.paramMap.pipe(
        map(params => params.get('slug')!),
        tap(() => this.quantity = 1)
    );

    hasPurchased$ = this.slug$.pipe(
        switchMap(slug => {
            if (!this.authService.isLoggedIn()) {
                return of(false);
            }

            return this.purchaseService.hasPurchasedProduct(slug).pipe(
                catchError(() => of(false))
            );
        }),
        shareReplay(1)
    );

    /** product */
    product$ = combineLatest([this.slug$, this.refresh$]).pipe(
        switchMap(([slug]) =>
            this.productService.getProductBySlug(slug)
        ),
        tap(() => {
            this.isLoadingProduct = false;
            this.productError = null;
        }),
        catchError(err => {
            this.isLoadingProduct = false;
            this.productError = 'Product could not be loaded.';
            return EMPTY;
        }),
        shareReplay(1)
    );

    addToCartResult$ = this.addToCartTrigger$.pipe(
        switchMap(product => {

        if (!product) return EMPTY;

        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return EMPTY;
        }

        this.isAddingToCart = true;
        this.addToCartError = null;

        return this.cartService
            .addToCart(product.id, this.quantity)
            .pipe(
            map(() => ({
                success: true,
                error: null
            })),
            catchError(err =>
                of({
                    success: false,
                    error: err?.error?.message ?? 'Failed to add to cart.'
                })
            ),
            finalize(() => {
                this.isAddingToCart = false;
            })
            );

        }),
        shareReplay(1)
    );

    addToCart(product: Product) {
        this.addToCartTrigger$.next(product);
    }
    

    /** ✅ breadcrumb (reactive & safe) */
    breadcrumb$ = this.product$.pipe(
        map(product => {
        const items: BreadcrumbItem[] = [
            { label: 'Home', url: '/' },
        ];

        if (product.category) {
            items.push({
                label: product.category.name,
                url: ['/storefront/shop'], // ✅ ROUTE ONLY
                queryParams: {
                    categoryId: product.categoryId,
                    page: 1,
                },
            });
        }

        items.push({ label: product.name });
            return items;
        })
    );

    /** reviews */
    reviewSubmitResult$ = this.reviewSubmitTrigger$.pipe(
        switchMap(payload => {
            if (!payload) return EMPTY;

            return this.slug$.pipe(
                switchMap(slug =>
                    this.reviewService.submitReview(slug, payload)
                ),
                map(() => ({ success: true })),
                catchError(err =>
                    of({
                        success: false,
                        error: err?.error?.message ?? 'Review failed.'
                    })
                )
            );
        }),
        tap(result => {
        if (result.success) {

            this.reviewSuccess = true;
            this.reviewError = null;

            this.refresh$.next();

            setTimeout(() => {
            this.reviewSuccess = false;
            }, 3000);

        } else {

            this.reviewError = 'error' in result
            ? result.error
            : 'Review failed.';

            this.reviewSuccess = false;

        }

        }),
        shareReplay(1)
    );

    /** submit review */
    submitReview(payload: any) {
        this.slug$
        .pipe(

            // STEP 1: create review
            concatMap(slug =>
                this.reviewService.submitReview(slug, {
                    rating: payload.rating,
                    comment: payload.comment
                })
            ),

            // STEP 2: upload images
            concatMap((review: any) => {

            const reviewId = review.id;

            if (!payload.files?.length) {
                return of(null);
            }

            const formData = new FormData();

            payload.files.forEach((file: File) => {
                formData.append('images', file);
            });

            this.uploading = true;
            this.uploadProgress = 0;

            return this.reviewService
                .uploadReviewImages(reviewId, formData)
                .pipe(

                tap(event => {

                    if (event.type === HttpEventType.UploadProgress && event.total) {
                        this.uploadProgress = Math.round(
                            (100 * event.loaded) / event.total
                        );
                    }

                }),

                finalize(() => {
                    this.uploading = false;
                })

                );

            }),

            // STEP 3: refresh UI
            tap(() => {

                this.reviewSuccess = true;
                this.reviewError = null;
                this.refresh$.next();
                setTimeout(() => {
                    this.reviewSuccess = false;
                }, 3000);
            }),

            catchError(err => {
                this.uploading = false;
                this.reviewError =
                    err?.error?.message ?? 'Review submission failed.';

                return EMPTY;
            })
        )
        .subscribe();
    }

    reviews$ = combineLatest([this.slug$, this.refresh$]).pipe(
        switchMap(([slug]) =>
            this.reviewService.getProductReviews(slug)
        ),
        shareReplay(1)
    );

    /** my review (auth-guarded) */
    myReview$ = this.slug$.pipe(
        switchMap(slug => {
            if (!this.authService.isLoggedIn()) {
                return of(null);
            }

            return this.refresh$.pipe(
                switchMap(() =>
                    this.reviewService.getMyReview(slug).pipe(
                    catchError(() => of(null))
                    )
                )
            );
        }),
        shareReplay(1)
    );

    canReview$ = combineLatest([
        this.hasPurchased$,
        this.myReview$
    ]).pipe(
        map(([hasPurchased, myReview]) =>
        hasPurchased && !myReview
        )
    );
    

    /** related products */
    relatedProducts$ = this.product$.pipe(
        switchMap(product =>
            this.productService.getProducts({
                categoryId: product.categoryId,
                limit: 8,
            }).pipe(
                map(res => res.data.filter(p => p.id !== product.id))
            )
        )
    );

    
    /** quantity controls */
    increase(product: Product) {
        const stock = this.getAvailableStock(product);

        if (this.quantity >= stock) {
            this.stockWarning = `Only ${stock} items available`;

            setTimeout(() => {
            this.stockWarning = null;
            }, 2000);

            return;
        }

        this.quantity++;
    }

    decrease() {
        if (this.quantity > 1) {
        this.quantity--;
        }
    }

    onQuantityInput(product: Product) {
        let qty = Number(this.quantity);

        const stock = this.getAvailableStock(product);

        // invalid input
        if (isNaN(qty) || qty < 1) {
            this.quantity = 1;
            return;
        }

        // ❗ IMPORTANT FIX
        if (qty > stock) {
            this.quantity = stock;

            this.stockWarning = `Only ${stock} items available`;

            setTimeout(() => {
            this.stockWarning = null;
            }, 2000);

            return;
        }

        this.quantity = qty;
    }

    /** image helper */
    getImageUrl(path?: string): string {
        if (!path) {
        return 'assets/no-image.png';
        }
        return `${Constant.UPLOADS_BASE_URL}${path.replace('/uploads/', '')}`;
    }

    getAvailableStock(product: Product): number {
        if (product.variants?.length) {
            return this.selectedVariant?.stock ?? 0;
        }

        return product.stock ?? 0;
    }

    onSelectVariant(variant: ProductVariant) {
        this.selectedVariant = variant;

        this.quantity = 1; // reset quantity

        if (variant.stock === 0) {
            this.stockWarning = 'Out of stock';
        } else {
            this.stockWarning = null;
        }
    }

}