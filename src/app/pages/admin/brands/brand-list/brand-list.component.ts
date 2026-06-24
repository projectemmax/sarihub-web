import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Brand } from '@app/models/brand.model';
import { BrandService } from '@app/services/product/brand.service';
import { BrandListResponse } from '@app/models/brand-response.model';
import { PaginationComponent } from "@app/shared/pagination/pagination.component";
import { TableSkeletonComponent } from "@app/shared/table-skeleton/table-skeleton.component";
import { 
    FormsModule,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators 
} from '@angular/forms';
import { BrandFormModalComponent } from "../brand-form-modal/brand-form-modal.component";
import { ToastService } from "@app/core/services/toast.service";
import { MediaService } from '@app/core/services/media.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-brand-list',
    standalone: true,
    imports: [
        CommonModule, 
        PaginationComponent, 
        TableSkeletonComponent, 
        FormsModule,
        ReactiveFormsModule,
        BrandFormModalComponent
    ],
    templateUrl: './brand-list.component.html',
    styleUrls: ['./brand-list.component.scss'],
})
export class BrandListComponent implements OnInit {
    private searchSubject = new Subject<string>();
    brands: Brand[] = [];
    loading = false;
    search = '';
    statusFilter: boolean | null = null;
    verifiedFilter: boolean | null = null;
    deletedFilter?: boolean;

    brandStatusFilter:
        | 'all'
        | 'active'
        | 'inactive'
        | 'deleted'
        = 'all';

    currentPage = 1;
    pageSize = 10;
    total = 0;
    totalPages = 0;

    brandForm!: FormGroup;

    showModal = false;
    submitting = false;
    selectedBrand: Brand | null = null;
    isEditMode = false;
    uploadingLogo = false;

    showConfirmModal = false;
    confirmTitle = '';
    confirmMessage = '';
    confirmAction: (() => void) | null = null;

    constructor(
        private readonly brandService: BrandService,
        private readonly fb: FormBuilder,
        private readonly toast: ToastService,
        private readonly mediaService: MediaService,
        private readonly route: ActivatedRoute,
        private readonly router: Router
    ) {}

    ngOnInit(): void {
        this.initializeForm();

        this.searchSubject
            .pipe(
                debounceTime(500),
                distinctUntilChanged()
            )
            .subscribe(value => {

                this.search = value;
                this.currentPage = 1;

                this.updateQueryParams();
            });

        this.route.queryParams.subscribe(params => {

            this.currentPage =
                Number(params['page']) || 1;

            this.search =
                params['search'] || '';

            // existing filter logic
            this.loadBrands();
        });
    }

    onSearchChange(value: string): void {
        this.searchSubject.next(value);
    }

