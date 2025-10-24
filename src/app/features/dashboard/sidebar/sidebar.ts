import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/components/notification-dialog/confirm-dialog.component';

interface MenuItem {
    label: string;
    icon: string;
    route?: string;
    children?: MenuItem[];
    expanded?: boolean;
}

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        RouterLinkActive,
        MatIconModule,
        MatDialogModule
    ],
    templateUrl: './sidebar.html',
    styleUrl: './sidebar.scss'
})
export class SidebarComponent implements OnInit {
    userName = '';
    userType = '';
    userTypeLabel = '';

    menuItems: MenuItem[] = [
        {
            label: 'Gestión por agentes',
            icon: 'supervisor_account',
            route: '/dashboard/agent-management',
            children: [
                { label: 'Lista de agentes', icon: 'list', route: '/dashboard/agent-management/list' },
                { label: 'Reportes de agentes', icon: 'assessment', route: '/dashboard/agent-management/reports' }
            ],
            expanded: false
        },
        {
            label: 'Libro de clientes',
            icon: 'people',
            route: '/dashboard/clients',
            children: [
                { label: 'Todos los clientes', icon: 'person', route: '/dashboard/clients/all' },
                { label: 'Clientes activos', icon: 'verified_user', route: '/dashboard/clients/active' }
            ],
            expanded: false
        },
        {
            label: 'Cotizar',
            icon: 'request_quote',
            route: '/dashboard/quotes',
            children: [
                { label: 'Nueva cotización', icon: 'add_circle', route: '/dashboard/quotes/new' },
                { label: 'Historial de cotizaciones', icon: 'history', route: '/dashboard/quotes/history' }
            ],
            expanded: false
        },
        {
            label: 'Gestión de usuarios',
            icon: 'manage_accounts',
            route: '/dashboard/users',
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
        }
    }

    getUserTypeLabel(type: string): string {
        const labels: { [key: string]: string } = {
            'admin': 'Administrador',
            'agent': 'Agente',
            'client': 'Cliente'
        };
        return labels[type] || type;
    }

    toggleMenuItem(item: MenuItem): void {
        if (item.children) {
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
                confirmText: 'Aceptar',
                cancelText: 'Volver',
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
