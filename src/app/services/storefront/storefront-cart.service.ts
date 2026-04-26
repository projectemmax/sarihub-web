import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorefrontCartItem } from '@app/models/storefront/storefront-cart-item.model';
import { Constant } from '@app/services/constant/constant';
import { CartResponse } from '@app/models/storefront/storefront-cart-response.model';
import { CartValidationResponse } from '@app/models/storefront/cart-validation-response.model';



@Injectable({ providedIn: 'root' })
export class StorefrontCartService {
    private http = inject(HttpClient);

    private readonly cartItemsSubject =
        new BehaviorSubject<StorefrontCartItem[]>([]);
    readonly items$ = this.cartItemsSubject.asObservable();

    readonly cartCount$ = this.items$.pipe(
        map(items =>
        items.reduce((sum, item) => sum + item.quantity, 0)
        )
    );

    readonly subtotal$ = this.items$.pipe(
        map(items =>
        items.reduce(
            (sum, item) =>
            sum + Number(item.subtotal),
            0
        )
        )
    );

        constructor() {}

        // 🔹 Load Cart (no internal subscribe)
        loadCart() {
            return this.http
                .get<any>(`${Constant.API_BASE_URL}/cart`)
                .pipe(
                tap(res => {
                    const items = res?.data?.items ?? [];
                    this.cartItemsSubject.next(items);
                }),
                catchError(err => {
                    console.error('Load cart failed', err);
                    this.cartItemsSubject.next([]);
                    return throwError(() => err);
                })
            );
        }

        // 🔹 Add to Cart
        addToCart(productId: string, quantity = 1) {
            console.log('REQUEST BODY', { productId, quantity });
            return this.http
                .post<any>(
                `${Constant.API_BASE_URL}/cart/items`,
                { productId, quantity }
                )
                .pipe(
                tap(res => {
                    const items = res?.data?.items ?? [];
                    this.cartItemsSubject.next(items);
                }),
                catchError(err => {
                    console.error('Add to cart failed', err);
                    return throwError(() => err);
                })
            );
        }

        // 🔹 Update Quantity
        updateQuantity(orderItemId: string, quantity: number) {
            return this.http
                .patch<any>(
                    `${Constant.API_BASE_URL}/cart/items/${orderItemId}`,
                    { quantity }
                )
                .pipe(
                tap(res => {
                    this.cartItemsSubject.next(res?.data?.items ?? []);
                })
            );
        }

    // 🔹 Remove Item
    remove(productId: string) {
        return this.http
            .delete<any>(`${Constant.API_BASE_URL}/cart/items/${productId}`)
            .pipe(
            tap(res => {
                this.cartItemsSubject.next(res.data.items ?? []);
            }),
            catchError(err => {
                console.error('Remove item failed', err);
                return throwError(() => err);
            })
        );
    }

    // 🔹 Clear Cart
    clear() {
        return this.http
        .delete(`${Constant.API_BASE_URL}/cart`)
        .pipe(
            tap(() => this.cartItemsSubject.next([]))
        );
    }

    validateCart(): Observable<CartValidationResponse> {
        return this.http.get<CartValidationResponse>(
        `${Constant.API_BASE_URL}/cart/validate`
        );
    }

}