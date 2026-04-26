import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Constant } from "../constant/constant";
import { map, Observable } from "rxjs";
import { Address } from "@app/models/storefront/account-dashboard.model";
import { ApiResponse } from "@app/models/api-response.model";

@Injectable({ providedIn: 'root' })
export class StorefrontAddressService {

    constructor(private http: HttpClient) {}

    getAddresses(): Observable<Address[] | null> {
        return this.http.get<ApiResponse<Address[]>>(
        `${Constant.API_BASE_URL}/${Constant.CUSTOMER.ADDRESSES.BASE}`
        ).pipe(
            map(res => res.data ?? [])
        )
    }

    createAddress(payload: any) {
        return this.http.post(
        `${Constant.API_BASE_URL}/${Constant.CUSTOMER.ADDRESSES.BASE}`,
        payload
        );
    }

    deleteAddress(id: string) {
        return this.http.delete(
        `${Constant.API_BASE_URL}/${Constant.CUSTOMER.ADDRESSES.DELETE(id)}`
        );
    }

    setDefault(id: string) {
        return this.http.patch(
        `${Constant.API_BASE_URL}/${Constant.CUSTOMER.ADDRESSES.SET_DEFAULT(id)}`,
        {}
        );
    }

    updateAddress(id: string, payload: any) {
        return this.http.patch(
            `${Constant.API_BASE_URL}/${Constant.CUSTOMER.ADDRESSES.BY_ID(id)}`,
            payload
        );
    }

}