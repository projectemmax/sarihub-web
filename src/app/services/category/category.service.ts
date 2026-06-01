import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

import { Constant } from '@app/services/constant/constant';
import { ApiResponse } from '@app/models/api-response.model';
import { Category } from '@app/models/category.model';
import { CategoryPayload } from '@app/models/category-payload.model';
import {
  CategoryNode,
  AdminCategoryNode,
} from '@app/models/category-tree.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {

  // =========================
  // ADMIN BASE URL
  // =========================
  private readonly baseUrl = `${Constant.API_BASE_URL}/${Constant.ADMIN.CATEGORIES.ADMIN_BASE}`;

  constructor(private http: HttpClient) {}

    /* =====================================================
        GET ALL CATEGORIES (ADMIN – includes inactive & deleted)
    ===================================================== */
    getCategories(): Observable<Category[]> {
        return this.http
        .get<ApiResponse<{ data: Category[] }>>(this.baseUrl)
        .pipe(
            map((res) => res.data?.data ?? [])
        );
    }

    getCategoryTree(): Observable<CategoryNode[]> {
        return this.http
            .get<ApiResponse<CategoryNode[]>>(
                `${this.baseUrl}/tree`
            )
            .pipe(
                map((res) => res.data ?? [])
            );
    }

    getAdminCategoryTree(): Observable<AdminCategoryNode[]> {
        return this.http
            .get<ApiResponse<AdminCategoryNode[]>>(
            `${this.baseUrl}/tree`
            )
            .pipe(
            map((res) => res.data ?? [])
            );
    }

  /* =====================================================
     CREATE CATEGORY
  ===================================================== */
  createCategory(
    payload: CategoryPayload
  ): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(
      this.baseUrl,
      payload
    );
  }

  /* =====================================================
     UPDATE CATEGORY (name / isActive)
  ===================================================== */
  updateCategory(
    id: string,
    payload: Partial<CategoryPayload>
  ): Observable<ApiResponse<Category>> {
    return this.http.patch<ApiResponse<Category>>(
      `${this.baseUrl}/${id}`,
      payload
    );
  }

  /* =====================================================
     SOFT DELETE CATEGORY
  ===================================================== */
  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${id}`
    );
  }

  getCategoryById(id: string) {
      return this.http.get<Category>(
          `${this.baseUrl}/${id}`
      );
  }


}
