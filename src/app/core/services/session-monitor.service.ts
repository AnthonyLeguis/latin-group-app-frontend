import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, Subscription, interval } from 'rxjs';
import { environment } from '../config/environment';

export interface TokenExpiryInfo {
    expired: boolean;
    minutes_remaining: number;
    seconds_remaining: number;
    expires_at?: string;
    created_at?: string;
    should_warn: boolean;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SessionMonitorService {
    private readonly checkInterval = 60_000; // 60 segundos
    private readonly warningThreshold = 30; // En los últimos 30 segundos mostramos alerta
    private readonly sessionWarning$ = new Subject<TokenExpiryInfo>();
    private monitoringSubscription: Subscription | null = null;

    constructor(private readonly http: HttpClient) { }

    /** Observable que emite advertencias sobre el estado de la sesión */
    getSessionWarnings(): Observable<TokenExpiryInfo> {
        return this.sessionWarning$.asObservable();
    }

    /** Inicia el monitoreo periódico del token */
    startMonitoring(): void {
        this.checkTokenExpiry();

        this.monitoringSubscription = interval(this.checkInterval).subscribe(() => {
            this.checkTokenExpiry();
        });
    }

    /** Detiene el monitoreo en curso */
    stopMonitoring(): void {
        if (this.monitoringSubscription) {
            this.monitoringSubscription.unsubscribe();
            this.monitoringSubscription = null;
        }
    }

    /** Consulta al backend el estado del token */
    private checkTokenExpiry(): void {
        const token = localStorage.getItem('auth_token');

        if (!token) {
            this.stopMonitoring();
            return;
        }

        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.get<TokenExpiryInfo>(`${environment.apiUrl}/auth/check-token-expiry`, { headers })
            .subscribe({
                next: info => {
                    if (info.expired) {
                        this.sessionWarning$.next(info);
                        this.stopMonitoring();
                        return;
                    }

                    if (info.should_warn || info.seconds_remaining <= this.warningThreshold) {
                        this.sessionWarning$.next(info);
                    }
                },
                error: error => {
                    if (error.status === 401) {
                        this.sessionWarning$.next({
                            expired: true,
                            minutes_remaining: 0,
                            seconds_remaining: 0,
                            should_warn: true,
                            message: 'Sesión expirada'
                        });
                        this.stopMonitoring();
                    }
                }
            });
    }

    /** Solicita la renovación del token actual */
    refreshToken(): Observable<{ message: string; token?: string; expires_in?: number }> {
        const token = localStorage.getItem('auth_token');
        const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;

        return this.http.post<{ message: string; token?: string; expires_in?: number }>(
            `${environment.apiUrl}/auth/refresh-token`,
            {},
            { headers }
        );
    }

    /** Revoca el token actual en el backend */
    logout(): Observable<{ message: string }> {
        const token = localStorage.getItem('auth_token');
        const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;

        return this.http.post<{ message: string }>(
            `${environment.apiUrl}/auth/logout`,
            {},
            { headers }
        );
    }
}
