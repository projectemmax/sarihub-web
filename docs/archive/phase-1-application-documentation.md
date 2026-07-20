# MediStore Ecommerce Application - Phase 1 Documentation

## 1. Overview

MediStore is a web-based ecommerce application designed for selling medical supplies and healthcare-related products online. Phase 1 focuses on delivering the core buying experience for customers and the essential administration tools needed to manage products, categories, customers, orders, carts, reviews, and storefront settings.

The application is split into two main areas:

- Storefront: the customer-facing shopping website.
- Admin Portal: the protected management area for business administrators.

This Phase 1 release provides a functional foundation that can already support product browsing, account registration, cart management, checkout, order tracking, and backend administration.

## 2. Phase 1 Goals

The goal of Phase 1 is to provide a usable ecommerce platform with the minimum complete feature set required to operate an online store.

Phase 1 includes:

- Public storefront homepage and shop pages.
- Product listing, filtering, and product details.
- Customer authentication and account pages.
- Cart and checkout flow.
- Address management.
- Order success and failed payment pages.
- Admin dashboard and operational management screens.
- Product, category, customer, cart, order, review, and site configuration management.
- Site branding and storefront content configuration.

## 3. User Roles

### Customer

Customers can browse products, view product details, register or log in, add products to cart, manage addresses, place orders, and view their order history.

### Administrator

Administrators can access the admin portal after authentication. The admin role can manage products, categories, customers, carts, reviews, site configuration, and operational dashboard data.

## 4. Storefront Features

### Homepage

The homepage introduces the store brand and highlights the product offering. It supports configurable hero banner content through site configuration, including title, subtitle, tagline, and background image.

### Shop Page

The shop page allows customers to browse available products. It supports product discovery through category and filter-based browsing.

### Product Details

The product detail page shows product information, images, options or variants where available, delivery information, trust badges, reviews, and purchase-related actions.

### Cart

Customers can add products to cart, update quantities, remove items, and review their cart before checkout. The cart is connected to backend validation to help prevent invalid quantities or unavailable stock during checkout.

### Checkout

The checkout flow includes:

- Cart validation.
- Shipping address selection.
- New address creation.
- Shipping fee calculation support.
- Payment method selection.
- Order placement.

Phase 1 supports cash on delivery and contains structure for card, Maya, and GCash payment options.

### Customer Account

Authenticated customers have access to account pages for:

- Account overview.
- Profile management.
- Order history.
- Order detail view.
- Address management.
- Payment page placeholder for future expansion.

### Order Result Pages

The storefront includes success and failed payment pages so customers receive clear feedback after checkout or payment attempts.

## 5. Admin Portal Features

### Dashboard

The admin dashboard provides operational visibility through statistics, analytics, top products, latest customers, and pending review data.

### Product Management

Admins can manage the product catalog, including:

- Product list.
- Create product.
- Edit product.
- Product image upload.
- Product variant image upload.
- Product activation or visibility controls where supported.

### Category Management

Admins can create, update, and delete product categories used by the storefront.

### Customer Management

Admins can view customer records and manage customer status, including activation and deactivation.

### Order Management

Admins can view orders and update order status. This supports the operational workflow after a customer completes checkout.

### Cart Management

Admins can view customer carts and clear cart records where needed.

### Review Management

Admins can moderate product reviews, including approving, rejecting, and bulk review actions.

### Site Configuration

Admins can update storefront content and business settings, including:

- Site name and logo.
- Homepage hero banner content.
- Checkout enablement.
- Cash on delivery enablement.
- Currency.
- Shipping fee settings.
- Product page trust badges and delivery information.
- Shop offers.
- Footer content, links, and contact information.

## 6. Core Customer Workflows

### Browse and Buy

1. Customer opens the storefront.
2. Customer browses products from the homepage or shop page.
3. Customer opens a product detail page.
4. Customer adds the product to cart.
5. Customer reviews cart items.
6. Customer proceeds to checkout.
7. Customer selects or adds a delivery address.
8. Customer chooses a payment method.
9. Customer places the order.
10. Customer sees order success or payment failure feedback.

### Manage Account

1. Customer logs in.
2. Customer opens account pages.
3. Customer updates profile details or avatar.
4. Customer manages saved addresses.
5. Customer views order history and order details.

## 7. Core Admin Workflows

### Manage Catalog

1. Admin logs in.
2. Admin opens Products.
3. Admin creates or edits products.
4. Admin uploads product images.
5. Admin assigns categories and product details.
6. Product becomes available in the storefront.

### Process Orders

1. Admin opens Orders.
2. Admin reviews order details.
3. Admin updates order status based on fulfillment progress.
4. Customer can see order updates in their account.

### Moderate Reviews

1. Admin opens Reviews.
2. Admin reviews pending customer feedback.
3. Admin approves or rejects reviews.
4. Approved reviews can appear on the storefront.

