import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Add authorization header with jwt token if available
        const token = this.authService.getToken();

        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                // Si es un error 401 y no es la ruta de check-token-expiry
                // (para evitar bucles infinitos), agregar información adicional
                if (error.status === 401 && !request.url.includes('check-token-expiry')) {
                    console.warn('⚠️ Token expirado o inválido. La sesión será cerrada.');
                }

                return throwError(() => error);
            })
        );
    }
}