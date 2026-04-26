import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constant } from '@app/services/constant/constant';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
    private http = inject(HttpClient);

    getCarts(): Observable<any[]> {
        return this.http
        .get<any>(
            `${Constant.API_BASE_URL}/${Constant.ADMIN.ORDERS.CARTS}`
        )
        .pipe(
            map(res => res.data ?? [])
        );
    }

    getCartById(orderId: string): Observable<any> {
        return this.http
        .get<any>(
            `${Constant.API_BASE_URL}/${Constant.ADMIN.ORDERS.CART_BY_ID(orderId)}`
        )
        .pipe(
            map(res => res.data ?? [])
        );
    }

    clearCart(orderId: string): Observable<void> {
        return this.http.patch<void>(
        `${Constant.API_BASE_URL}/${Constant.ADMIN.ORDERS.CART_CLEAR(orderId)}`,
        {}
        );
    }
}