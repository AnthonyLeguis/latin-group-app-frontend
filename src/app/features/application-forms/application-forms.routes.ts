import { Routes } from '@angular/router';

export const applicationFormsRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./application-forms/application-forms').then(m => m.ApplicationFormsComponent)
    }
];