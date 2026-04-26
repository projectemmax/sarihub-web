import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { Constant } from '@app/services/constant/constant';
import {
  AdminCustomer,
  AdminCustomerResponse
} from '@app/models/customer-admin.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

    private readonly baseUrl =
        `${Constant.API_BASE_URL}/${Constant.ADMIN.CUSTOMERS.BASE}`;

    constructor(private http: HttpClient) {}

    // --------------------------------
    // ADMIN: GET ALL CUSTOMERS
    // --------------------------------
    getCustomers(): Observable<AdminCustomerResponse> {
        return this.http
            .get<any>(this.baseUrl)
            .pipe(
                map(res => res.data ?? [])
            );
    }

    // --------------------------------
    // ADMIN: GET CUSTOMER BY ID (optional)
    // --------------------------------
    getCustomerById(id: string): Observable< AdminCustomerResponse | null> {
        return this.http
        .get<any>(
            `${Constant.API_BASE_URL}/${Constant.ADMIN.CUSTOMERS.BY_ID(id)}`
        )
        .pipe(
            map(res => res.data ?? null)
        );
    }

    // --------------------------------
    // ADMIN: ACTIVATE / DEACTIVATE (future-ready)
    // --------------------------------
    activateCustomer(id: string) {
        return this.http.patch(
        `${Constant.API_BASE_URL}/${Constant.ADMIN.CUSTOMERS.ACTIVATE(id)}`,
        {}
        );
    }

    deactivateCustomer(id: string) {
        return this.http.patch(
        `${Constant.API_BASE_URL}/${Constant.ADMIN.CUSTOMERS.DEACTIVATE(id)}`,
        {}
        );
    }
}
