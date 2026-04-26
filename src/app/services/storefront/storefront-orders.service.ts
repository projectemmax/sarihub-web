import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constant } from '@app/services/constant/constant';
import { map, Observable, tap } from 'rxjs';
import { ApiResponse } from '@app/models/api-response.model';
import { OrderDetail } from '@app/models/storefront/order-detail.model';

@Injectable({
  providedIn: 'root'
})
export class StorefrontOrdersService {

    private http = inject(HttpClient);

    getOrders(page = 1, limit = 10): Observable<OrderDetail[]> {
        return this.http.get<ApiResponse<OrderDetail[]>>(
            `${Constant.API_BASE_URL}/orders?page=${page}&limit=${limit}`
        ).pipe(
            map(res => res.data)
        );
    }

    getOrderById(orderId: string): Observable<OrderDetail> {
        return this.http.get<ApiResponse<OrderDetail>>(
            `${Constant.API_BASE_URL}/orders/${orderId}`
        ).pipe(
            map(res => res.data)
        );
    }

    getOrder(id: string): Observable<OrderDetail> {
        return this.http.get<ApiResponse<OrderDetail>>(
            `${Constant.API_BASE_URL}/${Constant.ORDERS.BASE}/${id}`
        ).pipe(
            map(res => res.data)
        );
    }

    checkout(payload: any): Observable<any> {
        return this.http.post<ApiResponse<any>>(
            `${Constant.API_BASE_URL}/${Constant.ORDERS.CHECKOUT}`,
            payload
        ).pipe(
            map(res => res.data)
        );
    }

    

}