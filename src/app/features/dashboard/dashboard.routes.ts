import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CreateClientComponent } from './components/create-client/create-client';
import { CreateUserComponent } from './components/create-user/create-user';
import { AgentsReportComponent } from './components/agents-report/agents-report';
import { AllClientsComponent } from './components/all-clients/all-clients';
import { MyPolicyComponent } from './components/my-policy/my-policy';

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
            {
                path: 'agents-report',
                component: AgentsReportComponent,
                title: 'Reporte de Agentes - LatinGroup'
            },
            {
                path: 'all-clients',
                component: AllClientsComponent,
                title: 'Todos los Clientes - LatinGroup'
            },
            {
                path: 'my-policy',
                component: MyPolicyComponent,
                title: 'Mi Póliza - LatinGroup'
            },
            // Redirección por defecto según tipo de usuario
            {
                path: '',
                canActivate: [() => {
                    const authService = inject(AuthService);
                    const router = inject(Router);
                    const redirectUrl = authService.getDashboardRoute();
                    return router.parseUrl(redirectUrl);
                }],
                children: []
            }
        ]
    }
];
