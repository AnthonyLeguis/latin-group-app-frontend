import { Routes } from '@angular/router';
import { CreateClientComponent } from './components/create-client/create-client';
import { CreateUserComponent } from './components/create-user/create-user';
import { AgentsReportComponent } from './components/agents-report/agents-report';
import { AllClientsComponent } from './components/all-clients/all-clients';
import { MyPolicyComponent } from './components/my-policy/my-policy';
import { NewQuoteComponent } from './components/new-quote/new-quote';

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
            {
                path: 'new-quote',
                component: NewQuoteComponent,
                title: 'Nueva Cotización - LatinGroup'
            }
        ]
    }
];
