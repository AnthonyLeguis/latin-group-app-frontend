import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadComponent: () => import('./features/home/home/home').then(m => m.HomeComponent)
    },
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes),
        canActivate: [AuthGuard]
    },
    {
        path: 'application-forms',
        loadChildren: () => import('./features/application-forms/application-forms.routes').then(m => m.applicationFormsRoutes),
        canActivate: [AuthGuard]
    },
    {
        path: '**',
        redirectTo: '/home'
    }
];
