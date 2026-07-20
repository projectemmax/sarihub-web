import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Constant } from '@app/services/constant/constant';

export interface UserProfile {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
    private profile$ = new BehaviorSubject<UserProfile | null>(null);

    constructor(private http: HttpClient) {}

    loadMyProfile() {

    return this.http
        .get<any>(
            `${Constant.API_BASE_URL}/${Constant.ADMIN.PROFILE.ME}`
        )
        .pipe(
            catchError(err => {

                if (err.status === 404) {
                    this.profile$.next(null);
                    return of(null);
                }

                throw err;

            })
        )
        .subscribe(res => {

            const profile = res?.data?.data;

            if (profile) {
                this.profile$.next(profile);
            }

        });

}

    clear() {
        this.profile$.next(null);
    }

    getProfile() {
        return this.profile$.asObservable();
    }

    getInitials(): string {
        const p = this.profile$.value;
        if (!p) return '';

        return `${p.firstName?.[0] ?? ''}${p.lastName?.[0] ?? ''}`.toUpperCase();
    }

    getFullName(): string {
        const p = this.profile$.value;
        return p ? `${p.firstName} ${p.lastName}` : '';
    }
}