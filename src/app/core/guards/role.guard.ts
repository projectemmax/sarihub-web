import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@app/core/auth/auth.service';

type Role=
  | 'ADMIN'
  | 'SELLER'
  | 'CUSTOMER';

export const roleGuard = (role:Role):CanActivateFn =>{

    return ()=>{

        const auth = inject(AuthService);

        const router = inject(Router);

        const current = auth.getRole();

        if(current===role){
            return true;
        }

        return router.createUrlTree([
            '/storefront'
        ]);
    };
};

export const roleGuardAny = (roles:Role[]):CanActivateFn => {

    return ()=>{

        const auth = inject(AuthService);

        const router = inject(Router);

        const current = auth.getRole();

        if(
            current &&
            roles.includes(
                current as Role
            )
        ){
            return true;
        }

        return router.createUrlTree([
            '/storefront'
        ]);
    };
};