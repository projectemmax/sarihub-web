// src/app/app.config.ts
import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';

import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { SiteConfigService } from '@app/core/services/site-config.service';
import { firstValueFrom } from 'rxjs';

import { provideToastr } from 'ngx-toastr';
import { ToastInterceptor } from './core/interceptors/toast.interceptor';

// ✅ INIT FUNCTION
export function initSiteConfig(service: SiteConfigService) {
  return () => firstValueFrom(service.loadConfig());
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // HttpClient
    provideHttpClient(withInterceptorsFromDi()),

    // Interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },

    {
      provide: HTTP_INTERCEPTORS,
      useClass: ToastInterceptor,
      multi: true,
    },

    // APP INITIALIZER
    {
      provide: APP_INITIALIZER,
      useFactory: initSiteConfig,
      deps: [SiteConfigService],
      multi: true,
    },

    // Animations
    provideAnimationsAsync(),

    provideToastr({
      positionClass: 'toast-top-right',
      timeOut: 3000,
      preventDuplicates: true,
      progressBar: true,
      newestOnTop: true,
    }),

  ],
};