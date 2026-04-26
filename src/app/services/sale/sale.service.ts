import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '@app/models/api-response.model';
import { Sale } from '@app/models/sale.model';
import { Constant } from '../constant/constant';
import { SaleItem } from '@app/models/sale-item.model';

@Injectable({
  providedIn: 'root'
})
export class SaleService {

  constructor(private http: HttpClient) {}

  getSales(): Observable<ApiResponse<Sale[]>> {
    return this.http.get<ApiResponse<Sale[]>>(
      Constant.API_END_POINT + Constant.METHODS.GET_ALL_SALE_ITEM
    );
  }

  getSalesByCustomerId(custId: number) {
    return this.http.get<ApiResponse<Sale[]>>(
      Constant.API_END_POINT +
      Constant.METHODS.GET_SALES_BY_CUSTOMER_ID +
      custId
    );
  }

  getSaleById(saleId: number): Observable<ApiResponse<SaleItem[]>> {
    return this.http.get<ApiResponse<SaleItem[]>>(
      Constant.API_END_POINT +
      Constant.METHODS.OPEN_SALE_BY_ID +
      '?saleId=' + saleId
    );
  }
}
