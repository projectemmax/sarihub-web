import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { Constant } from '@app/services/constant/constant';
import { ApiResponse } from '@app/models/api-response.model';
import { Product } from '@app/models/product.model';
import { ProductPayload } from '@app/models/product-payload.model';
import { ProductListResponse } from '@app/models/product-list-response.model';

@Injectable({ providedIn: 'root' })
export class ProductService {

    // =========================
    // ADMIN BASE URL
    // =========================
    private readonly baseUrl =
        `${Constant.API_BASE_URL}/${Constant.ADMIN.PRODUCTS.BASE}`;

    constructor(private http: HttpClient) {}

    /* =====================================================
        LIST PRODUCTS (ADMIN)
        - includes inactive
        - pagination + search
    ===================================================== */
    getProducts(params: {
        page: number;
        limit: number;
        search?: string;
        categoryId?: string;
        isActive?: boolean;
        status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
    }): Observable<ApiResponse<Product[]>> {

        let httpParams = new HttpParams()
        .set('page', params.page)
        .set('limit', params.limit);

        if (params.search) {
            httpParams = httpParams.set('search', params.search);
        }

        if (params?.status) {
            httpParams = httpParams.set('status', params.status);
        }

        if (params.categoryId) {
            httpParams = httpParams.set('categoryId', params.categoryId);
        }

        if (params.isActive !== undefined) {
            httpParams = httpParams.set('isActive', String(params.isActive));
        }

        return this.http.get<ApiResponse<Product[]>>(this.baseUrl, {
            params: httpParams,
        });
    }

    /* =====================================================
        GET PRODUCT BY ID (ADMIN)
    ===================================================== */
    getProductById(id: string): Observable<ApiResponse<Product>> {
        return this.http.get<ApiResponse<Product>>(
        `${this.baseUrl}/${id}`
        );
    }

    /* =====================================================
        CREATE PRODUCT
    ===================================================== */
    createProduct(
        payload: ProductPayload
    ): Observable<ApiResponse<Product>> {
        return this.http.post<ApiResponse<Product>>(
        this.baseUrl,
        payload
        );
    }

    /* =====================================================
        UPDATE PRODUCT
        - SKU is immutable
    ===================================================== */
    updateProduct(
        id: string,
        payload: ProductPayload
    ): Observable<ApiResponse<Product>> {

        const { sku, ...safePayload } = payload;

        return this.http.put<ApiResponse<Product>>(
        `${this.baseUrl}/${id}`,
        safePayload
        );
    }

    bulkUpdateStatus(payload: {
        ids: string[];
        status: 'DRAFT' | 'PUBLISHED';
    }) {
        return this.http.patch(
            `${this.baseUrl}/bulk-status`,
            payload
        );
    }

    /* =====================================================
        SOFT DELETE PRODUCT
    ===================================================== */
    deleteProduct(id: string): Observable<void> {
        return this.http.delete<void>(
        `${this.baseUrl}/${id}`
        );
    }

    restoreProduct(id: string) {
        return this.http.patch<void>(
        `${Constant.API_BASE_URL}/${Constant.ADMIN.PRODUCTS.BY_ID(id)}/restore`,
        {}
        );
    }

    hardDeleteProduct(id: string) {
        return this.http.delete<void>(
        `${Constant.API_BASE_URL}/${Constant.ADMIN.PRODUCTS.BY_ID(id)}/permanent`
        );
    }

    /* =====================================================
        UPLOAD PRODUCT IMAGE
    ===================================================== */
    uploadProductImage(
        productId: string,
        file: File
    ): Observable<ApiResponse<Product>> {

        const formData = new FormData();
        formData.append('image', file);

        return this.http.post<ApiResponse<Product>>(
        `${Constant.API_BASE_URL}/${Constant.ADMIN.PRODUCTS.IMAGE_UPLOAD(productId)}`,
        formData
        );
    }

    uploadVariantImage(productId: string, variantId: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<any>(
            `${Constant.API_BASE_URL}/${Constant.ADMIN.PRODUCTS.VARIANT_IMAGE_UPLOAD(productId, variantId)}`,
            formData
        );
    }

    // uploadTempImage(file: File): Observable<{ url: string }> {
    //     const formData = new FormData();
    //     formData.append('file', file);

    //     return this.http
    //         .post<any>(`${this.baseUrl}/upload`, formData)
    //         .pipe(
    //         map(res => ({
    //             url: res.data.url
    //         }))
    //     );
    // }

}
