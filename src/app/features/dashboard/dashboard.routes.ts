import { Routes } from '@angular/router';
import { CreateUserComponent } from './components/create-user/create-user';
import { AgentsReportComponent } from './components/agents-report/agents-report';
import { AllClientsComponent } from './components/all-clients/all-clients';
import { ClientPolicyComponent } from './components/client-policy/client-policy';
import { ClientDocumentsComponent } from './components/client-documents/client-documents';
import { NewQuoteComponent } from './components/new-quote/new-quote';
import { QuotesHistoryComponent } from './components/quotes-history/quotes-history';
import { EmptyPlaceholderComponent } from './components/empty-placeholder/empty-placeholder';
import { ChangePasswordComponent } from './components/change-password/change-password';
import { AllUsersComponent } from './components/all-users/all-users';

export const dashboardRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent),
        children: [
            {
                path: 'quoting-tool',
                component: EmptyPlaceholderComponent,
                title: 'Cotizador Online - LatinGroup'
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
                component: ClientPolicyComponent,
                title: 'Mi Póliza - LatinGroup'
            },
            {
                path: 'my-documents',
                component: ClientDocumentsComponent,
                title: 'Mis Documentos - LatinGroup'
            },
            {
                path: 'new-quote',
                component: NewQuoteComponent,
                title: 'Nueva Cotización - LatinGroup'
            },
            {
                path: 'quotes-history',
                component: QuotesHistoryComponent,
                title: 'Historial de Cotizaciones - LatinGroup'
            },
            {
                path: 'profile-settings',
                component: ChangePasswordComponent,
                title: 'Configuración de Perfil - LatinGroup'
            },
            {
                path: 'users/list',
                component: AllUsersComponent,
                title: 'Lista de Usuarios - LatinGroup'
            }
        ]
    }
];
