import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '@app/core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { StorefrontCartService } from '@app/services/storefront/storefront-cart.service';
import { ToastService } from '@app/core/services/toast.service';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

    error: string | null = null;
    year = new Date().getFullYear();

    form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
    });

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private cartService: StorefrontCartService,
        private toast: ToastService
    ) {}

    ngOnInit() {

        // Remove previous template CSS
        this.clearTemplateCss();

        // Load StarAdmin CSS
        this.loadCss('assets/admin/css/shared/style.css');
        this.loadCss('assets/admin/css/demo_1/style.css');

        this.form.valueChanges.subscribe(() => {
            this.error = null;
        });

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

    onLogin(): void {

        if (this.form.invalid) return;

        this.auth.login(this.form.getRawValue()).subscribe({
            next: () => {
                const pending = sessionStorage.getItem('pendingCartItem');

                if (pending) {
                    const item = JSON.parse(pending);

                    this.cartService.addToCart(item.productId, item.quantity).subscribe({
                        next: () => {
                            sessionStorage.removeItem('pendingCartItem');

                            this.toast.success('Item added to your cart');

                            this.cartService.loadCart().subscribe(() => {
                            this.router.navigate(['/cart']);
                            });
                        },
                        error: () => {
                            this.toast.error('Unable to add item to cart');
                            this.router.navigate(['/']);
                        }
                    });

                    return;
                }

                const returnUrl =
                    this.route.snapshot.queryParamMap.get('returnUrl');

                window.location.href = returnUrl || '/admin/dashboard';
            },
            error: err => {
                console.error('LOGIN ERROR FULL:', err);
                this.error =
                    err?.error?.message ||
                    'Invalid email or password';
            },
        });
    }



}