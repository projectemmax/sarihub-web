import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ToastService } from '@app/core/services/toast.service';

@Injectable()
export class ToastInterceptor implements HttpInterceptor {

    constructor(private toast: ToastService) {}

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {

        return next.handle(req).pipe(
            tap({
                next: (event) => {
                    if (event instanceof HttpResponse) {

                        // ✅ Only show toast for write operations
                        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
                            const silentUrls = [
                                '/auth',
                                '/cart/items',
                                '/customers/me/avatar'
                            ];

                            const shouldSkip = silentUrls.some(url => req.url.includes(url));

                            // Optional: skip noisy endpoints
                            if (!shouldSkip) {
                                switch (req.method) {
                                    case 'POST':
                                        this.toast.success('Saved successfully');
                                        break;

                                    case 'PUT':
                                    case 'PATCH':
                                        this.toast.success('Updated successfully');
                                        break;

                                    case 'DELETE':
                                        // skip generic delete toast
                                        break;
                                }
                            }
                        }
                    }
                },
                error: (error: HttpErrorResponse) => {
                    this.toast.error(
                        error.error?.message || 'Something went wrong'
                    );
                }
            })
        );
    }
}