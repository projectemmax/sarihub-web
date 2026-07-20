import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest, JwtPayload } from '@app/models/auth.model';
import { Constant } from '@app/services/constant/constant';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { UserProfileService } from '@app/core/user/user-profile.service';
import { ApiResponse } from '@app/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly TOKEN_KEY = 'accessToken';

    constructor(
        private http: HttpClient,
        private router: Router,
        private profileService: UserProfileService
    ) {}

    // =========================
    // AUTH ACTIONS
    // =========================

    login(payload: LoginRequest) {
        return this.http
        .post<ApiResponse<LoginResponse>>(
        `${Constant.API_BASE_URL}/${Constant.AUTH.LOGIN}`,
        payload
        )
        .pipe(
            tap((res) => {
                const { accessToken } = res.data; // ✅ FIX

                this.setToken(accessToken);
                this.profileService.loadMyProfile();
            })
        );
    }

    register(payload: RegisterRequest): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(
            `${Constant.API_BASE_URL}/${Constant.AUTH.REGISTER}`,
            {
                ...payload
            }
        );
    }

    logout(redirectTo: 'login' | 'storefront' = 'storefront') {
        localStorage.removeItem(this.TOKEN_KEY);
        this.profileService.clear();
        this.router.navigate([redirectTo === 'login' ? '/login' : '/storefront']);
    }

    // =========================
    // TOKEN / JWT
    // =========================

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    private setToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    getJwtPayload(): JwtPayload | null {
        const token = this.getToken();
        if (!token) return null;

        try {
        return jwtDecode<JwtPayload>(token);
        } catch {
        return null;
        }
    }
    getUserInitials(): string {
        const payload = this.getJwtPayload();

        if (!payload) return '';

        switch (payload.role) {
            case 'ADMIN':
                return 'AD';

            case 'SELLER':
                return 'SE';

            default:
                return 'CU';
        }
    }

    // =========================
    // STATE HELPERS
    // =========================

    isLoggedIn(): boolean {
        const payload = this.getJwtPayload();
        return !!payload && payload.exp * 1000 > Date.now();
    }

    getRole():
        | 'ADMIN'
        | 'SELLER'
        | 'CUSTOMER'
        | null {

        return this.getJwtPayload()?.role ?? null;
    }

    isAdmin(): boolean {
        return this.getRole() === 'ADMIN';
    }

    isSeller(): boolean {
        return this.getRole() === 'SELLER';
    }

    isCustomer(): boolean {
        return this.getRole() === 'CUSTOMER';
    }
}
