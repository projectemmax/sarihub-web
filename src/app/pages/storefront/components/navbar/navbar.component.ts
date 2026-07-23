import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@app/core/auth/auth.service';
import { SiteConfigService } from '@app/core/services/site-config.service';
import { StorefrontCartService } from '@app/services/storefront/storefront-cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
    isScrolled = false;
    isDesktop = window.innerWidth >= 992;
    mobileOpen = false;
    config: any = {};

    auth = inject(AuthService);
    private router = inject(Router);
    private cartService = inject(StorefrontCartService);
    private siteConfigService = inject(SiteConfigService)

    readonly cartCount$ = this.cartService.cartCount$;

    ngOnInit(): void {
        this.siteConfigService.get().subscribe(config => {
            console.log('CONFIG:', config);
            this.config = config || {}; // ✅ IMPORTANT
        });
    }

    @HostListener('window:resize')
    onResize() {
        this.isDesktop = window.innerWidth >= 992;
    }

    @HostListener('window:scroll')
    onScroll() {
        this.isScrolled = window.scrollY > 55;
    }

    toggleMobileMenu() {
        this.mobileOpen = !this.mobileOpen;
    }

    goToLogin() {
        this.router.navigate(['/login']);
    }

    goToRegister() {
        this.router.navigate(['/register']);
    }

    logout() {
        this.auth.logout();
    }
    resetCart() {
        this.cartService.clear().subscribe();
    }

    get isCartPage(): boolean {

        return (
            this.router.url.startsWith('/storefront/cart') ||
            this.router.url.startsWith('/storefront/checkout') ||
            this.router.url.startsWith('/storefront/orders')
        );
    }



}