import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { UserService, Agent, UserStats } from '../../../../core/services/user.service';
import { FormSkeletonComponent } from '../../../../shared/components/form-skeleton/form-skeleton';

@Component({
    selector: 'app-agents-report',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatChipsModule,
        MatExpansionModule,
        FormSkeletonComponent
    ],
    templateUrl: './agents-report.html',
    styleUrls: ['./agents-report.scss']
})
export class AgentsReportComponent implements OnInit {
    isLoading = true;
    agents: Agent[] = [];
    stats: UserStats | null = null;
    totalAgents = 0;
    totalClients = 0;

    constructor(private userService: UserService) { }

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
