import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constant } from '../constant/constant';

@Injectable({
  providedIn: 'root'
})
export class PsgcService {

    constructor(private http: HttpClient) {}

    getRegions() {
        return this.http.get(
        `${Constant.API_BASE_URL}/${Constant.LOCATIONS.REGIONS}`
        );
    }

    getProvinces(regionCode: string) {
        return this.http.get(
        `${Constant.API_BASE_URL}/${Constant.LOCATIONS.PROVINCES(regionCode)}`
        );
    }

    getCitiesByRegion(regionCode: string) {
        return this.http.get(
            `${Constant.API_BASE_URL}/${Constant.LOCATIONS.REGIONS}/${regionCode}/cities`
        );
    }

    getCities(provinceCode: string) {
        return this.http.get(
        `${Constant.API_BASE_URL}/${Constant.LOCATIONS.CITIES(provinceCode)}`
        );
    }

    getBarangays(cityCode: string) {
        return this.http.get(
        `${Constant.API_BASE_URL}/${Constant.LOCATIONS.BARANGAYS(cityCode)}`
        );
    }
}