// products.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Observable, Subject, merge } from 'rxjs';
import { map, shareReplay, switchMap, tap, finalize, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ProductService } from '@app/services/product/product.service';
import { CategoryService } from '@app/services/category/category.service';

import { ApiResponse } from '@app/models/api-response.model';
import { Product } from '@app/models/product.model';
import { createEmptyProduct } from '@app/models/product.factory';
import { Constant } from '@app/services/constant/constant';


import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { Category } from '@app/models/category.model';
import { getProductImageUrl } from '@app/core/utils/image.util';
import { ToastService } from '@app/core/services/toast.service';
import { ProductListResponse } from '@app/models/product-list-response.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, PaginationComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
    readonly pageSize = 8;

    // -------------------
    // UI STATE
    // -------------------
    isSidePanelVisible = false;
    isEditMode = false;
    skuError: string | null = null;

    showToast = false;
    toastMessage = '';
    selectedIds = new Set<string>();

    statusFilter: 'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' = 'ALL';
    showArchived = false;

    getProductImageUrl = getProductImageUrl;

    // ===== IMAGE UPLOAD STATE =====
    selectedImageFile: File | null = null;
    imagePreview: string | null = null;

    // -------------------
    // FORM
    // -------------------
    productForm!: FormGroup;
    productObj: Product = createEmptyProduct();

    // -------------------
    // PAGINATION
    // -------------------
    currentPage = 1;

    // -------------------
    // DATA
    // -------------------
    private refresh$ = new Subject<void>();
    searchCtrl = this.fb.control('');

    private showError(message: string) {
        this.toastMessage = message;
        this.showToast = true;

        setTimeout(() => {
        this.showToast = false;
        }, 3000);
    }

    // STATUS Filter
    setStatusFilter(
        status: 'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'
    ) {
        this.router.navigate([], {
            queryParams: {
            status: status === 'ALL' ? null : status,
            page: 1,
            },
            queryParamsHandling: 'merge',
        });
    }

    toggleArchived() {
        this.router.navigate([], {
            queryParams: {
            archived: this.showArchived ? null : 'true',
            page: 1,
            },
            queryParamsHandling: 'merge',
        });
    }

    // -------------------
    // CATEGORY DROPDOWN
    // -------------------
    categoryList$ = this.categorySrv.getCategories().pipe(
        map(categories => categories.filter(c => c.isActive)),
        shareReplay(1)
    );


    constructor(
        private fb: FormBuilder,
        private productSrv: ProductService,
        private categorySrv: CategoryService,
        private route: ActivatedRoute,
        private router: Router,
        private toast: ToastService
    ) {}

    // -------------------
    // INIT
    // -------------------
    productsVm$!: Observable<{
        loading: boolean;
        products: Product[];
        totalPages: number;
    }>;

    ngOnInit(): void {
        this.initForm();

        this.searchCtrl.valueChanges
        .pipe(
            debounceTime(300),
            distinctUntilChanged()
        )
        .subscribe(value => {
            this.router.navigate([], {
            queryParams: {
                q: value || null,
                page: 1, // reset pagination
            },
            queryParamsHandling: 'merge',
            });
        });


        this.productsVm$ = merge(
        this.route.queryParams,
        this.refresh$
        ).pipe(
        map(() => {
            const params = this.route.snapshot.queryParamMap;

            const statusParam = params.get('status');

            const status: 'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' =
                statusParam === 'PUBLISHED' ||
                statusParam === 'DRAFT' ||
                statusParam === 'ARCHIVED'
                    ? statusParam
                    : 'ALL';

            const showArchived = params.get('archived') === 'true';
                
            // sync UI
            this.statusFilter = status;
            this.showArchived = showArchived;

            return {
                page: Number(params.get('page')) || 1,
                search: params.get('q') || '',
                status,
                showArchived,
            };
        }),

        tap(({ page }) => {
            this.currentPage = page;
        }),

        switchMap(({ page, search, status, showArchived }) => {
            const apiStatus:
                | 'DRAFT'
                | 'PUBLISHED'
                | 'ARCHIVED'
                | undefined =
                status === 'ALL' ? undefined : status;

            return this.productSrv.getProducts({
                page,
                limit: this.pageSize,
                search,
                status: apiStatus,
            }).pipe(
                tap(res => {
                const totalPages = res.meta
                    ? Math.ceil(res.meta.total / res.meta.limit)
                    : 1;

                if (page > totalPages && totalPages > 0) {
                    this.router.navigate([], {
                    queryParams: { page: totalPages },
                    queryParamsHandling: 'merge',
                    });
                }
                }),

                map(res => ({
                loading: false,
                products: res.data ?? [],
                totalPages: res.meta
                    ? Math.ceil(res.meta.total / res.meta.limit)
                    : 1,
                })),

                startWith({
                loading: true,
                products: [] as Product[],
                totalPages: 1,
                })
            );
        })


        );
    }



    // -------------------
    // FORM SETUP
    // -------------------
    private initForm(): void {
        this.productForm = this.fb.group({
        id: [''],
        sku: ['', [Validators.required, Validators.minLength(3)]],
        name: ['', Validators.required],
        price: [0, [Validators.required, Validators.min(0)]],
        stock: [0, [Validators.required, Validators.min(0)]],
        categoryId: ['', Validators.required],
        imageUrl: [''],
        description: [''],
        // 🔥 REQUIRED FOR TOGGLES
        isFeatured: [false],
        isBestSeller: [false],
        isActive: [true],
        });
    }

    // -------------------
    // PAGINATION
    // -------------------
    changePage(page: number): void {
        if (page < 1) return;

        this.router.navigate([], {
        queryParams: { page },
        queryParamsHandling: 'merge',
        });
    }


    // -------------------
    // SIDE PANEL
    // -------------------
    openSidePanel(): void {
        this.isEditMode = false;
        this.skuError = null;

        this.productForm.reset({
        price: 0,
        stock: 0,
        });

        this.productForm.get('sku')?.enable();
        this.isSidePanelVisible = true;
    }

    closeSidePanel(): void {
        this.isSidePanelVisible = false;
    }

    onEdit(product: Product): void {
        this.isEditMode = true;
        this.skuError = null;

        this.productForm.patchValue(product);
        this.productForm.get('sku')?.disable(); // SKU locked

        this.isSidePanelVisible = true;
    }

    // -------------------
    // CRUD
    // -------------------
    onSave(): void {
        if (this.productForm.invalid) {
        this.productForm.markAllAsTouched();
        return;
        }

        const payload = this.productForm.getRawValue();

        this.productSrv.createProduct(payload).subscribe({
        next: (createdProduct) => {
            // 🔥 SWITCH TO EDIT MODE
            this.isEditMode = true;

            // Patch returned product (must include id)
            this.productForm.patchValue(createdProduct);

            // Lock SKU after creation
            this.productForm.get('sku')?.disable();

            // Keep side panel open
            this.isSidePanelVisible = true;

            this.refresh$.next();
        },
        error: err => {
            if (err.status === 409) {
            this.skuError = err.error?.message || 'SKU already exists';
            }
        },
        });
    }

    uploadImage(): void {
        const productId = this.productForm.getRawValue().id;

        if (!productId || !this.selectedImageFile) return;

        this.productSrv
        .uploadProductImage(productId, this.selectedImageFile)
        .subscribe(() => {
            this.selectedImageFile = null;
            this.imagePreview = null;

            // ✅ THIS IS ENOUGH
            this.refresh$.next();
        });
    }

    onImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) {
        return;
        }

        const file = input.files[0];

        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        // ✅ Validate file type
        if (!allowedTypes.includes(file.type)) {
        this.showError('Only JPG, PNG, or WEBP images are allowed.');
        input.value = ''; // reset input
        return;
        }

        // ✅ Validate file size
        if (file.size > maxSize) {
        this.showError('File size must be less than 5MB.');
        input.value = ''; // reset input
        return;
        }

        this.selectedImageFile = file;

        // ✅ Preview image
        const reader = new FileReader();
        reader.onload = () => {
        this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
    }


    onUpdate(): void {
        if (this.productForm.invalid) return;

        const { id, ...payload } = this.productForm.getRawValue();

        this.productSrv.updateProduct(id, payload).subscribe(() => {
        this.closeSidePanel();
        this.refresh$.next(); // ✅ FORCE reload
        });
    }


    onDelete(product: Product): void {
        if (!confirm('Delete this product?')) return;

        this.productSrv.deleteProduct(product.id).subscribe(() => {
        this.reloadCurrentPage();
        this.refresh$.next();
        });
    }

    private reloadCurrentPage(): void {
        this.router.navigate([], {
        queryParams: { page: this.currentPage },
        queryParamsHandling: 'merge',
        });
    }

    // -------------------
    // TRACK BY (ngFor)
    // -------------------
    trackById(index: number, item: Product): string {
        return item.id;
    }

    onSearch(): void {
        this.router.navigate([], {
        queryParams: {
            page: 1,
            q: this.searchCtrl.value || null,
        },
        queryParamsHandling: 'merge',
        });
    }

    clearSearch(): void {
        // 1️⃣ Clear the input control
        this.searchCtrl.setValue('', { emitEvent: false });

        // 2️⃣ Reset page + query param
        this.router.navigate([], {
        queryParams: {
            page: 1,
            q: null,
        },
        queryParamsHandling: 'merge',
        });

        // 3️⃣ Trigger reload
        this.refresh$.next();
    }

    // BULK Selection

    toggleSelection(productId: string) {
        if (this.selectedIds.has(productId)) {
            this.selectedIds.delete(productId);
        } else {
            this.selectedIds.add(productId);
        }
    }

    toggleSelectAll(products: Product[]) {
        const allSelected = products.every(p => this.selectedIds.has(p.id));

        if (allSelected) {
            products.forEach(p => this.selectedIds.delete(p.id));
        } else {
            products.forEach(p => this.selectedIds.add(p.id));
        }
    }

    bulkPublish() {
        const ids = Array.from(this.selectedIds);

        this.productSrv.bulkUpdateStatus({
            ids,
            status: 'PUBLISHED',
        }).subscribe(() => {
            this.selectedIds.clear();
            this.refresh$.next();
        });
    }

    bulkUnpublish() {
        const ids = Array.from(this.selectedIds);

        this.productSrv.bulkUpdateStatus({
            ids,
            status: 'DRAFT',
        }).subscribe(() => {
            this.selectedIds.clear();
            this.refresh$.next();
        });
    }

    bulkDelete() {
        if (!confirm('Archive selected products?')) return;

        const ids = Array.from(this.selectedIds);

        Promise.all(
            ids.map(id => this.productSrv.deleteProduct(id).toPromise())
        ).then(() => {
            this.selectedIds.clear();
            this.refresh$.next();
        });
    }

    toggleStatus(product: Product) {
        const newStatus =
            product.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';

        this.productSrv.updateProduct(product.id, {
            status: newStatus,
        } as any).subscribe({
            next: () => {

                // ✅ SHOW TOAST (clean & reusable)
                this.toast.success(
                    newStatus === 'PUBLISHED'
                    ? 'Product published successfully'
                    : 'Product moved to draft'
                );

                this.refresh$.next();
            },

            error: () => {
                this.toast.error('Failed to update product');
            }
        });
    }

    getMinPrice(variants?: any[]): number {
        if (!variants?.length) return 0;

        return Math.min(...variants.map(v => Number(v.price) || 0));
    }

    getMaxPrice(variants?: any[]): number {
        if (!variants?.length) return 0;

        return Math.max(...variants.map(v => Number(v.price) || 0));
    }

    restoreProduct(product: Product): void {
        this.productSrv.restoreProduct(product.id).subscribe(() => {
            this.toast.success('Product restored');
            this.refresh$.next();
        });
    }

    hardDeleteProduct(product: Product): void {
        const confirmed = confirm(
            `Permanently delete "${product.name}"? This cannot be undone.`
        );

        if (!confirmed) return;

        this.productSrv.hardDeleteProduct(product.id).subscribe(() => {
            this.toast.success('Product permanently deleted');
            this.refresh$.next();
        });
    }


}
