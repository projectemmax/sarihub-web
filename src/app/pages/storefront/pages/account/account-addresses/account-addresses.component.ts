import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StorefrontAddressService } from '@app/services/storefront/storefront-address.service';
import { PsgcService } from '@app/services/location/psgc.service';
import { AddressModalComponent } from '@app/pages/storefront/components/address-modal/address-modal.component';
import { ToastService } from '@app/core/services/toast.service';

@Component({
  selector: 'app-account-addresses',
  standalone: true,
  imports: [
    CommonModule,
    AddressModalComponent
  ],
  templateUrl: './account-addresses.component.html',
  styleUrls: ['./account-addresses.component.scss']
})
export class AccountAddressesComponent implements OnInit {

    addresses: any[] = [];

    showAddressModal = false;
    editingAddress: any = null;
    isModalLoading = false;

    regions: any[] = [];
    provinces: any[] = [];
    cities: any[] = [];
    barangays: any[] = [];

    constructor(
        private addressService: StorefrontAddressService,
        private psgcService: PsgcService,
        private toastr: ToastService
    ) {}

    ngOnInit(): void {
        this.loadRegions();
        this.loadAddresses();
    }

    // =========================
    // INITIAL DATA
    // =========================

    loadRegions(): void {
        this.psgcService.getRegions().subscribe({
        next: (res: any) => {
            this.regions = Array.isArray(res)
            ? res
            : res.data ?? [];
        },
        error: (err) => {
            console.error('Failed to load regions', err);
        }
        });
    }

    loadAddresses(): void {
        this.addressService.getAddresses().subscribe({
        next: (addresses) => {
            this.addresses = addresses ?? [];
        },
        error: (err) => {
            console.error('Failed to load addresses', err);
        }
        });
    }

    // =========================
    // MODAL
    // =========================

    async openAddModal(): Promise<void> {
        this.isModalLoading = true;

        await new Promise(resolve => setTimeout(resolve));

        this.editingAddress = null;

        this.provinces = [];
        this.cities = [];
        this.barangays = [];

        this.showAddressModal = true;
        this.isModalLoading = false;
    }

    async editAddress(address: any): Promise<void> {
        this.isModalLoading = true;

        await new Promise(resolve => setTimeout(resolve));

        this.editingAddress = address;

        this.provinces = [];
        this.cities = [];
        this.barangays = [];

        const regionCode = address.regionCode ?? address.region;
        const provinceCode = address.provinceCode ?? address.province;
        const cityCode = address.cityCode ?? address.city;

        try {
        if (regionCode) {
            if (this.isNcrRegion(regionCode)) {
            await this.loadCitiesByRegion(regionCode);
            } else {
            await this.loadProvinces(regionCode);

            if (provinceCode) {
                await this.loadCities(provinceCode);
            }
            }
        }

        if (cityCode) {
            await this.loadBarangays(cityCode);
        }
        } finally {
        this.showAddressModal = true;
        this.isModalLoading = false;
        }
    }

    closeAddressModal(): void {
        this.showAddressModal = false;
        this.editingAddress = null;
    }

    // =========================
    // PSGC CHANGES
    // =========================

    onRegionChange(regionCode: string): void {
        this.provinces = [];
        this.cities = [];
        this.barangays = [];

        if (!regionCode) return;

        if (this.isNcrRegion(regionCode)) {
        this.psgcService.getCitiesByRegion(regionCode).subscribe({
            next: (res: any) => {
            this.cities = Array.isArray(res)
                ? res
                : res.data ?? [];
            },
            error: (err) => {
            console.error('Failed to load NCR cities', err);
            }
        });

        return;
        }

        this.psgcService.getProvinces(regionCode).subscribe({
        next: (res: any) => {
            this.provinces = Array.isArray(res)
            ? res
            : res.data ?? [];
        },
        error: (err) => {
            console.error('Failed to load provinces', err);
        }
        });
    }

