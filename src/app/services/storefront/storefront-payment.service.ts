// payment.service.ts
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiResponse } from "@app/models/api-response.model";
import { Constant } from "../constant/constant";
import { map } from "rxjs";

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);

  createPayment(payload: {
    orderId: string;
    paymentMethod: 'COD' | 'GCASH' | 'MAYA' | 'CARD';
  }) {
    return this.http.post<ApiResponse<any>>(
      `${Constant.API_BASE_URL}/${Constant.PAYMENT.CREATE}`,
      payload
    ).pipe(map(res => res.data));
  }

  retry(orderId: string, paymentMethod?: string) {
    return this.http.post<ApiResponse<{ redirectUrl: string; paymentId: string }>>(
      `${Constant.API_BASE_URL}/${Constant.PAYMENT.RETRY(orderId)}`,
      { paymentMethod }
    ).pipe(map(res => res.data));
  }

  getAttempts(orderId: string) {
    return this.http.get<ApiResponse<any[]>>(
      `${Constant.API_BASE_URL}/payments/order/${orderId}`
    ).pipe(map(res => res.data));
  }
}