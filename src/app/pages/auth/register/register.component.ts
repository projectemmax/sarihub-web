import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '@app/core/auth/auth.service';
import { ToastService } from '@app/core/services/toast.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword
    ? null
    : { passwordMismatch: true };
}

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly toastr = inject(ToastService);


    readonly isSubmitting = signal(false);
    readonly showPassword = signal(false);
    readonly showConfirmPassword = signal(false);
    readonly backendError = signal<string | null>(null);

    ngOnInit() {

        // Remove previous template CSS
        this.clearTemplateCss();

        // Load StarAdmin CSS
        this.loadCss('assets/admin/css/shared/style.css');
        this.loadCss('assets/admin/css/demo_1/style.css');

    }

    clearTemplateCss() {
        document.querySelectorAll('.template-css')
        .forEach(el => el.remove());
    }

    loadCss(path: string) {

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = path;

        // mark it so we can remove it later
        link.classList.add('template-css');

        document.head.appendChild(link);
    }

    readonly form = this.fb.group({
        firstName: ['', [Validators.required, Validators.maxLength(50)]],
        lastName: ['', [Validators.required, Validators.maxLength(50)]],
        email: [
            '',
            [
                Validators.required,
                Validators.email,
                Validators.maxLength(150)
            ]
        ],
        mobileNumber: [
            '',
            [
                Validators.required,
                Validators.pattern(/^(\+63|09)\d{9}$/)
            ]
        ],
        gender: this.fb.control<'MALE' | 'FEMALE' | 'OTHER' | null>(null),
        password: [
            '',
            [
                Validators.required,
                Validators.minLength(8),
                Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
            ]
        ],
        confirmPassword: ['', [Validators.required]],
        acceptTerms: [false, [Validators.requiredTrue]]
        },
        {
            validators: passwordMatchValidator
        }
    );

    get f() {
        return this.form.controls;
    }

    togglePassword(): void {
        this.showPassword.update(v => !v);
    }

    toggleConfirmPassword(): void {
        this.showConfirmPassword.update(v => !v);
    }

    submit(): void {
        this.backendError.set(null);

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);

        this.authService.register({
            firstName: this.form.value.firstName!,
            lastName: this.form.value.lastName!,
            email: this.form.value.email!.toLowerCase(),
            mobileNumber: this.form.value.mobileNumber!,
            password: this.form.value.password!,
            gender: (this.form.value.gender as 'MALE' | 'FEMALE' | 'OTHER' | null) ?? null
        }).subscribe({
            next: (res) => {
                this.toastr.success(
                    'Your account has been created successfully.',
                    'Registration Successful'
                );

                this.router.navigate(['/login'], {
                    queryParams: {
                        email: this.form.value.email
                    }
                });
            },
            error: (err) => {
                const message = err?.error?.message;

                if (message === 'Email already exists') {
                    this.form.controls.email.setErrors({
                        emailExists: true
                    });

                    this.form.controls.email.markAsTouched();

                    this.toastr.error(
                        'That email is already registered.',
                        'Registration Failed'
                    );
                } else {
                    this.backendError.set(
                        message || 'Unable to create account right now.'
                    );

                    this.toastr.error(
                        message || 'Unable to create account right now.',
                        'Registration Failed'
                    );
                }

                this.isSubmitting.set(false);
            }
        });
    }
}