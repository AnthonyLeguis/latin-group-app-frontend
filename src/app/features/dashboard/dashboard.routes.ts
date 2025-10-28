import { Routes } from '@angular/router';
import { CreateClientComponent } from './components/create-client/create-client';
import { CreateUserComponent } from './components/create-user/create-user';

export const dashboardRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent),
        children: [
            {
                path: 'create-client',
                component: CreateClientComponent,
                title: 'Ingresar Cliente - LatinGroup'
            },
            {
                path: 'create-user',
                component: CreateUserComponent,
                title: 'Crear Usuario - LatinGroup'
            },
            // Aquí se pueden agregar más rutas hijas del dashboard
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            }
        ]
    }
];
