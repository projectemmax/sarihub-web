import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';

import { Constant } from '../constant/constant';

@Injectable({
  providedIn: 'root'
})
export class SellerReviewsService {

    constructor(
        private http: HttpClient
    ) {}

    getSellerReviews() {

        return this.http
            .get<any>(
                `${Constant.API_BASE_URL}/${Constant.SELLER.REVIEWS.BASE}`
            )
            .pipe(
                map((res: any) => {
                    return res.data ?? [];
                })
            );

    }

}