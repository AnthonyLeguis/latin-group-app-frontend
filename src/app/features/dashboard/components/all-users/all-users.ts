import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { FormSkeletonComponent } from '../../../../shared/components/form-skeleton/form-skeleton';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../../shared/components/notification-dialog/confirm-dialog.component';

interface User {
    id: number;
    name: string;
    email: string;
    type: 'admin' | 'agent' | 'client';
    created_at: string;
    is_restricted?: boolean; // Usuario restringido/bloqueado
    created_by?: {
        id: number;
        name: string;
        email: string;
    };
    isEditing?: boolean; // Para controlar el modo edición inline
    originalData?: User; // Backup de los datos originales
}

@Component({
    selector: 'app-all-users',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
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
        MatSelectModule,
        MatSlideToggleModule,
        FormSkeletonComponent
    ],
    templateUrl: './all-users.html',
    styleUrls: ['./all-users.scss']
})
export class AllUsersComponent implements OnInit {
    users: User[] = [];
    filteredUsers: User[] = [];
    isLoading = true;
    searchTerm = '';
    currentPage = 1;
    pageSize = 15;
    totalUsers = 0;

    // Filtros por tipo
    selectedTypeFilter: string | null = null;
    typeFilters = [
        { value: 'admin', label: 'Administrador', icon: 'admin_panel_settings', class: 'filter-admin' },
        { value: 'agent', label: 'Agente', icon: 'support_agent', class: 'filter-agent' },
        { value: 'client', label: 'Cliente', icon: 'person', class: 'filter-client' }
    ];

    displayedColumns: string[] = ['name', 'created_by', 'restriction', 'type', 'actions'];
    userTypes = [
        { value: 'admin', label: 'Administrador' },
        { value: 'agent', label: 'Agente' },
        { value: 'client', label: 'Cliente' }
    ];

