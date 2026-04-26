import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@app/models/api-response.model';
import { Category } from '@app/models/category.model';
import { Constant } from '@app/services/constant/constant';

@Injectable({ providedIn: 'root' })
export class StorefrontCategoryService {
    constructor(private http: HttpClient) {}

    getCategories(): Observable<ApiResponse<{ data: Category[] }>> {
        return this.http.get<ApiResponse<{ data: Category[] }>>(
            `${Constant.API_BASE_URL}/categories`
        );
    }
}
