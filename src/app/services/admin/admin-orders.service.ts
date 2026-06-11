import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constant } from '../constant/constant';
import { AuthService } from '@app/core/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminOrdersService {
    
    private get api() {

        return this.auth.getRole() === 'SELLER'
            ? `${Constant.API_BASE_URL}/seller/orders`
            : `${Constant.API_BASE_URL}/admin/orders`;

    }

    constructor(
        private http: HttpClient, 
        private auth: AuthService
    ) {}

    getOrders(params: {
        page: number;
        limit: number;
        status?: string;
        search?: string;
    }): Observable<any> {
        let httpParams = new HttpParams()
        .set('page', params.page)
        .set('limit', params.limit);

        if (params.status && params.status !== 'ALL') {
        httpParams = httpParams.set('status', params.status);
        }

        if (params.search) {
        httpParams = httpParams.set('search', params.search);
        }

        return this.http.get(this.api, { params: httpParams });
    }

    getOrder(id: string) {
        return this.http.get(`${this.api}/${id}`);
    }

    updateStatus(
        id: string,
        payload: {
        status: string;
        remarks?: string;
        trackingNumber?: string;
        },
    ) {
        return this.http.patch(`${this.api}/${id}/status`, payload);
    }

    shipOrder(
        id: string,
        payload: {
            courierName?: string;
            courierCode?: string;
            trackingNumber: string;
            shippingMethod?: string;
            shippingFee?: number;
            remarks?: string;
        },
    ) {
        return this.http.patch(`${this.api}/${id}/ship`, payload);
    }
}
