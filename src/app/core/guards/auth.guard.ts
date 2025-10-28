import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        // Permitir acceso si hay parámetros de Google callback en la URL
        const queryParams = route.queryParams;
        if (queryParams['token'] && queryParams['user_id'] && queryParams['user_type']) {
            console.log('🔓 AuthGuard: Permitiendo acceso por callback de Google');
            return true;
        }

        // Verificación normal de autenticación
        if (this.authService.isLoggedIn()) {
            return true;
        } else {
            console.log('🔒 AuthGuard: Usuario no autenticado, redirigiendo a login');
            this.router.navigate(['/auth/login']);
            return false;
        }
    }
}

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(): boolean {
        if (this.authService.isLoggedIn() && this.authService.isAdmin()) {
            return true;
        } else {
            this.router.navigate(['/dashboard']);
            return false;
        }
    }
}

@Injectable({
    providedIn: 'root'
})
export class AgentGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(): boolean {
        if (this.authService.isLoggedIn() && (this.authService.isAdmin() || this.authService.isAgent())) {
            return true;
        } else {
            this.router.navigate(['/dashboard']);
            return false;
        }
    }
}