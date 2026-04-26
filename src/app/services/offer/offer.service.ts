import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '@app/models/api-response.model';
import { Offer } from '@app/models/offer.model';
import { Constant } from '../constant/constant';

@Injectable({
  providedIn: 'root'
})
export class OfferService {

  constructor(private http: HttpClient) {}

  getOffers(): Observable<ApiResponse<Offer[]>> {
    return this.http.get<ApiResponse<Offer[]>>(
      Constant.API_END_POINT + Constant.METHODS.GET_ALL_OFFERS
    );
  }

  addOffer(payload: Partial<Offer>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      Constant.API_END_POINT + Constant.METHODS.CREATE_NEW_OFFER,
      payload
    );
  }

  deleteOffer(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      Constant.API_END_POINT + Constant.METHODS.DELETE_OFFER + id
    );
  }
}
