import { Routes } from '@angular/router';

export const authRoutes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./login/login').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./register/register').then(m => m.RegisterComponent)
    },
    {
        path: 'access-denied',
        loadComponent: () => import('./access-denied/access-denied').then(m => m.AccessDeniedComponent)
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];