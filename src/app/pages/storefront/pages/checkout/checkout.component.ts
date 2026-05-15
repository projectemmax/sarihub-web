import {
  Component,
  OnInit,
  inject,
  DestroyRef,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  map,
  Observable,
  of,
  Subject,
  debounceTime,
  switchMap
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { StorefrontCartService } from '@app/services/storefront/storefront-cart.service';
import { StorefrontOrdersService } from '@app/services/storefront/storefront-orders.service';
import { StorefrontAddressService } from '@app/services/storefront/storefront-address.service';

import { StorefrontCartItem } from '@app/models/storefront/storefront-cart-item.model';
import { Constant } from '@app/services/constant/constant';
import { BreadcrumbComponent } from "../../components/breadcrumb/breadcrumb.component";
import { SiteConfigService } from '@app/core/services/site-config.service';
import { AddressModalComponent } from '../../components/address-modal/address-modal.component';
import { PsgcService } from '@app/services/location/psgc.service';
import { getImageUrlCloudinary } from '@app/core/utils/image.util'
import { PaymentService } from '@app/services/storefront/storefront-payment.service';

// ✅ Extend model (UI state only)
type CheckoutCartItem = StorefrontCartItem & {
  error?: string | null;
  availableStock?: number;
};

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BreadcrumbComponent,
    AddressModalComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

    private destroyRef = inject(DestroyRef);

    // =========================
    // CART
    // =========================
    items$!: Observable<StorefrontCartItem[]>;
    cartItems: CheckoutCartItem[] = [];

    subtotal$ = this.cartService.subtotal$;
    cartCount$ = this.cartService.cartCount$;

    // =========================
    // STATE
    // =========================
    isSubmitting = false;
    hasInvalidItems = false;
    showAddressModal = false;
    isAddingNewAddress = false;

    private validateTrigger$ = new Subject<void>();

    shippingFee = 0;
    subtotal = 0;
    selectedPayment: 'COD' | 'CARD' | 'MAYA' | 'GCASH' = 'COD';
    messageForSeller = '';

    showExitCheckoutModal = false;
    pendingNavigationUrl: string | null = null;

    orderPlaced = false;

    readonly getImageUrlCloudinary = getImageUrlCloudinary;

    // =========================
    // ADDRESS
    // =========================
    addresses: any[] = [];
    selectedAddress: any = null;

    showAddAddressForm = false;
    editingAddress: any = null;

    newAddressForm = this.fb.group({
        name: [''],
        phone: [''],
        address: [''],
        region: [''],
        province: [''],
        city: [''],
        barangay: ['']
    });

    regions: any[] = [];
    provinces: any[] = [];
    cities: any[] = [];
    barangays: any[] = [];

    // =========================
    // BREADCRUMB
    // =========================
    breadcrumb$ = of([
        { label: 'Home', url: '/' },
        { label: 'Cart', url: '/storefront/cart' },
        { label: 'Checkout' }
    ]);

    title$ = this.breadcrumb$.pipe(
        map(items => items[items.length - 1]?.label ?? '')
    );

    constructor(
        private fb: FormBuilder,
        private cartService: StorefrontCartService,
        private orderService: StorefrontOrdersService,
        private addressService: StorefrontAddressService,
        private siteConfigService: SiteConfigService,
        private psgcService: PsgcService,
        private paymentService: PaymentService,
        private router: Router
    ) {}

    // =========================
    // INIT
    // =========================
    ngOnInit(): void {
        this.items$ = this.cartService.items$;

        this.cartService.items$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(items => {
            this.cartItems = items;

            // 🔥 trigger validation when cart updates
            this.triggerValidation();
        });

        this.cartService.loadCart().subscribe();
        this.loadAddresses();

        // 🔥 validation pipeline (debounced)
        this.validateTrigger$
        .pipe(
            debounceTime(300),
            switchMap(() => this.cartService.validateCart())
        )
        .subscribe(res => this.applyValidation(res));
    }

    loadRegions(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.psgcService.getRegions().subscribe({
            next: (res: any) => {
                this.regions = Array.isArray(res)
                ? res
                : res.data ?? [];
                resolve();
            },
            error: reject
            });
        });
    }

    // =========================
    // VALIDATION (CORE)
    // =========================
    triggerValidation() {
        this.validateTrigger$.next();
    }

    applyValidation(res: any) {
        this.cartItems.forEach(item => {
            const vItem = res.data.items.find(
                (v: any) => v.orderItemId === item.id
            );

            if (!vItem) {
                item.error = null;
                return;
            }

            if (!vItem.valid && vItem.adjustedQty !== undefined) {
                const oldQty = item.quantity;

                this.cartService
                    .updateQuantity(item.id, vItem.adjustedQty)
                    .subscribe();

                if (oldQty !== vItem.adjustedQty) {
                    alert(`${item.productName}: Only ${vItem.adjustedQty} items available`);
                }
            }

            item.error = vItem.valid ? null : vItem.message;
            item.availableStock = vItem.availableStock;
        });

        this.hasInvalidItems = this.cartItems.some(item => !!item.error);

        console.log('cartItems after validation', this.cartItems);
        console.log('hasInvalidItems', this.hasInvalidItems);
    }

    // =========================
    // ADDRESS METHODS
    // =========================
    loadAddresses() {
        this.addressService.getAddresses().subscribe({
            next: (addresses) => {
            this.addresses = addresses ?? [];

            const defaultAddress =
                this.addresses.find((a: any) => a.isDefault);

            this.selectedAddress = defaultAddress ?? this.addresses[0] ?? null;

            this.refreshShipping();
            },
            error: (err) => {
            console.error('Failed to load addresses', err);
            this.addresses = [];
            this.selectedAddress = null;
            this.refreshShipping();
            }
        });
    }

    refreshShipping(): void {
        this.shippingFee = this.siteConfigService.getShippingFee(
            this.subtotal,
            this.selectedAddress?.province
        );
    }

    selectAddress(address: any) {
        this.selectedAddress = address;
        this.refreshShipping();
        this.showAddressModal = false;
    }

    openAddAddressForm(): void {
        this.isAddingNewAddress = true;
        this.showAddAddressForm = true;
        this.editingAddress = null;

        this.loadRegions();

        this.newAddressForm.reset({
            name: '',
            phone: '',
            address: '',
            region: '',
            province: '',
            city: '',
            barangay: ''
        });

        this.provinces = [];
        this.cities = [];
        this.barangays = [];
    }

    async editAddress(address: any): Promise<void> {
        this.isAddingNewAddress = false;
        this.showAddAddressForm = true;
        this.editingAddress = address;

        await this.loadRegions();

        const regionCode = address.regionCode ?? address.region;
        const provinceCode = address.provinceCode ?? address.province;
        const cityCode = address.cityCode ?? address.city;

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

        this.newAddressForm.patchValue({
            name: address.name,
            phone: address.phone,
            address: address.address,
            region: regionCode,
            province: provinceCode,
            city: cityCode,
            barangay: address.barangay
        });
    }

    saveAddress(formValue: any): void {
        const region = this.regions.find(r => r.code === formValue.region);

        const city = this.cities.find(c => c.code === formValue.city);

        const province = this.isNcrRegion(formValue.region)
            ? {
                code: formValue.region,
                name: 'Metro Manila'
            }
            : this.provinces.find(p => p.code === formValue.province);

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

            // keep modal open and return to address list
            this.showAddAddressForm = false;
            this.isAddingNewAddress = false;
            this.editingAddress = null;

            this.newAddressForm.reset({
                name: '',
                phone: '',
                address: '',
                region: '',
                province: '',
                city: '',
                barangay: ''
            });

            this.provinces = [];
            this.cities = [];
            this.barangays = [];
            },
            error: (err) => {
            console.error('Failed to save address', err);
            }
        });
    }

    deleteAddress(address: any) {
        if (!confirm('Delete this address?')) return;

        this.addressService.deleteAddress(address.id)
        .subscribe(() => this.loadAddresses());
    }

    setDefault(address: any) {
        this.addressService.setDefault(address.id)
        .subscribe(() => this.loadAddresses());
    }

    resetAddressForm() {
        this.showAddAddressForm = false;
        this.editingAddress = null;

        this.newAddressForm.reset({
            name: '',
            phone: '',
            address: '',
            region: '',
            province: '',
            city: '',
            barangay: ''
        });

        this.provinces = [];
        this.cities = [];
        this.barangays = [];
    }

    // =========================
    // PLACE ORDER
    // =========================
    placeOrder() {
        if (!this.selectedAddress) {
            alert('Please select a delivery address');
            return;
        }

        if (this.hasInvalidItems) {
            alert('Please fix invalid items before checkout');
            return;
        }

        if (this.isSubmitting) return;

        this.isSubmitting = true;

        const payload = {
            paymentMethod: this.selectedPayment,
            shippingFee: this.shippingFee,
            shippingName: this.selectedAddress.name,
            shippingPhone: this.selectedAddress.phone,
            shippingAddress: this.selectedAddress.address,
            shippingCity: this.selectedAddress.city,
            shippingProvince: this.selectedAddress.province,
            messageForSeller: this.messageForSeller
        };

        this.orderService.checkout(payload)
            .pipe(
            switchMap((order: any) => {
                return this.paymentService.createPayment({
                    orderId: order.id,
                    paymentMethod: this.selectedPayment
                }).pipe(
                    map(payment => ({ order, payment })) // 👈 preserve both
                );
            }),
            takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
            next: ({ order, payment }) => {
                this.isSubmitting = false;
                this.orderPlaced = true;

                this.cartService.loadCart().subscribe();

                if (this.selectedPayment === 'COD') {
                    this.router.navigate(['/storefront/order-success'], {
                        queryParams: {
                            orderId: order.id,
                            payment: 'cod'
                        }
                    });
                    return;
                }

                if (payment?.redirectUrl) {
                    window.location.href = payment.redirectUrl;
                    return;
                }

                console.error('No redirectUrl returned', payment);
                alert('Payment initialized but redirect URL is missing.');
            },
            error: (err) => {
                console.error('Checkout or Payment failed', err);
                this.isSubmitting = false;
                alert('Checkout failed');
            }
        });
    }

    // =========================
    // UTIL
    // =========================
    getTotal(subtotal: number): number {
        return subtotal + this.shippingFee;
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

    // Modal
    closeAddressModal(): void {
        this.showAddressModal = false;
        this.showAddAddressForm = false;
        this.isAddingNewAddress = false;
        this.editingAddress = null;
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

    //CONFIRM EXIT CHECKOUT
    confirmExitCheckout(url: string = '/cart') {
        this.pendingNavigationUrl = url;
        this.showExitCheckoutModal = true;
    }

    stayInCheckout() {
        this.showExitCheckoutModal = false;
        this.pendingNavigationUrl = null;
    }

    leaveCheckout() {

        this.showExitCheckoutModal = false;

        if (this.pendingNavigationUrl) {
            this.router.navigateByUrl(this.pendingNavigationUrl);
        }
    }

    // ADD LISTENER
    @HostListener('window:beforeunload', ['$event'])
    handleBeforeUnload(event: BeforeUnloadEvent) {

        // prevent warning after successful order
        if (this.orderPlaced) {
            return;
        }

        // only trigger if cart has items
        if (this.cartItems?.length) {

            event.preventDefault();
            event.returnValue = '';
        }
    }

}
