import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { finalize } from 'rxjs';
import { UserProfileService } from '@app/core/user/user-profile.service';
import { AdminProfileService } from '@app/services/admin/admin-profile.service';
import { ToastService } from '@app/core/services/toast.service';
import { AuthService } from '@app/core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class AdminProfileComponent implements OnInit {
    private fb = inject(FormBuilder);
    private adminProfileService = inject(AdminProfileService)
    private toast = inject(ToastService);
    private authService = inject(AuthService);
    private router = inject(Router);

    profileForm!: FormGroup;

    loading = false;
    saving = false;
    uploadingAvatar = false;

    avatarPreview: string | null = null;
    role = '';

    ngOnInit(): void {
        this.initializeForm();
        this.loadProfile();
    }

    private initializeForm(): void {
        this.profileForm = this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: [{ value: '', disabled: true }],
        mobileNumber: [''],

        currentPassword: [''],
        newPassword: [''],
        confirmPassword: ['']
        });
    }

    loadProfile(): void {
        this.loading = true;

        this.adminProfileService
        .getMyProfile()
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
            next: (res) => {
                const profile = res.data.data;

                this.avatarPreview = profile.avatarUrl;
                this.role = profile.role;

                this.profileForm.patchValue({
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    email: profile.email,
                    mobileNumber: profile.mobileNo || ''
                });
            },
            error: (err) => {
                console.error('Failed to load profile', err);
            }
        });
    }

    onAvatarSelected(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (!input.files?.length) {
            return;
        }

        const file = input.files[0];

        const reader = new FileReader();
        reader.onload = () => {
            this.avatarPreview = reader.result as string;
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('avatar', file);

        this.uploadingAvatar = true;

        this.adminProfileService
        .uploadAvatar(formData)
        .pipe(finalize(() => (this.uploadingAvatar = false)))
        .subscribe({
            next: () => {
                this.toast.success('Avatar updated successfully');
                this.adminProfileService.refreshCurrentUser();
            },
            error: (err) => {
                this.toast.error('Failed to upload avatar');
            }
        });
    }

    saveProfile(): void {
        if (this.profileForm.invalid) {
        this.profileForm.markAllAsTouched();
        return;
        }

        const form = this.profileForm.getRawValue();

        const passwordChanged = !!form.newPassword;

        if (
            form.newPassword &&
            form.newPassword !== form.confirmPassword
        ) {
            this.profileForm.get('confirmPassword')?.setErrors({ mismatch: true });
            this.toast.warning('Passwords do not match');

            return;
        }

        const payload: any = {
            firstName: form.firstName,
            lastName: form.lastName,
            mobileNo: form.mobileNumber
        };

        if (form.newPassword) {
            payload.currentPassword = form.currentPassword;
            payload.newPassword = form.newPassword;
        }

        this.saving = true;

        this.adminProfileService
        .updateProfile(payload)
        .pipe(finalize(() => (this.saving = false)))
        .subscribe({
            next: () => {
                this.clearPasswordFields();

                if (passwordChanged) {
                    this.toast.success(
                    'Password changed successfully. Redirecting to login...'
                    );

                    setTimeout(() => {
                        this.authService.logout();
                        this.router.navigate(['/login']);
                    }, 2500);

                } else {
                    this.toast.success('Profile updated successfully');
                }
            },
            error: (err) => {
                const message =
                    err?.error?.message || 'Failed to update profile';

                    this.toast.error(message);
            }
        });
    }

    checkPasswordMatch(): void {
        const newPassword = this.profileForm.get('newPassword')?.value;
        const confirmPassword = this.profileForm.get('confirmPassword')?.value;

        if (!confirmPassword) {
            this.profileForm.get('confirmPassword')?.setErrors(null);
            return;
        }

        if (newPassword !== confirmPassword) {
            this.profileForm.get('confirmPassword')?.setErrors({ mismatch: true });
        } else {
            this.profileForm.get('confirmPassword')?.setErrors(null);
        }
    }

    private clearPasswordFields(): void {
        this.profileForm.patchValue({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });

        ['currentPassword', 'newPassword', 'confirmPassword'].forEach(field => {
            this.profileForm.get(field)?.setErrors(null);
            this.profileForm.get(field)?.markAsPristine();
            this.profileForm.get(field)?.markAsUntouched();
        });
    }

}