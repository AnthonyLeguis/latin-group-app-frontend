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
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
        this.currentUserSubject.next(null);
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
}