    private updateQueryParams(): void {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                page: this.currentPage,
                search: this.search || null,
                status:
                    this.brandStatusFilter !== 'all'
                        ? this.brandStatusFilter
                        : null,
                verified:
                    this.verifiedFilter !== null
                        ? this.verifiedFilter
                        : null
            },
            queryParamsHandling: 'merge'
        });
    }

    private initializeForm(): void {
        this.brandForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            logoUrl: [''],
            description: ['', [Validators.maxLength(1000)]],
            isVerified: [false],
            isActive: [true]
        });
    }

    loadBrands(): void {
        this.loading = true;

        let isActive: boolean | undefined;
        let isDeleted: boolean | undefined;

        switch (this.brandStatusFilter) {
            case 'active':
                isActive = true;
                break;

            case 'inactive':
                isActive = false;
                break;

            case 'deleted':
                isDeleted = true;
                break;
        }

        if (this.brandStatusFilter === 'deleted') {
            this.verifiedFilter = null;
        }

        this.brandService
            .getBrandList(
                this.currentPage,
                this.pageSize,
                this.search,
                isActive,
                this.verifiedFilter ?? undefined,
                isDeleted
            )
            .subscribe({
                next: (response) => {
                    this.brands = response.items;
                    this.total = response.total;
                    this.totalPages = response.totalPages;
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                },
            });
    }

    clearSearch(): void {
        this.search = '';
        this.currentPage = 1;
        this.updateQueryParams();
    }

    resetFilters(): void {
        this.search = '';
        this.brandStatusFilter = 'all';
        this.verifiedFilter = null;
        this.currentPage = 1;

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                page: null,
                search: null,
                status: null,
                verified: null
            },
            queryParamsHandling: 'merge'
        });
    }

    setStatusFilter(
        value: boolean | null
    ): void {
        this.statusFilter = value;
        this.currentPage = 1;
        this.updateQueryParams();
    }

    setVerifiedFilter(
        value: boolean | null
    ): void {
        this.verifiedFilter = value;
        this.currentPage = 1;
        this.updateQueryParams();
    }

    changePage(page: number): void {
        this.currentPage = page;
        this.updateQueryParams();
    }

    openCreateModal(): void {
        this.selectedBrand = null;
        this.isEditMode = false;

        this.brandForm.reset({
            isVerified: false,
            isActive: true
        });

        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.selectedBrand = null;
        this.isEditMode = false;
        this.brandForm.reset();
    }

    openEditModal(brand: Brand): void {
        this.selectedBrand = brand;
        this.isEditMode = true;

        this.brandForm.patchValue({
            name: brand.name,
            description: brand.description ?? '',
            logoUrl: brand.logoUrl ?? '',
            isVerified: brand.isVerified,
            isActive: brand.isActive
        });

        this.showModal = true;
    }

    toggleStatus(brand: Brand): void {

        const action =
            brand.isActive
                ? 'deactivate'
                : 'activate';

        this.openConfirmation(
            brand.isActive
                ? 'Deactivate Brand'
                : 'Activate Brand',

            brand.isActive
                ? 'Are you sure you want to deactivate this brand?'
                : 'Are you sure you want to activate this brand?',

            () => this.executeToggleStatus(brand)
        );
    }

    deleteBrand(brand: Brand): void {
        this.openConfirmation(
            'Delete Brand',
            'Are you sure you want to delete this brand?',
            () => this.executeDeleteBrand(brand)
        );

    }

    private slugify(value: string): string {
        return value
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '');
    }

    saveBrand(): void {
        if (this.brandForm.invalid) {
            this.brandForm.markAllAsTouched();
            return;
        }

        if (this.isEditMode) {
            this.updateBrand();
            return;
        }

        this.createBrand();
    }

    private createBrand(): void {
        this.submitting = true;

        this.brandService
            .createBrand(this.brandForm.value)
            .subscribe({
                next: () => {
                    this.currentPage = 1;
                    this.submitting = false;
                    this.closeModal();
                    this.toast.success('Brand created successfully');
                    this.loadBrands();
                },
                error: error => {
                    this.submitting = false;
                    console.error(error);
                    if (error?.error?.message?.includes('already exists')) {
                        this.toast.error('Brand already exists');
                        return;
                    }
                    this.toast.error('Failed to create brand');
                }
            });
    }

    private updateBrand(): void {

        if (!this.selectedBrand) {
            return;
        }

        this.submitting = true;

        this.brandService
            .updateBrand(
                this.selectedBrand.id,
                this.brandForm.getRawValue()
            )
            .subscribe({
                next: () => {
                    this.submitting = false;
                    this.closeModal();
                    this.loadBrands();
                    this.toast.success('Brand updated successfully');
                },
                error: error => {
                    this.submitting = false;
                    if (error?.error?.message?.includes('already exists')) {
                        this.toast.error('Brand already exists');
                        return;
                    }
                    this.toast.error('Failed to update brand');
                }
            });
    }

    restoreBrand(brand: Brand): void {
        this.openConfirmation(
            'Restore Brand',
            'Restore this brand?',
            () => this.executeRestoreBrand(brand)
        );

    }

    openConfirmation(
        title: string,
        message: string,
        action: () => void
    ): void {
        this.confirmTitle = title;
        this.confirmMessage = message;
        this.confirmAction = action;

        this.showConfirmModal = true;
    }

    confirm(): void {
        this.confirmAction?.();
        this.showConfirmModal = false;
    }

    cancelConfirmation(): void {
        this.showConfirmModal = false;
        this.confirmAction = null;
    }

    private executeRestoreBrand(brand: Brand): void {
        this.brandService
            .restoreBrand(brand.id)
            .subscribe({
                next: () => {
                    this.loadBrands();
                    this.toast.success(
                        'Brand restored successfully'
                    );
                },
                error: error => {
                    this.toast.error(
                        'Failed to restore brand'
                    );
                    console.error(error);
                }
            });
    }

    private executeDeleteBrand(
        brand: Brand
    ): void {

        this.brandService
            .deleteBrand(brand.id)
            .subscribe({
                next: () => {
                    this.loadBrands();

                    this.toast.success(
                        'Brand deleted successfully'
                    );
                },
                error: error => {

                    if (
                        error?.error?.message?.includes(
                            'existing products'
                        )
                    ) {
                        this.toast.error(
                            'Cannot delete brand with existing products'
                        );

                        return;
                    }

                    this.toast.error(
                        'Failed to delete brand'
                    );

                    console.error(error);
                }
            });
    }

    private executeToggleStatus(
        brand: Brand
    ): void {

        const payload = {
            isActive: !brand.isActive
        };

        this.brandService
            .updateBrand(brand.id, payload)
            .subscribe({
                next: () => {
                    this.loadBrands();

                    this.toast.success(
                        brand.isActive
                            ? 'Brand deactivated successfully'
                            : 'Brand activated successfully'
                    );
                },
                error: error => {
                    this.toast.error(
                        'Failed to update brand status'
                    );

                    console.error(error);
                }
            });
    }

    onStatusFilterChange(): void {
        this.currentPage = 1;
        this.updateQueryParams();
    }
    

}