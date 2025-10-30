import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../core/config/environment';
import { User, AuthResponse, LoginRequest, RegisterRequest, GoogleLoginRequest } from '../../shared/interfaces/api.interface';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        // Check if user is logged in on app start (only in browser)
        if (isPlatformBrowser(this.platformId)) {
            const token = localStorage.getItem('auth_token');
            const user = localStorage.getItem('user');
            if (token && user) {
                this.currentUserSubject.next(JSON.parse(user));
            }
        }
    }

    get currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
            .pipe(
                tap(response => {
                    if (isPlatformBrowser(this.platformId)) {
                        localStorage.setItem('auth_token', response.token);
                        localStorage.setItem('user', JSON.stringify(response.user));
                    }
                    this.currentUserSubject.next(response.user);
                })
            );
    }

    loginWithGoogle(googleData: GoogleLoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/google-login`, googleData)
            .pipe(
                tap(response => {
                    if (isPlatformBrowser(this.platformId)) {
                        localStorage.setItem('auth_token', response.token);
                        localStorage.setItem('user', JSON.stringify(response.user));
                    }
                    this.currentUserSubject.next(response.user);
                })
            );
    }

    getGoogleAuthUrl(): string {
        return `${environment.apiUrl}/auth/google`;
    }

    handleGoogleCallback(token: string, user: any): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user', JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
    }

    register(userData: RegisterRequest): Observable<AuthResponse> {
        const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('auth_token') : null;
        let headers = new HttpHeaders();

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData, { headers })
            .pipe(
                tap(response => {
                    // Only set token if it's a new login (not admin registering others)
                    if (!token && isPlatformBrowser(this.platformId)) {
                        localStorage.setItem('auth_token', response.token);
                        localStorage.setItem('user', JSON.stringify(response.user));
                        this.currentUserSubject.next(response.user);
                    }
                })
            );
    }

    logout(): void {
        console.log('🔓 Cerrando sesión y limpiando localStorage...');

        if (isPlatformBrowser(this.platformId)) {
            // Limpiar tokens y datos de usuario
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');

            console.log('✅ localStorage limpiado');
            console.log('📋 auth_token:', localStorage.getItem('auth_token'));
            console.log('📋 user:', localStorage.getItem('user'));
        }

        // Limpiar el usuario actual del observable
        this.currentUserSubject.next(null);
        console.log('✅ Usuario deslogueado correctamente');
    }

    isLoggedIn(): boolean {
        return isPlatformBrowser(this.platformId) ? !!localStorage.getItem('auth_token') : false;
    }

    getToken(): string | null {
        return isPlatformBrowser(this.platformId) ? localStorage.getItem('auth_token') : null;
    }

    hasRole(role: string): boolean {
        return this.currentUser?.type === role;
    }

    isAdmin(): boolean {
        return this.hasRole('admin');
    }

    isAgent(): boolean {
        return this.hasRole('agent');
    }

    isClient(): boolean {
        return this.hasRole('client');
    }

    /**
     * Obtiene la ruta del dashboard específica según el tipo de usuario
     * @returns Ruta del dashboard correspondiente al tipo de usuario
     */
    getDashboardRoute(): string {
        const user = this.currentUser;
        if (!user) {
            return '/dashboard';
        }

        switch (user.type) {
            case 'admin':
                return '/dashboard/agents-report';
            case 'agent':
                return '/dashboard/all-clients';
            case 'client':
                return '/dashboard/my-policy';
            default:
                return '/dashboard';
        }
    }

    /**
     * Solicitar recuperación de contraseña
     * @param email Email del usuario
     */
    forgotPassword(email: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/forgot-password`, { email });
    }

    /**
     * Restablecer contraseña con token
     * @param resetData Datos para resetear la contraseña
     */
    resetPassword(resetData: { email: string; token: string; password: string; password_confirmation: string }): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/reset-password`, resetData);
    }

    /**
     * Cambiar contraseña del usuario autenticado
     * @param changeData Datos para cambiar la contraseña
     */
    changePassword(changeData: { current_password: string; new_password: string; new_password_confirmation: string }): Observable<{ message: string }> {
        const token = this.getToken();
        let headers = new HttpHeaders();

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/change-password`, changeData, { headers });
    }
}