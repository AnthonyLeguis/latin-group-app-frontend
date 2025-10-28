import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ApplicationFormService } from '../../../../core/services/application-form.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-client-policy',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatChipsModule
    ],
    templateUrl: './client-policy.html',
    styleUrls: ['./client-policy.scss']
})
export class ClientPolicyComponent implements OnInit {
    isLoading = true;
    applicationForm: any = null;
    currentUser: any;

    constructor(
        private applicationFormService: ApplicationFormService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.currentUser = this.authService.currentUser;
        this.loadApplicationForm();
    }

    loadApplicationForm(): void {
        this.isLoading = true;

        // Obtener la application form del cliente actual
        this.applicationFormService.getApplicationForms({ client_id: this.currentUser.id }).subscribe({
            next: (response: any) => {
                const forms = response.data || response;
                if (forms && forms.length > 0) {
                    this.applicationForm = forms[0]; // El cliente solo puede tener una form
                }
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error al cargar la póliza:', error);
                this.isLoading = false;
            }
        });
    }

    getStatusColor(status: string): string {
        const colors: any = {
            'pendiente': 'warn',
            'activo': 'primary',
            'inactivo': 'accent',
            'rechazado': 'warn'
        };
        return colors[status] || 'primary';
    }

    getStatusIcon(status: string): string {
        const icons: any = {
            'pendiente': 'schedule',
            'activo': 'check_circle',
            'inactivo': 'pause_circle',
            'rechazado': 'cancel'
        };
        return icons[status] || 'info';
    }
}
