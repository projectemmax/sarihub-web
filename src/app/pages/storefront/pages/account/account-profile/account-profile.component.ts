import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Constant } from '@app/services/constant/constant';
import { AccountService } from '@app/services/storefront/storefront-account.service'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-account-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.css']
})
export class AccountProfileComponent implements OnInit {

    profileForm!: FormGroup;
    avatar: string | null = null;
    isSaving = false;
    uploadError: string | null = null;

    constructor(
        private fb: FormBuilder,
        private accountService: AccountService,
        private snackBar: MatSnackBar
    ) {}

    formatDate(date: string) {
        return date ? date.split('T')[0] : null;
    }

    ngOnInit(): void {
        this.profileForm = this.fb.group({
            username: [{ value: '', disabled: true }],
            name: ['', Validators.required],
            email: [{ value: '', disabled: true }],
            phone: [
                '',
                [
                Validators.required,
                Validators.pattern(/^09\d{9}$/) // PH mobile format
                ]
            ],
            gender: ['', Validators.required],
            birthdate: ['', Validators.required]
        });

        this.loadProfile();
    }

    loadProfile() {
        this.accountService.getMyProfile().subscribe({
            next: (profile) => {
                if (!profile) return;
                console.log("profile", profile);

                this.avatar = profile.avatar ?? null;

                this.profileForm.patchValue({
                    username: profile.email,
                    name: `${profile.firstName} ${profile.lastName}`,
                    email: profile.email,
                    phone: profile.mobileNo,
                    gender: profile.gender,
                    birthdate: this.formatDate(profile.birthdate ?? '')
                });
            }
        });
    }

    avatarUrl() {
        if (!this.avatar) {
        return 'assets/img/avatar-placeholder.png';
        }
        return Constant.UPLOADS_BASE_URL + this.avatar;
    }

    onFileSelected(event: any) {

        const file = event.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png'];

        // Validate type
        if (!allowedTypes.includes(file.type)) {
            this.uploadError = 'Only JPG/PNG files are allowed';
            return;
        }

        // Validate size (1MB)
        if (file.size > 1 * 1024 * 1024) {
            this.uploadError = 'Max file size is 1MB';
            return;
        }

        this.uploadError = null;

        // ✅ Preview immediately
        const reader = new FileReader();
        reader.onload = () => {
            this.avatar = reader.result as string;
        };
        reader.readAsDataURL(file);

        // ✅ Upload
        this.accountService.uploadAvatar(file).subscribe({
            next: (res: any) => {

                this.avatar = res.avatar;

                // 🔥 sync sidebar instantly
                this.accountService.loadProfile();

                this.snackBar.open(
                    'Avatar updated successfully',
                    undefined,
                    {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    }
                );
            },

            error: (err) => {

                this.uploadError =
                    err.error?.message || 'Upload failed';

                this.snackBar.open(
                    this.uploadError ?? 'Upload failed',
                    undefined,
                    {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    }
                );
            }
        });
    }

    saveProfile() {
        if (this.profileForm.invalid) {
            this.profileForm.markAllAsTouched();
            return;
        }

        const form = this.profileForm.getRawValue();
        const nameParts = form.name.split(' ');

        const payload = {
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' '),
            mobileNo: form.phone,
            gender: form.gender,
            birthdate: form.birthdate
        };

        this.isSaving = true;

        this.accountService.updateProfile(payload).subscribe({
            next: () => {
                this.accountService.updateUserState(payload);
                this.profileForm.markAsPristine();
                this.isSaving = false;
            },
            error: () => {
                this.isSaving = false;

            }
        });
    }

}