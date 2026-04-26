import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { Constant } from '@app/services/constant/constant';
import { Router } from '@angular/router';
import { AccountDashboard } from '@app/models/storefront/account-dashboard.model';
import { CustomerProfile } from '@app/models/storefront/customer-profile.model';
import { ApiResponse } from '@app/models/api-response.model';
import { CurrentUser } from '@app/models/storefront/current-user.model';

@Injectable({
  providedIn: 'root',
})
export class AccountService {

    private userSubject = new BehaviorSubject<CurrentUser | null>(null);
    user$ = this.userSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    getMyProfile(): Observable<CustomerProfile | null> {
        return this.http.get<ApiResponse<{ data: CustomerProfile }>>(
            `${Constant.API_BASE_URL}/${Constant.CUSTOMER.PROFILE.ME}`
        ).pipe(
            tap(res => console.log('Raw profile response:', res)),
            map(res => res?.data?.data ?? null)
        );
    }

    loadProfile() {
        this.getMyProfile().subscribe(user => {
            if (!user) return;

            const fullName =
            `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

            this.userSubject.next({
                name: fullName,
                email: user.email,
                initials: this.getInitials(user.firstName, user.lastName),
                avatar: user.avatar
            });
        });
    }

    private getInitials(firstName?: string, lastName?: string): string {
        const first = firstName?.charAt(0) ?? '';
        const last = lastName?.charAt(0) ?? '';

        return (first + last).toUpperCase();
    }

    updateUserState(updatedUser: Partial<CustomerProfile>) {
        const current = this.userSubject.value;

        if (!current) return;

        this.userSubject.next({
            name: `${updatedUser.firstName ?? ''} ${updatedUser.lastName ?? ''}`.trim(),
            email: current.email, // preserve existing email
            initials: this.getInitials(
            updatedUser.firstName,
            updatedUser.lastName
            ),
            avatar: current.avatar
        });
    }
    

    uploadAvatar(file: File) {
        const formData = new FormData();
        formData.append('avatar', file);

        return this.http.post(
            `${Constant.API_BASE_URL}/${Constant.CUSTOMER.PROFILE.AVATAR}`,
            formData
        );
    }

    updateProfile(data: any) {
        return this.http.patch(
            `${Constant.API_BASE_URL}/${Constant.CUSTOMER.PROFILE.UPDATE}`,
            data
        );
    }

    getMyOrders(page = 1, limit = 10, status?: string) {
        let url = `${Constant.API_BASE_URL}/${Constant.ORDERS.MY}?page=${page}&limit=${limit}`;

        if (status) {
            url += `&status=${status}`;
        }
        return this.http.get(url);
    }

    reorder(id: string) {
        return this.http.post(
            `${Constant.API_BASE_URL}/${Constant.ORDERS.REORDER(id)}`,
            {}
        );
    }

    getDashboard(): Observable<AccountDashboard> {
        return this.http.get<any>(
            `${Constant.API_BASE_URL}/${Constant.CUSTOMER.OVERVIEW}`
        ).pipe(
            tap(res => console.log('Raw dashboard response:', res)),
            map(res => res.data)
        );
    }

}