    onProvinceChange(provinceCode: string): void {
        this.cities = [];
        this.barangays = [];

        if (!provinceCode) return;

        this.psgcService.getCities(provinceCode).subscribe({
        next: (res: any) => {
            this.cities = Array.isArray(res)
            ? res
            : res.data ?? [];
        },
        error: (err) => {
            console.error('Failed to load cities', err);
        }
        });
    }

    onCityChange(cityCode: string): void {
        this.barangays = [];

        if (!cityCode) return;

        this.psgcService.getBarangays(cityCode).subscribe({
        next: (res: any) => {
            this.barangays = Array.isArray(res)
            ? res
            : res.data ?? [];
        },
        error: (err) => {
            console.error('Failed to load barangays', err);
        }
        });
    }

    // =========================
    // SAVE ADDRESS
    // =========================

    saveAddress(formValue: any): void {
        const region = this.regions.find(
        r => r.code === formValue.region
        );

        const city = this.cities.find(
        c => c.code === formValue.city
        );

        const province = this.isNcrRegion(formValue.region)
        ? {
            code: city?.code,
            name: 'Metro Manila'
            }
        : this.provinces.find(
            p => p.code === formValue.province
            );

        const payload = {
        name: formValue.name,
        phone: formValue.phone,
        address: formValue.address,

        regionCode: region?.code,
        region: region?.name,

        provinceCode: province?.code,
        province: province?.name,

        cityCode: city?.code,
        city: city?.name,

        barangay: formValue.barangay
        };

        const request$ = this.editingAddress
        ? this.addressService.updateAddress(this.editingAddress.id, payload)
        : this.addressService.createAddress(payload);

        request$.subscribe({
        next: () => {
            this.loadAddresses();
            this.closeAddressModal();
        },
        error: (err) => {
            console.error('Failed to save address', err);
        }
        });
    }

    // =========================
    // ADDRESS ACTIONS
    // =========================

    setDefault(address: any): void {
        this.addressService.setDefault(address.id).subscribe({
        next: () => this.loadAddresses(),
        error: (err) => {
            console.error('Failed to set default address', err);
        }
        });
    }

    deleteAddress(address: any): void {
        if (address.isDefault) return;

        const confirmed = confirm(
        `Delete address for ${address.name}?`
        );

        if (!confirmed) return;

        this.addressService.deleteAddress(address.id).subscribe({
            next: () => {
                this.loadAddresses();

                this.toastr.success(
                    'Address deleted successfully',
                    'Deleted'
                );
            },
            error: (err) => {
                console.error('Failed to delete address', err);

                this.toastr.error(
                    err?.error?.message || 'Unable to delete address',
                    'Error'
                );

            }
        });
    }

    // =========================
    // HELPERS
    // =========================

    isNcrRegion(regionCode: string): boolean {
        return regionCode === '130000000';
    }

    private loadProvinces(regionCode: string): Promise<void> {
        return new Promise((resolve, reject) => {
        this.psgcService.getProvinces(regionCode).subscribe({
            next: (res: any) => {
            this.provinces = Array.isArray(res)
                ? res
                : res.data ?? [];
            resolve();
            },
            error: reject
        });
        });
    }

    private loadCities(provinceCode: string): Promise<void> {
        return new Promise((resolve, reject) => {
        this.psgcService.getCities(provinceCode).subscribe({
            next: (res: any) => {
            this.cities = Array.isArray(res)
                ? res
                : res.data ?? [];
            resolve();
            },
            error: reject
        });
        });
    }

    private loadCitiesByRegion(regionCode: string): Promise<void> {
        return new Promise((resolve, reject) => {
        this.psgcService.getCitiesByRegion(regionCode).subscribe({
            next: (res: any) => {
            this.cities = Array.isArray(res)
                ? res
                : res.data ?? [];
            resolve();
            },
            error: reject
        });
        });
    }

    private loadBarangays(cityCode: string): Promise<void> {
        return new Promise((resolve, reject) => {
        this.psgcService.getBarangays(cityCode).subscribe({
            next: (res: any) => {
            this.barangays = Array.isArray(res)
                ? res
                : res.data ?? [];
            resolve();
            },
            error: reject
        });
        });
    }
}