### Update Storefront Content

1. Admin opens Site Configuration.
2. Admin updates branding, banner, checkout, shipping, product page, offer, or footer settings.
3. Storefront reflects the configured content.

## 8. Technical Overview

### Frontend

- Framework: Angular 17.
- UI: Bootstrap-based storefront and admin interface.
- Routing: Angular standalone route configuration.
- State and async handling: RxJS observables.
- Guards: authentication guard, role guard, and unsaved changes guard.
- HTTP integration: Angular HttpClient services.

### Backend Integration

The frontend is designed to connect to a backend API through environment-based URLs. Based on the current project setup, backend functionality is expected to be provided by a NestJS API with Prisma and PostgreSQL.

Key backend areas used by the frontend include:

- Authentication.
- Product catalog.
- Categories.
- Customers.
- Cart.
- Checkout and orders.
- Payments.
- Reviews.
- Media uploads.
- Site configuration.
- Location data for addresses.

### Database

The backend uses PostgreSQL with Prisma migrations. Prisma validation and migration status checks confirm whether schema changes are valid and applied to the database.

## 9. Main Routes

### Public Routes

- `/storefront` - storefront homepage.
- `/storefront/shop` - shop/product browsing.
- `/storefront/product/:slug` - product detail.
- `/login` - login page.
- `/register` - registration page.

### Customer Routes

- `/storefront/cart` - cart.
- `/storefront/checkout` - checkout.
- `/storefront/orders` - customer orders.
- `/storefront/account/overview` - account overview.
- `/storefront/account/profile` - profile.
- `/storefront/account/orders` - order history.
- `/storefront/account/orders/:id` - order detail.
- `/storefront/account/addresses` - address management.
- `/storefront/account/payments` - payment page placeholder.

### Admin Routes

- `/admin/dashboard` - dashboard.
- `/admin/products` - products.
- `/admin/products/create` - create product.
- `/admin/products/edit/:id` - edit product.
- `/admin/categories` - categories.
- `/admin/customers` - customers.
- `/admin/orders` - orders.
- `/admin/carts` - carts.
- `/admin/reviews` - reviews.
- `/admin/settings/profile` - admin profile.
- `/admin/settings/site-config` - site configuration.

## 10. Phase 1 Scope

### Included

- Customer storefront.
- Product browsing and product details.
- Customer authentication flow.
- Cart and checkout.
- Customer account pages.
- Address management.
- Admin management portal.
- Product and category management.
- Customer, cart, order, and review administration.
- Configurable storefront content.
- API-ready architecture.

### Not Finalized or Intended for Later Phases

- Full online payment production integration.
- Advanced inventory forecasting.
- Promotions, vouchers, and coupon engine.
- Delivery partner integration.
- Email and SMS notifications.
- Advanced reporting.
- Multi-store or multi-branch support.
- Full payment method management.
- Mobile app version.

## 11. Selling Points

- Provides both customer storefront and admin management in one system.
- Built on modern Angular architecture.
- Designed for medical supply ecommerce use cases.
- Includes configurable storefront content, allowing non-developers to update key website areas.
- Supports authenticated customer accounts, saved addresses, cart, checkout, and orders.
- Includes admin moderation for reviews and operational control over catalog and customers.
- Backend-ready structure supports NestJS, Prisma, and PostgreSQL.
- Phase 1 is already structured for future expansion such as payment gateways, delivery integration, coupons, and analytics.

## 12. Recommended Phase 2 Enhancements

Recommended next-phase improvements:

- Complete production payment gateway integration for GCash, Maya, and card payments.
- Add order notifications through email or SMS.
- Add coupons, discount rules, and promotional campaigns.
- Add inventory alerts and low-stock monitoring.
- Improve dashboard analytics and exportable reports.
- Add delivery tracking and fulfillment timeline.
- Add audit logs for admin actions.
- Add stronger product search and sorting.
- Add customer support or inquiry module.
- Add product recommendation sections.

## 13. Deployment Notes

Before deployment, confirm the following:

- Frontend environment API URL is configured correctly.
- Backend API is deployed and reachable.
- PostgreSQL database is migrated.
- Prisma Client is generated.
- Media upload storage is configured.
- Admin account is created.
- Payment settings are configured according to the selected payment methods.
- Production build uses a supported Node.js version.

Recommended verification commands for backend Prisma:

```bash
npx prisma validate
npx prisma migrate status
npx prisma generate
```

Recommended frontend build command:

```bash
ng build --configuration production
```

## 14. Phase 1 Summary

Phase 1 delivers a working ecommerce foundation for a medical supplies business. Customers can browse, register, manage cart and checkout, while administrators can manage the store through a protected admin portal. The system is built with scalable frontend architecture and backend-ready integration points, making it suitable for client demonstration, early business use, and continued development into a more advanced ecommerce platform.
