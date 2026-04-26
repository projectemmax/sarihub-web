import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';

import { ApiResponse } from '@app/models/api-response.model';
import { Product } from '@app/models/product.model';
import { Constant } from '@app/services/constant/constant';
import { ShopFilters } from '@app/models/storefront/shop-filters.model';
import { Review } from '@app/models/storefront/review.model';

@Injectable({ providedIn: 'root' })
export class StorefrontProductService {

  private readonly baseUrl =
    `${Constant.API_BASE_URL}/${Constant.STOREFRONT.PRODUCTS.BASE}`;

    constructor(private http: HttpClient) {}

    getProducts(params: ShopFilters): Observable<ApiResponse<Product[]>> {
        let httpParams = new HttpParams();

        if (params.page) httpParams = httpParams.set('page', params.page);
        if (params.limit) httpParams = httpParams.set('limit', params.limit);
        if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
        if (params.search) httpParams = httpParams.set('search', params.search);
        if (params.sort) httpParams = httpParams.set('sort', params.sort);
        if (params.priceMin !== undefined) httpParams = httpParams.set('priceMin', params.priceMin);
        if (params.priceMax !== undefined) httpParams = httpParams.set('priceMax', params.priceMax);

        return this.http.get<ApiResponse<Product[]>>(this.baseUrl, { params: httpParams });
    }

    getProductBySlug(slug: string): Observable<Product> {
        return this.http
            .get<ApiResponse<{ data: Product }>>(`${this.baseUrl}/${slug}`)
            .pipe(
                tap(res => {
                    console.log('Product detail response:', res);

                    if (!res.data?.data) {
                    throw new Error('Product not found');
                    }
                }),
                map(res => res.data.data)
            );
    }

}