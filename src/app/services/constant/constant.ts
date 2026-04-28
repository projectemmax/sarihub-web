import { environment } from '../../../environments/environment';

export const Constant = {

    API_BASE_URL: environment.apiUrl,
    UPLOADS_BASE_URL: environment.uploadsUrl,
    
    // =========================
    // SITE CONFIG (GLOBAL)
    // =========================
    SITE_CONFIG: {
        BASE: 'site-config',
        PUBLIC: 'site-config/public',
        // Future-proof endpoints (for admin or advanced usage)
        UPDATE: 'admin/site-config',
        RESET: 'admin/site-config/reset',
    },

    // =========================
    // AUTH
    // =========================
    AUTH: {
        LOGIN: 'auth/login',
        REGISTER: 'auth/register',
    },

    // =========================
    // ADMIN APIs
    // =========================
    ADMIN: {
        DASHBOARD: {
            STATS: 'admin/dashboard/stats',
            ANALYTICS: 'admin/dashboard/analytics',
            TOP_PRODUCTS: 'admin/dashboard/top-products',
            LATEST_CUSTOMERS: 'admin/dashboard/latest-customers',
            PENDING_REVIEWS: 'admin/dashboard/pending-reviews',
        },

        PROFILE: {
            ME: 'customers/me',
            UPDATE: 'customers/me/profile',
            AVATAR: 'customers/me/avatar',
        },
        
        PRODUCTS: {
            BASE: 'admin/products',
            BY_ID: (id: number | string) => `admin/products/${id}`,
            IMAGE_UPLOAD: (id: number | string) =>
                `admin/products/${id}/image`,
            VARIANT_IMAGE_UPLOAD: (productId: string, variantId: string) =>
                `admin/products/${productId}/variants/${variantId}/upload`,
        },

        CATEGORIES: {
            BASE: 'admin/categories',
            BY_ID: (id: number | string) => `admin/categories/${id}`,
        },

        CUSTOMERS: {
            BASE: 'admin/customers',
            BY_ID: (id: string) => `admin/customers/${id}`,
            ACTIVATE: (id: string) => `admin/customers/${id}/activate`,
            DEACTIVATE: (id: string) => `admin/customers/${id}/deactivate`,
        },

        ORDERS: {
            BASE: 'admin/orders',
            CARTS: 'admin/carts',
            CART_BY_ID: (orderId: number | string) =>
                `admin/carts/${orderId}`,
            CART_CLEAR: (orderId: number | string) =>
                `admin/carts/${orderId}/clear`,
        },

        REVIEWS: {
            PENDING: 'admin/reviews/pending',

            APPROVE: (id: string) => `admin/reviews/${id}/approve`,
            REJECT: (id: string) => `admin/reviews/${id}/reject`,

            BULK_APPROVE: 'admin/reviews/bulk-approve',
            BULK_REJECT: 'admin/reviews/bulk-reject',
        },

    },

    // =========================
    // STOREFRONT APIs (PUBLIC)
    // =========================
    STOREFRONT: {
        PRODUCTS: {
            BASE: 'products',
        },
        CATEGORIES: {
            BASE: 'categories',
        },
    },

    ORDERS: {
        BASE: 'orders',
        MY: 'orders/my',
        CHECKOUT: 'orders/checkout',
        VALIDATE: '',
        STATUS: (id: number | string) => `orders/${id}/status`,
        REORDER: (id: number | string) => `orders/${id}/reorder`,
    },

    PAYMENT: {
        BASE: 'payments',
        CREATE: 'payments',
        RETRY: (orderId: string | number) =>
            `payments/${orderId}/retry`,
    },

    CUSTOMER: {

        OVERVIEW: 'account/dashboard',

        PROFILE: {
            ME: 'customers/me/profile',
            UPDATE: 'customers/me/profile',
            AVATAR: 'customers/me/avatar',
        },

        ADDRESSES: {
            BASE: 'customer/addresses',
            BY_ID: (id: string) => `customer/addresses/${id}`,
            DELETE: (id: string) => `customer/addresses/${id}`,
            SET_DEFAULT: (id: string) =>
                `customer/addresses/${id}/default`,
        },
    },

    LOCATIONS: {
        REGIONS: 'locations/regions',
        PROVINCES: (regionCode: string) =>
            `locations/regions/${regionCode}/provinces`,
        CITIES: (provinceCode: string) =>
            `locations/provinces/${provinceCode}/cities`,
        BARANGAYS: (cityCode: string) =>
            `locations/cities/${cityCode}/barangays`,
    },

};
