import { Routes } from '@angular/router';

// =========================
// PUBLIC
// =========================
import { LoginComponent } from './pages/auth/login/login.component';

// =========================
// ADMIN
// =========================
import { AdminLayoutComponent } from '@app/pages/admin/layout/admin-layout/admin-layout.component';
import { ProductsComponent } from '@app/pages/admin/products/products.component';
import { CategoriesComponent } from '@app/pages/admin/categories/categories.component';
import { CustomerComponent } from '@app/pages/admin/customer/customer.component';
import { CartComponent } from '@app/pages/admin/cart/cart.component';
import { SiteConfigComponent } from '@app/pages/admin/site-config/site-config.component'
import { ReviewsComponent } from '@app/pages/admin/reviews/reviews.component';
import { OrderComponent } from '@app/pages/admin/order/order.component';

// =========================
// STOREFRONT
// =========================
import { StorefrontLayoutComponent } from '@app/pages/storefront/layout/layout.component';

// =========================
// GUARDS
// =========================
import { AuthGuard } from '@app/core/guards/auth.guard';
import { roleGuard, roleGuardAny } from '@app/core/guards/role.guard';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';

export const routes: Routes = [

    // =========================
    // DEFAULT
    // =========================
    {
        path: '',
        redirectTo: 'storefront',
        pathMatch: 'full'
    },

    // LOGIN (public admin page)
    {
        path: 'login',
        loadComponent: () =>
            import('@app/pages/auth/login/login.component')
            .then(m => m.LoginComponent)
    },

    {
        path: 'register',
        loadComponent: () =>
            import('./pages/auth/register/register.component')
            .then(m => m.RegisterComponent)
    },

    // =========================
    // ADMIN AREA
    // =========================
    {
        path: 'admin',
        component: AdminLayoutComponent,
        children: 
        [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },

            {
                path: 'dashboard',
                canActivate: [
                    AuthGuard,
                    roleGuardAny([
                        'ADMIN',
                        'SELLER'
                    ])
                ],
                loadComponent: () =>
                    import('@app/pages/admin/dashboard/dashboard.component')
                    .then(m => m.DashboardComponent)
            },

            {
                path: 'products',
                canActivate: [
                    AuthGuard,
                    roleGuardAny([
                        'ADMIN',
                        'SELLER'
                    ])
                ],
                loadComponent: () =>
                    import('@app/pages/admin/products/products.component')
                    .then(m => m.ProductsComponent)
            },

            {
                path: 'products/create',
                canActivate: [
                    AuthGuard,
                    roleGuardAny([
                        'ADMIN',
                        'SELLER'
                    ])
                ],
                canDeactivate: [unsavedChangesGuard],
                loadComponent: () =>
                    import('@app/pages/admin/products/product-form/product-form.component')
                    .then(m => m.ProductFormComponent)
            },

            {
                path: 'products/edit/:id',
                canActivate: [
                    AuthGuard,
                    roleGuardAny([
                        'ADMIN',
                        'SELLER'
                    ])
                ],
                canDeactivate: [unsavedChangesGuard],
                loadComponent: () =>
                    import('@app/pages/admin/products/product-form/product-form.component')
                    .then(m => m.ProductFormComponent)
            },

            {
                path: 'categories',
                canActivate: [AuthGuard, roleGuard('ADMIN')],
                loadComponent: () =>
                    import('@app/pages/admin/categories/categories.component')
                    .then(m => m.CategoriesComponent)
            },

            {
                path: 'customers',
                canActivate: [AuthGuard, roleGuard('ADMIN')],
                loadComponent: () =>
                    import('@app/pages/admin/customer/customer.component')
                    .then(m => m.CustomerComponent)
            },

            {
                path: 'orders',
                canActivate: [
                    AuthGuard,
                    roleGuardAny([
                        'ADMIN',
                        'SELLER'
                    ])
                ],
                loadComponent: () =>
                    import('@app/pages/admin/order/order.component')
                        .then(m => m.OrderComponent)
            },

            {
                path: 'carts',
                canActivate: [
                    AuthGuard,
                    roleGuardAny([
                        'ADMIN'
                    ])
                ],
                loadComponent: () =>
                    import('@app/pages/admin/cart/cart.component')
                    .then(m => m.CartComponent)
            },

            {
                path: 'reviews',
                canActivate: [
                    AuthGuard,
                    roleGuardAny([
                        'ADMIN',
                        'SELLER'
                    ])
                ],
                loadComponent: () =>
                    import('@app/pages/admin/reviews/reviews.component')
                    .then(m => m.ReviewsComponent)
            },

            {
                path: 'settings',
                children: [
                    {
                        path: 'profile',
                        canActivate: [AuthGuard, roleGuard('ADMIN')],
                        loadComponent: () =>
                            import('@app/pages/admin/profile/profile.component')
                            .then(m => m.AdminProfileComponent)
                    },

                    {
                        path: 'site-config',
                        loadComponent: () =>
                            import('@app/pages/admin/site-config/site-config.component')
                            .then(m => m.SiteConfigComponent),
                    }
                ]
            }

        ]
    },

    // =========================
    // STOREFRONT AREA
    // =========================
    {
        path: 'storefront',
        component: StorefrontLayoutComponent,
        children: [

        // HOME
        {
            path: '',
            loadComponent: () =>
            import('@app/pages/storefront/pages/home/home.component')
                .then(m => m.HomeComponent)
        },

        // SHOP
        {
            path: 'shop',
            loadComponent: () =>
            import('@app/pages/storefront/pages/shop/shop.component')
                .then(m => m.ShopComponent)
        },

        // PRODUCT DETAIL
        {
            path: 'product/:slug',
            loadComponent: () =>
            import('@app/pages/storefront/pages/product-detail/product-detail.component')
                .then(m => m.ProductDetailComponent)
        },

        // CART
        {
            path: 'cart',
            loadComponent: () =>
            import('@app/pages/storefront/pages/cart/cart.component')
                .then(m => m.CartComponent)
        },

        // CHECKOUT
        {
            path: 'checkout',
            canActivate: [AuthGuard],
            loadComponent: () =>
            import('@app/pages/storefront/pages/checkout/checkout.component')
                .then(m => m.CheckoutComponent)
        },

        // ORDERS
        {
            path: 'orders',
            canActivate: [AuthGuard],
            loadComponent: () =>
            import('@app/pages/storefront/pages/orders/orders.component')
                .then(m => m.OrdersComponent)
        },
        {
            path: 'order-success',
            loadComponent: () =>
                import('@app/pages/storefront/pages/order-success/order-success.component')
                .then(m => m.OrderSuccessComponent)
        },

        {
            path: 'payment-failed',
            loadComponent: () =>
                import('@app/pages/storefront/pages/order-failed/order-failed.component')
                .then(m => m.OrderFailedComponent)
        },

        // =========================
        // ACCOUNT AREA
        // =========================
        {
            path: 'account',
            canActivate: [AuthGuard],
            loadComponent: () =>
            import('@app/pages/storefront/pages/account/account.component')
                .then(m => m.AccountComponent),

            children: [

            {
                path: '',
                redirectTo: 'overview',
                pathMatch: 'full'
            },
            {
                path: 'overview',
                loadComponent: () =>
                import('@app/pages/storefront/pages/account/account-overview/account-overview.component')
                    .then(m => m.AccountOverviewComponent)
            },
            {
                path: 'profile',
                loadComponent: () =>
                import('@app/pages/storefront/pages/account/account-profile/account-profile.component')
                    .then(m => m.AccountProfileComponent)
            },
            {
                path: 'orders',
                loadComponent: () =>
                import('@app/pages/storefront/pages/account/account-orders/account-orders.component')
                    .then(m => m.AccountOrdersComponent)
            },
            {
                path: 'orders/:id',
                canActivate: [AuthGuard],
                loadComponent: () =>
                import('@app/pages/storefront/pages/account/account-orders/order-detail/order-detail.component')
                    .then(m => m.OrderDetailComponent)
            },
            {
                path: 'addresses',
                loadComponent: () =>
                import('@app/pages/storefront/pages/account/account-addresses/account-addresses.component')
                    .then(m => m.AccountAddressesComponent)
            },

            {
                path: 'payments',
                loadComponent: () =>
                import('@app/pages/storefront/pages/account/account-payments/account-payments.component')
                    .then(m => m.AccountPaymentsComponent)
            }

            ]
        }

        ]
    },

    // =========================
    // FALLBACK
    // =========================
    {
        path: '**',
        redirectTo: 'storefront'
    }

];