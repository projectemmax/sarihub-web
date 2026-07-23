import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, of } from 'rxjs';
import { Constant } from '@app/services/constant/constant';

@Injectable({ providedIn: 'root' })
export class SiteConfigService {

    private config$ = new BehaviorSubject<any>(null);
    private loaded = false;

    constructor(private http: HttpClient) {}

    loadConfig() {
        if (this.loaded) return of(this.config$.value);

        return this.http.get(
        `${Constant.API_BASE_URL}/${Constant.SITE_CONFIG.PUBLIC}`
        ).pipe(
            tap((res: any) => {
                const config = res.data ?? res;
                console.log("CONFIG", config)
                this.config$.next(config);
                this.loaded = true;
            })
        );
    }

    get() {
        return this.config$.asObservable();
    }

    get snapshot() {
        return this.config$.value;
    }

    getShippingFee(
        subtotal: number,
        customerProvince?: string,
        storeProvince: string = 'Metro Manila'
        ): number {
        const config = this.snapshot ?? {};

        const baseFee = Number(config['shipping.baseFee'] ?? 0);
        const sameProvinceFee = Number(
            config['shipping.sameProvinceFee'] ?? baseFee
        );
        const otherProvinceFee = Number(
            config['shipping.otherProvinceFee'] ?? baseFee
        );

        const freeThreshold = Number(
            config['shipping.freeThreshold'] ?? 0
        );

        const enableFreeShipping = !!config['shipping.enableFreeShipping'];

        if (enableFreeShipping && subtotal >= freeThreshold) {
            return 0;
        }

        if (!customerProvince || !storeProvince) {
            return baseFee;
        }

        return customerProvince === storeProvince
            ? sameProvinceFee
            : otherProvinceFee;
    }

}