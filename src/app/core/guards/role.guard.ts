import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@app/core/auth/auth.service';

export const roleGuard = (role: 'ADMIN' | 'CUSTOMER'): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.getRole() === role) {
      return true;
    }

    // Non-admin trying admin
    router.navigate(['/storefront']);
    return false;
  };
};
