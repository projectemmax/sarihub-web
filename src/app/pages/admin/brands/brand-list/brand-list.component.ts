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

    constructor(
        private readonly brandService: BrandService,
        private readonly fb: FormBuilder
    ) {}

    ngOnInit(): void {
        this.initializeForm();
        this.loadBrands();
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

    onSearch(): void {
        this.currentPage = 1;
        this.loadBrands();
    }

    clearSearch(): void {
        this.search = '';
        this.currentPage = 1;
        this.loadBrands();
    }

    setStatusFilter(
        value: boolean | null
    ): void {

        this.statusFilter = value;
        this.currentPage = 1;

        this.loadBrands();
    }

    setVerifiedFilter(
        value: boolean | null
    ): void {

        this.verifiedFilter = value;
        this.currentPage = 1;

        this.loadBrands();
    }

    changePage(page: number): void {
        this.currentPage = page;
        this.loadBrands();
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

        const confirmed = confirm(
            `Are you sure you want to ${action} "${brand.name}"?`
        );

        if (!confirmed) {
            return;
        }

        this.brandService
            .updateBrand(brand.id,{isActive: !brand.isActive})
            .subscribe({
                next: () => {
                    this.loadBrands();
                },
                error: error => {
                    console.error(error);
                }
            });
    }

    deleteBrand(brand: Brand): void {
        const confirmed = confirm(
            `Delete "${brand.name}"?`
        );

        if (!confirmed) {
            return;
        }

        this.brandService
            .deleteBrand(brand.id)
            .subscribe({
                next: () => {
                    this.loadBrands();
                        // TODO: Replace with toast
                        console.log(
                        'Brand deleted successfully'
                    );
                },
                error: (error) => {
                    console.error(error);

                    alert(
                    error?.error?.message ??
                    'Failed to delete brand'
                    );
                },
            });
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
                    this.loadBrands();
                },
                error: error => {
                    this.submitting = false;
                    console.error(error);
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
                },
                error: error => {
                    this.submitting = false;
                    console.error(error);
                }
            });
    }

    restoreBrand(brand: Brand): void {
        const confirmed = confirm(
            `Restore "${brand.name}"?`
        );

        if (!confirmed) {
            return;
        }

        this.brandService
            .restoreBrand(brand.id)
            .subscribe({
                next: () => {
                    this.loadBrands();
                },
                error: error => {
                    console.error(error);
                },
        });
    }

}