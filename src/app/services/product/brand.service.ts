import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { Constant } from '@app/services/constant/constant';
import { ApiResponse } from '@app/models/api-response.model';
import { Brand } from '@app/models/brand.model';
import { BrandListResponse } from '@app/models/brand-response.model';
import { CreateBrandPayload } from '@app/models/brand-create-payload.model';


@Injectable({
    providedIn: 'root',
})
export class BrandService {

    private readonly baseUrl =
        `${Constant.API_BASE_URL}/brands`;

    constructor(
        private http: HttpClient
    ) {}

    getBrands(): Observable<Brand[]> {
        return this.http
            .get<any>(
                this.baseUrl,
                {
                    params: new HttpParams()
                        .set('page', 1)
                        .set('limit', 1000),
                }
            )
            .pipe(
                map(response => response.data?.items ?? [])
            );
    }

    getBrandList(
        page = 1,
        limit = 10,
        search = '',
        isActive?: boolean,
        isVerified?: boolean
    ): Observable<BrandListResponse> {

        let params = new HttpParams()
            .set('page', page)
            .set('limit', limit);

        if (search) {
            params = params.set('search', search);
        }

        if (isActive !== undefined) {
            params = params.set(
            'isActive',
            String(isActive)
            );
        }

        if (isVerified !== undefined) {
            params = params.set(
            'isVerified',
            String(isVerified)
            );
        }

        return this.http
            .get<ApiResponse<BrandListResponse>>(
                this.baseUrl,
                { params }
            )
            .pipe(
                map(response => response.data)
            );
    }

    createBrand(payload: CreateBrandPayload) {
        return this.http.post<Brand>(
            this.baseUrl, payload
        );
    }

}