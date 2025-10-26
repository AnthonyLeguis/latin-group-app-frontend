import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/components/notification-dialog/confirm-dialog.component';

interface MenuItem {
    label: string;
    icon: string;
    route?: string;
    children?: MenuItem[];
    expanded?: boolean;
    allowedRoles?: ('admin' | 'agent' | 'client')[]; // Roles que pueden ver este item
}

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        RouterLinkActive,
        MatIconModule,
        MatTooltipModule,
        MatDialogModule
    ],
    templateUrl: './sidebar.html',
    styleUrl: './sidebar.scss'
})
export class SidebarComponent implements OnInit {
    userName = '';
    userType = '';
    userTypeLabel = '';
    userInitials = '';
    isExpanded = true;
    visibleMenuItems: MenuItem[] = []; // Items filtrados según el rol del usuario

    // Todos los items del menú con sus roles permitidos
    private allMenuItems: MenuItem[] = [
        {
            label: 'Gestión por agentes',
            icon: 'people_alt',
            route: '/dashboard/agent-management',
            allowedRoles: ['admin'], // Solo admin puede ver esta opción
            children: [
                { label: 'Lista de agentes', icon: 'list', route: '/dashboard/agent-management/list' },
                { label: 'Reportes de agentes', icon: 'assessment', route: '/dashboard/agent-management/reports' }
            ],
            expanded: false
        },
        {
            label: 'Libro de clientes',
            icon: 'contacts',
            route: '/dashboard/clients',
            allowedRoles: ['admin', 'agent'], // Admin y Agent pueden ver esta opción
            children: [
                { label: 'Todos los clientes', icon: 'groups', route: '/dashboard/clients/all' },
                { label: 'Clientes activos', icon: 'verified_user', route: '/dashboard/clients/active' }
            ],
            expanded: false
        },
        {
            label: 'Cotizar',
            icon: 'request_quote',
            route: '/dashboard/quotes',
            allowedRoles: ['admin', 'agent'], // Admin y Agent pueden cotizar
            children: [
                { label: 'Nueva cotización', icon: 'add_circle', route: '/dashboard/quotes/new' },
                { label: 'Ingresar Cliente', icon: 'person_add', route: '/dashboard/quotes/add-client' },
                { label: 'Historial de cotizaciones', icon: 'history', route: '/dashboard/quotes/history' }
            ],
            expanded: false
        },
        {
            label: 'Gestión de usuarios',
            icon: 'manage_accounts',
            route: '/dashboard/users',
            allowedRoles: ['admin'], // Solo admin puede gestionar usuarios
            children: [
                { label: 'Lista de usuarios', icon: 'group', route: '/dashboard/users/list' },
                { label: 'Crear usuario', icon: 'person_add', route: '/dashboard/users/create' }
            ],
            expanded: false
        },
        {
            label: 'Mi Póliza',
            icon: 'description',
            route: '/dashboard/my-policy',
            allowedRoles: ['client'], // Solo clientes pueden ver sus pólizas
            children: [
                { label: 'Ver póliza', icon: 'visibility', route: '/dashboard/my-policy/view' },
                { label: 'Documentos', icon: 'folder', route: '/dashboard/my-policy/documents' }
            ],
            expanded: false
        }
    ];

    constructor(
        private authService: AuthService,
        private router: Router,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        // Obtener información del usuario actual
        const currentUser = this.authService.currentUser;
        if (currentUser) {
            this.userName = currentUser.name;
            this.userType = currentUser.type;
            this.userTypeLabel = this.getUserTypeLabel(currentUser.type);
            this.userInitials = this.getUserInitials(currentUser.name);

            // Filtrar los items del menú según el rol del usuario
            this.filterMenuByRole(currentUser.type);
        }
    }

    /**
     * Filtra los items del menú según el rol del usuario
     * Admin siempre ve todas las opciones
     */
    private filterMenuByRole(userType: 'admin' | 'agent' | 'client'): void {
        // Si es admin, mostrar todos los items
        if (userType === 'admin') {
            this.visibleMenuItems = this.allMenuItems;
            return;
        }

        // Para otros roles, filtrar según allowedRoles
        this.visibleMenuItems = this.allMenuItems.filter(item => {
            // Si no tiene roles permitidos definidos, es visible para todos
            if (!item.allowedRoles || item.allowedRoles.length === 0) {
                return true;
            }
            // Mostrar solo si el rol del usuario está en los roles permitidos
            return item.allowedRoles.includes(userType);
        });
    }

    getUserInitials(name: string): string {
        const names = name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    getUserTypeLabel(type: string): string {
        const labels: { [key: string]: string } = {
            'admin': 'Administrador',
            'agent': 'Agente',
            'client': 'Cliente'
        };
        return labels[type] || type;
    }

    toggleSidebar(): void {
        this.isExpanded = !this.isExpanded;
        // Cerrar todos los submenús al contraer
        if (!this.isExpanded) {
            this.visibleMenuItems.forEach((item: MenuItem) => item.expanded = false);
        }
    }

    toggleMenuItem(item: MenuItem, event?: Event): void {
        if (event) {
            event.stopPropagation();
        }

        if (item.children) {
            // Siempre invertir el estado expanded
            item.expanded = !item.expanded;
        }
    }

    onProfile(): void {
        this.router.navigate(['/dashboard/profile']);
    }

    onLogout(): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Confirmar salir',
                message: '¿Está seguro que desea cerrar sesión?',
                confirmButtonText: 'Aceptar',
                cancelButtonText: 'Volver',
                type: 'warning'
            },
            width: '400px',
            panelClass: 'custom-dialog-container'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Usuario confirmó el cierre de sesión
                console.log('🚪 Cerrando sesión...');
                this.authService.logout();
                this.router.navigate(['/home']);
            }
        });
    }
}
