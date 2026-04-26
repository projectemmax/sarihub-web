import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constant } from '@app/services/constant/constant';

@Injectable({ providedIn: 'root' })
export class SiteConfigAdminService {

    constructor(private http: HttpClient) {}

    getAll() {
        return this.http.get<any[]>(
        `${Constant.API_BASE_URL}/${Constant.SITE_CONFIG.BASE}`
        );
    }

    updateBulk(configs: { key: string; value: any }[]) {
        return this.http.patch(
        `${Constant.API_BASE_URL}/${Constant.SITE_CONFIG.BASE}`,
        configs
        );
    }
}