import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { UserService, Agent, UserStats } from '../../../../core/services/user.service';
import { FormSkeletonComponent } from '../../../../shared/components/form-skeleton/form-skeleton';
import { FormDetailModalComponent } from '../form-detail-modal/form-detail-modal.component';
import { FormsListModalComponent } from '../forms-list-modal/forms-list-modal.component';

@Component({
    selector: 'app-agents-report',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatChipsModule,
        MatExpansionModule,
        MatInputModule,
        MatFormFieldModule,
        FormSkeletonComponent
    ],
    templateUrl: './agents-report.html',
    styleUrls: ['./agents-report.scss']
})
export class AgentsReportComponent implements OnInit {
    isLoading = true;
    agents: Agent[] = [];
    filteredAgents: Agent[] = [];
    stats: UserStats | null = null;
    totalAgents = 0;
    totalClients = 0;
    searchTerm = '';

    constructor(
        private userService: UserService,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;

        // Cargar estadísticas
        this.userService.getStats().subscribe({
            next: (stats) => {
                this.stats = stats;
            },
            error: (error) => {
                console.error('Error al cargar estadísticas:', error);
            }
        });

        // Cargar reporte de agentes
        this.userService.getAgentsReport().subscribe({
            next: (response) => {
                this.agents = response.agents;
                this.filteredAgents = response.agents;
                this.totalAgents = response.total_agents;
                this.totalClients = response.total_clients;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error al cargar reporte de agentes:', error);
                this.isLoading = false;
            }
        });
    }

    // Filtrar agentes y clientes por búsqueda
    onSearch(): void {
        const term = this.searchTerm.toLowerCase().trim();

        if (!term) {
            this.filteredAgents = this.agents;
            return;
        }

        this.filteredAgents = this.agents
            .map(agent => {
                // Verificar si el agente coincide con el término
                const agentMatches = agent.name.toLowerCase().includes(term) ||
                    agent.email.toLowerCase().includes(term);

                // Filtrar clientes que coincidan
                const filteredClients = agent.created_users?.filter((client: any) =>
                    client.name.toLowerCase().includes(term) ||
                    client.email.toLowerCase().includes(term)
                ) || [];

                // Si el agente coincide o tiene clientes que coinciden, incluirlo
                if (agentMatches || filteredClients.length > 0) {
                    return {
                        ...agent,
                        created_users: agentMatches ? agent.created_users : filteredClients
                    };
                }

                return null;
            })
            .filter(agent => agent !== null) as Agent[];
    }

    // Limpiar búsqueda
    clearSearch(): void {
        this.searchTerm = '';
        this.onSearch();
    }

    // Abrir modal con detalles de la planilla
    openFormDetail(formId: number): void {
        const dialogRef = this.dialog.open(FormDetailModalComponent, {
            width: '900px',
            maxWidth: '95vw',
            data: { formId },
            panelClass: 'form-detail-dialog'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result?.updated) {
                this.loadData(); // Recargar datos si hubo actualización
            }
        });
    }

    // Abrir modal con lista de planillas pendientes
    openPendingForms(): void {
        const dialogRef = this.dialog.open(FormsListModalComponent, {
            width: '900px',
            maxWidth: '95vw',
            data: {
                status: 'pendiente',
                title: 'Planillas Pendientes'
            },
            panelClass: 'forms-list-dialog'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result?.updated) {
                this.loadData();
            }
        });
    }

    // Abrir modal con lista de planillas activas
    openActiveForms(): void {
        const dialogRef = this.dialog.open(FormsListModalComponent, {
            width: '900px',
            maxWidth: '95vw',
            data: {
                status: 'activo',
                title: 'Planillas Activas'
            },
            panelClass: 'forms-list-dialog'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result?.updated) {
                this.loadData();
            }
        });
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'pendiente':
                return 'warn';
            case 'activo':
                return 'primary';
            case 'inactivo':
                return 'accent';
            case 'rechazado':
                return 'warn';
            default:
                return '';
        }
    }

    getStatusIcon(status: string): string {
        switch (status) {
            case 'pendiente':
                return 'schedule';
            case 'activo':
                return 'check_circle';
            case 'inactivo':
                return 'pause_circle';
            case 'rechazado':
                return 'cancel';
            default:
                return 'help';
        }
    }
}
