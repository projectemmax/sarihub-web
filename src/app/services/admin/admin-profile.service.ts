import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Constant } from '../constant/constant';

@Injectable({
  providedIn: 'root'
})
export class AdminProfileService {
    private http = inject(HttpClient);

    private currentUserSubject = new BehaviorSubject<any>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    get currentUser() {
        return this.currentUserSubject.value;
    }

    getMyProfile() {
        return this.http.get<any>(
        `${Constant.API_BASE_URL}/${Constant.ADMIN.PROFILE.ME}`
        );
    }

    loadCurrentUser() {
        return this.http
        .get<any>(`${Constant.API_BASE_URL}/${Constant.ADMIN.PROFILE.ME}`)
        .pipe(
            tap((res) => {
                this.currentUserSubject.next(res.data.data);
            })
        );
    }

    refreshCurrentUser() {
        this.loadCurrentUser().subscribe();
    }

    uploadAvatar(formData: FormData) {
        return this.http
        .post<any>(
            `${Constant.API_BASE_URL}/${Constant.ADMIN.PROFILE.AVATAR}`,
            formData
        )
        .pipe(
            tap(() => {
            this.refreshCurrentUser();
            })
        );
    }

    updateProfile(payload: any) {
        return this.http
        .patch<any>(
            `${Constant.API_BASE_URL}/${Constant.ADMIN.PROFILE.UPDATE}`,
            payload
        )
        .pipe(
            tap(() => {
                this.refreshCurrentUser();
            })
        );
    }
}