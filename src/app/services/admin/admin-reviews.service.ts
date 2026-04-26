import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constant } from '@app/services/constant/constant';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminReviewsService {

    constructor(private http: HttpClient) {}

    getPendingReviews() {
        return this.http
        .get(
            `${Constant.API_BASE_URL}/${Constant.ADMIN.REVIEWS.PENDING}`
        )
        .pipe(
            map((res: any) => res.data ?? [])
        );
    }

    approveReview(id: string) {
        return this.http.patch(
        `${Constant.API_BASE_URL}/${Constant.ADMIN.REVIEWS.APPROVE(id)}`,
        {}
        );
    }

    rejectReview(id: string) {
        return this.http.patch(
        `${Constant.API_BASE_URL}/${Constant.ADMIN.REVIEWS.REJECT(id)}`,
        {}
        );
    }

    // =============================
    // Bulk Approve Reviews
    // =============================
    bulkApprove(ids: string[]) {
        return this.http.patch(
        `${Constant.API_BASE_URL}/${Constant.ADMIN.REVIEWS.BULK_APPROVE}`,
        { ids }
        );
    }

    // =============================
    // Bulk Reject Reviews
    // =============================
    bulkReject(ids: string[]) {
        return this.http.patch(
        `${Constant.API_BASE_URL}/${Constant.ADMIN.REVIEWS.BULK_REJECT}`,
        { ids }
        );
    }

}