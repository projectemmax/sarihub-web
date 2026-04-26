import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constant } from '@app/services/constant/constant';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '@app/models/api-response.model';
import { Review } from '@app/models/storefront/review.model';
import { ReviewResponse } from '@app/models/storefront/review-response.model';
import { CreateReviewResponse } from '@app/models/storefront/create-review-response.model';

@Injectable({ providedIn: 'root' })
export class StorefrontReviewService {

    private readonly baseUrl = `${Constant.API_BASE_URL}/reviews`;

    constructor(private http: HttpClient) {}

    getProductReviews(slug: string) {
        return this.http.get<ReviewResponse>(
        `/api/products/${slug}/reviews`
        );
    }

    getMyReview(slug: string): Observable<Review | null> {
        return this.http
            .get<ApiResponse<{ data: Review | null }>>(
            `${this.baseUrl}/${slug}/me`
            )
            .pipe(
                map(res => res.data?.data ?? null)
            );
    }

    submitReview(slug: string, payload: any) {
        return this.http.post<Review>(
        `/api/reviews/${slug}`,
        payload
        );
    }

    voteReview(reviewId: string) {
        return this.http.post(
        `${this.baseUrl}/${reviewId}/vote`,
        {}
        );
    }

    uploadReviewImages(reviewId: string, formData: FormData) {
        return this.http.post(
        `/api/reviews/${reviewId}/images`,
        formData,
        {
            reportProgress: true,
            observe: 'events'
        }
        );
    }

}