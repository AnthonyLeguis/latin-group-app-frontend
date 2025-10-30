import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormSkeletonComponent } from '../../../../shared/components/form-skeleton/form-skeleton';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { EditClientModalComponent } from '../edit-client-modal/edit-client-modal';
import { FormDetailModalComponent } from '../form-detail-modal/form-detail-modal.component';

interface Client {
    id: number;
    name: string;
    email: string;
    created_at: string;
    agent?: { // Agente asignado explícitamente al cliente
        id: number;
        name: string;
        email: string;
    };
    created_by?: { // Fallback: usuario que creó al cliente
        id: number;
        name: string;
        email: string;
    };
    application_form?: {
        id: number;
    };
}

@Component({
    selector: 'app-all-clients',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatTooltipModule,
        MatChipsModule,
        MatDialogModule,
        FormSkeletonComponent
    ],
    templateUrl: './all-clients.html',
    styleUrls: ['./all-clients.scss']
})
export class AllClientsComponent implements OnInit {
    isLoading = true;
    clients: Client[] = [];
    filteredClients: Client[] = [];
    displayedColumns: string[] = ['name', 'email', 'created_at', 'actions'];
    searchTerm = '';

    // Paginación
    currentPage = 1;
    totalClients = 0;
    pageSize = 15;

    // Usuario actual
    isAdmin = false;

    // Inyección usando inject() - mejor para SSR/hydration
    private userService = inject(UserService);
    private authService = inject(AuthService);
    private cdr = inject(ChangeDetectorRef);
    private dialog = inject(MatDialog, { optional: true });

    ngOnInit(): void {
        this.checkUserRole();
        this.loadClients();
    }

    checkUserRole(): void {
        const user = this.authService.currentUser;
        this.isAdmin = user?.type === 'admin';

        // Si es admin, agregar columna de agente
        if (this.isAdmin && !this.displayedColumns.includes('agent')) {
            this.displayedColumns.splice(2, 0, 'agent');
        }
    }

    loadClients(page: number = 1): void {
        this.isLoading = true;
        this.userService.getUsers({ type: 'client', page }).subscribe({
            next: (response) => {
                console.log('Clients response:', response);
                this.clients = response.data || [];
                this.filteredClients = [...this.clients];
                this.totalClients = response.total || 0;
                this.currentPage = response.current_page || 1;
                this.pageSize = response.per_page || 15;
                this.isLoading = false;
                this.applyFilter();
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading clients:', error);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    onPageChange(event: PageEvent): void {
        this.loadClients(event.pageIndex + 1);
    }

    onSearch(): void {
        this.applyFilter();
    }

    applyFilter(): void {
        if (!this.searchTerm || this.searchTerm.trim() === '') {
            this.filteredClients = [...this.clients];
        } else {
            const searchLower = this.searchTerm.toLowerCase().trim();
            this.filteredClients = this.clients.filter(client =>
                client.name.toLowerCase().includes(searchLower) ||
                client.email.toLowerCase().includes(searchLower)
            );
        }
        this.cdr.detectChanges();
    }

    clearSearch(): void {
        this.searchTerm = '';
        this.applyFilter();
    }

    viewClient(client: Client): void {
        console.log('Ver detalles del cliente:', client.id);

        // Verificar si el cliente tiene application_form
        if (!client.application_form || !client.application_form.id) {
            console.warn('Este cliente no tiene una planilla de aplicación');
            // Podrías mostrar un mensaje al usuario aquí
            return;
        }

        if (!this.dialog) {
            console.error('MatDialog no está disponible');
            return;
        }

        // Abrir el modal de detalles de la application form
        const dialogRef = this.dialog.open(FormDetailModalComponent, {
            width: '900px',
            maxWidth: '95vw',
            data: { formId: client.application_form.id },
            panelClass: 'form-detail-dialog'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result?.updated) {
                // Si hubo cambios, recargar la lista
                console.log('Planilla actualizada, recargando lista...');
                this.loadClients(this.currentPage);
            }
        });
    }

    editClient(client: Client): void {
        console.log('Editar cliente:', client.id);

        if (!this.dialog) {
            console.error('MatDialog no está disponible');
            return;
        }

        const dialogRef = this.dialog.open(EditClientModalComponent, {
            width: '700px',
            maxWidth: '95vw',
            maxHeight: '90vh',
            data: { client },
            panelClass: 'edit-client-dialog',
            disableClose: false
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Si se guardaron cambios, recargar la lista
                console.log('Cliente actualizado, recargando lista...');
                setTimeout(() => {
                    this.loadClients(this.currentPage);
                });
            }
        });
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Obtener el nombre del agente con fallback a created_by
    getAgentName(client: Client): string {
        return client.agent?.name || client.created_by?.name || 'Sin agente';
    }
}
