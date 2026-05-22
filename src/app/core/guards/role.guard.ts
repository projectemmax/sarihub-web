import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@app/core/auth/auth.service';

type Role =
    | 'ADMIN'
    | 'SELLER'
    | 'CUSTOMER';

export const roleGuard =
(role: Role): CanActivateFn => {

    return () => {

        const auth =
            inject(AuthService);

        const router =
            inject(Router);

        const roleFound =
            auth.getRole();

        if (
            roleFound === role
        ) {
            return true;
        }

        if (
            role === 'ADMIN'
            &&
            roleFound === 'SELLER'
        ) {
            return true;
        }

        router.navigate([
            '/storefront'
        ]);

        return false;
    };
};

export const roleGuardAny =
(roles: Role[]): CanActivateFn => {

    return () => {

        const auth =
            inject(AuthService);

        const router =
            inject(Router);

        const current =
            auth.getRole();

        if (
            roles.includes(
                current as Role
            )
        ) {
            return true;
        }

        router.navigate([
            '/storefront'
        ]);

        return false;
    };
};