    constructor(
        private userService: UserService,
        private authService: AuthService,
        private dialog: MatDialog,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(page: number = 1): void {
        this.isLoading = true;

        const params: { page: number; type?: string } = { page };

        if (this.selectedTypeFilter) {
            params.type = this.selectedTypeFilter;
        }

        this.userService.getUsers(params).subscribe({
            next: (response: any) => {
                ////console.log(`Usuarios cargados (página ${params.page}):`, response);
                ////console.log('Total de usuarios en respuesta:', response.total);
                ////console.log('Usuarios tipo agent en esta página:', response.data?.filter((u: any) => u.type === 'agent'));

                if (response.data) {
                    this.users = response.data.map((user: any) => ({
                        ...user,
                        isEditing: false
                    }));
                    this.totalUsers = response.total ?? this.users.length;
                    this.currentPage = response.current_page ?? params.page;
                    this.pageSize = response.per_page ?? this.pageSize;
                } else {
                    this.users = [];
                    this.totalUsers = 0;
                }

                this.applyFilters();
                this.isLoading = false;
                this.cd.detectChanges();
            },
            error: (error) => {
                console.error('Error al cargar usuarios:', error);
                this.isLoading = false;
                this.users = [];
                this.filteredUsers = [];
                this.cd.detectChanges();
            }
        });
    }

    applyFilters(): void {
        let filtered = [...this.users];

        // Filtrar por término de búsqueda
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term) ||
                user.type.toLowerCase().includes(term) ||
                user.created_by?.name.toLowerCase().includes(term)
            );
        }

        this.filteredUsers = [...filtered];
    }

    // Seleccionar filtro de tipo
    selectTypeFilter(type: string | null): void {
        this.selectedTypeFilter = type;
        this.currentPage = 1;
        this.loadUsers(1);
    }

    // Verificar si un filtro está activo
    isTypeFilterActive(type: string): boolean {
        return this.selectedTypeFilter === type;
    }

    onSearch(): void {
        this.applyFilters();
    }

    clearSearch(): void {
        this.searchTerm = '';
        this.applyFilters();
    }

    onPageChange(event: PageEvent): void {
        ////console.log('Cambio de página desde paginador:', event);
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex + 1;
        this.loadUsers(this.currentPage);
    }

    // Iniciar modo edición inline
    startEdit(user: User): void {
        // Guardar backup de los datos originales
        user.originalData = { ...user };
        user.isEditing = true;
    }

    // Cancelar edición
    cancelEdit(user: User): void {
        if (user.originalData) {
            // Restaurar datos originales
            Object.assign(user, user.originalData);
            delete user.originalData;
        }
        user.isEditing = false;
    }

    // Confirmar y guardar edición
    confirmEdit(user: User): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Confirmar edición',
                message: `¿Está seguro que desea guardar los cambios para ${user.name}?`,
                type: 'warning',
                confirmButtonText: 'Guardar',
                cancelButtonText: 'Cancelar'
            },
            width: '400px',
            panelClass: 'custom-dialog-container'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.saveUser(user);
            }
        });
    }

    // Guardar usuario editado
    saveUser(user: User): void {
        const updateData = {
            name: user.name,
            email: user.email,
            type: user.type
        };

        this.userService.updateUser(user.id, updateData).subscribe({
            next: (response) => {
                this.dialog.open(ConfirmDialogComponent, {
                    data: {
                        title: 'Usuario actualizado',
                        message: 'Los cambios se han guardado exitosamente.',
                        type: 'success',
                        confirmButtonText: 'Aceptar',
                        autoClose: true,
                        autoCloseDuration: 3000
                    },
                    width: '400px',
                    panelClass: 'custom-dialog-container'
                });

                user.isEditing = false;
                delete user.originalData;
                this.loadUsers(); // Recargar lista
            },
            error: (error) => {
                const errorMessage = error.error?.error || 'Error al actualizar usuario';
                this.dialog.open(ConfirmDialogComponent, {
                    data: {
                        title: 'Error al actualizar',
                        message: errorMessage,
                        type: 'error',
                        confirmButtonText: 'Cerrar'
                    },
                    width: '400px',
                    panelClass: 'custom-dialog-container'
                });
            }
        });
    }

    // Eliminar usuario
    deleteUser(user: User): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Confirmar eliminación',
                message: `¿Está seguro que desea eliminar al usuario ${user.name}? Esta acción no se puede deshacer.`,
                type: 'error',
                confirmButtonText: 'Eliminar',
                cancelButtonText: 'Cancelar'
            },
            width: '450px',
            panelClass: 'custom-dialog-container'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.executeDelete(user);
            }
        });
    }

    // Ejecutar eliminación
    executeDelete(user: User): void {
        this.userService.deleteUser(user.id).subscribe({
            next: () => {
                this.dialog.open(ConfirmDialogComponent, {
                    data: {
                        title: 'Usuario eliminado',
                        message: 'El usuario ha sido eliminado exitosamente.',
                        type: 'success',
                        confirmButtonText: 'Aceptar',
                        autoClose: true,
                        autoCloseDuration: 3000
                    },
                    width: '400px',
                    panelClass: 'custom-dialog-container'
                });

                this.loadUsers(); // Recargar lista
            },
            error: (error) => {
                const errorMessage = error.error?.error || 'Error al eliminar usuario';
                this.dialog.open(ConfirmDialogComponent, {
                    data: {
                        title: 'Error al eliminar',
                        message: errorMessage,
                        type: 'error',
                        confirmButtonText: 'Cerrar'
                    },
                    width: '400px',
                    panelClass: 'custom-dialog-container'
                });
            }
        });
    }

    // Obtener label del tipo de usuario
    getUserTypeLabel(type: string): string {
        switch (type) {
            case 'admin': return 'Admin';
            case 'agent': return 'Agente';
            case 'client': return 'Cliente';
            default: return type;
        }
    }

    // Obtener clase CSS para el chip de tipo
    getUserTypeClass(type: string): string {
        switch (type) {
            case 'admin': return 'type-admin';
            case 'agent': return 'type-agent';
            case 'client': return 'type-client';
            default: return '';
        }
    }

    // Alternar restricción de usuario (bloquear/desbloquear acceso)
    toggleRestriction(user: User, change: MatSlideToggleChange): void {
        // Revertimos visualmente el toggle hasta confirmar la acción
        change.source.checked = !user.is_restricted;

        const intendedAllowed = change.checked; // true = permitir acceso
        const newStatus = !intendedAllowed; // true = restringir acceso
        const action = newStatus ? 'restringir' : 'desbloquear';
        const actionPast = newStatus ? 'restringido' : 'desbloqueado';

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: `Confirmar ${action} usuario`,
                message: newStatus
                    ? `¿Está seguro que desea RESTRINGIR el acceso de ${user.name}? El usuario será desconectado inmediatamente y no podrá iniciar sesión.`
                    : `¿Está seguro que desea DESBLOQUEAR el acceso de ${user.name}? El usuario podrá volver a iniciar sesión.`,
                type: newStatus ? 'error' : 'warning',
                confirmButtonText: newStatus ? 'Restringir' : 'Desbloquear',
                cancelButtonText: 'Cancelar'
            },
            width: '450px',
            panelClass: 'custom-dialog-container'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.userService.toggleRestriction(user.id).subscribe({
                    next: (response: any) => {
                        user.is_restricted = newStatus;
                        change.source.checked = !newStatus;

                        this.dialog.open(ConfirmDialogComponent, {
                            data: {
                                title: `Usuario ${actionPast}`,
                                message: `El usuario ${user.name} ha sido ${actionPast} exitosamente.`,
                                type: 'success',
                                confirmButtonText: 'Aceptar',
                                autoClose: true,
                                autoCloseDuration: 3000
                            },
                            width: '400px',
                            panelClass: 'custom-dialog-container'
                        });

                        this.cd.detectChanges();
                    },
                    error: (error: any) => {
                        const errorMessage = error.error?.error || `Error al ${action} usuario`;
                        this.dialog.open(ConfirmDialogComponent, {
                            data: {
                                title: `Error al ${action}`,
                                message: errorMessage,
                                type: 'error',
                                confirmButtonText: 'Cerrar'
                            },
                            width: '400px',
                            panelClass: 'custom-dialog-container'
                        });

                        // Revertir visualmente el toggle al estado anterior
                        change.source.checked = !user.is_restricted;
                    }
                });
            } else {
                // Revertir visualmente el toggle al cancelar la acción
                change.source.checked = !user.is_restricted;
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
}
