import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Brand } from '@app/models/brand.model';
import { BrandService } from '@app/services/product/brand.service';
import { BrandListResponse } from '@app/models/brand-response.model';
import { PaginationComponent } from "@app/shared/pagination/pagination.component";
import { TableSkeletonComponent } from "@app/shared/table-skeleton/table-skeleton.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-brand-list',
  standalone: true,
  imports: [CommonModule, PaginationComponent, TableSkeletonComponent, FormsModule],
  templateUrl: './brand-list.component.html',
  styleUrls: ['./brand-list.component.scss'],
})
export class BrandListComponent implements OnInit {
    brands: Brand[] = [];
    loading = false;
    search = '';
    statusFilter: boolean | null = null;
    verifiedFilter: boolean | null = null;

    currentPage = 1;
    pageSize = 10;
    total = 0;
    totalPages = 0;

    constructor(
        private readonly brandService: BrandService
    ) {}

    ngOnInit(): void {
        this.loadBrands();
    }

    loadBrands(): void {
        this.loading = true;

        this.brandService
            .getBrandList(
                this.currentPage,
                this.pageSize,
                this.search,
                this.statusFilter ?? undefined,
                this.verifiedFilter ?? undefined
            )
            .subscribe({
                next: response => {
                    this.brands = response.items;
                    this.total = response.total;
                    this.totalPages = response.totalPages;
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                }
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

    }

    openEditModal(brand: Brand): void {

    }

    toggleStatus(brand: Brand): void {

    }

    deleteBrand(brand: Brand): void {

    }

}