import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '@app/models/api-response.model';
import {
    GeneratedProductDescription,
    GenerateProductDescriptionRequest,
} from '@app/models/ai-product-description.model';
import { Constant } from '@app/services/constant/constant';

@Injectable({ providedIn: 'root' })
export class SellerAiService {

    constructor(private http: HttpClient) {}

    generateProductDescription(
        payload: GenerateProductDescriptionRequest
    ): Observable<ApiResponse<GeneratedProductDescription>> {
        return this.http.post<ApiResponse<GeneratedProductDescription>>(
            `${Constant.API_BASE_URL}/${Constant.SELLER.AI.GENERATE_DESCRIPTION}`,
            payload
        );
    }
}
