import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constant } from '../constant/constant';
import { map, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StorefrontPurchaseService {

    constructor(private http: HttpClient) {}

    hasPurchasedProduct(slug: string) {
        console.log('Checking purchase for slug:', slug);

        return this.http.get<any>(
            `${Constant.API_BASE_URL}/products/${slug}/has-purchased`
        ).pipe(
            tap(res => console.log('Purchase response:', res)),
            map(res => res.data?.data ?? res.data ?? false)
        );
    }

}