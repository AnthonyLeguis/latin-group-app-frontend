import { Component, OnInit, OnDestroy, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
import { OnlineAgentsService } from '../../../../core/services/online-agents.service';
import { FormSkeletonComponent } from '../../../../shared/components/form-skeleton/form-skeleton';
import { FormDetailModalComponent } from '../form-detail-modal/form-detail-modal.component';
import { FormsListModalComponent } from '../forms-list-modal/forms-list-modal.component';
import { AgentsOnlineModalComponent } from '../agents-online-modal/agents-online-modal.component';
import { Subscription, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

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
export class AgentsReportComponent implements OnInit, OnDestroy {
    isLoading = true;
    agents: Agent[] = [];
    filteredAgents: Agent[] = [];
    stats: UserStats | null = null;
    totalAgents = 0;
    totalClients = 0;
    totalPendingChanges = 0;
    searchTerm = '';
    selectedStatus: string | null = null; // Estado seleccionado para filtrar
    pendingFormsCount: number | null = null;
    activeFormsCount: number | null = null;
    onlineAgentsCount = 0;
    totalAgentsCount = 0;

    constructor(
        private userService: UserService,
        private onlineAgentsService: OnlineAgentsService,
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        // Avoid firing authenticated requests during SSR since tokens live in localStorage
        if (isPlatformBrowser(this.platformId)) {
            this.loadData();
            this.subscribeToOnlineAgents();
        }
    }

    subscribeToOnlineAgents(): void {
        this.onlineAgentsService.getOnlineAgents()
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.onlineAgentsCount = data.online_agents;
                this.totalAgentsCount = data.total_agents;
            });
    }

    private destroy$ = new Subject<void>();

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadData(): void {
        this.isLoading = true;

        // Cargar estadísticas
        this.userService.getStats().subscribe({
            next: (stats) => {
                this.stats = stats;
                // Resetear los contadores dinámicos para reflejar los datos oficiales
                this.pendingFormsCount = null;
                this.activeFormsCount = null;
            },
            error: (error) => {
                console.error('Error al cargar estadísticas:', error);
            }
        });

        // Cargar reporte de agentes
        this.userService.getAgentsReport().subscribe({
            next: (response) => {
                // Calcular cantidad de planillas con cambios pendientes por agente
                this.agents = response.agents.map(agent => {
                    const pendingCount = agent.created_users?.reduce((count, client) => {
                        const clientPendingForms = client.application_forms_as_client?.filter(
                            form => form.has_pending_changes === true
                        ).length || 0;
                        return count + clientPendingForms;
                    }, 0) || 0;

                    return {
                        ...agent,
                        pending_changes_count: pendingCount
                    };
                });

                this.filteredAgents = this.agents;
                this.totalAgents = response.total_agents;
                this.totalClients = response.total_clients;
                this.totalPendingChanges = response.total_pending_changes || 0;
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
        this.applyFilters();
    }

    // Limpiar búsqueda
    clearSearch(): void {
        this.searchTerm = '';
        this.applyFilters();
    }

    // Filtrar por estado
    filterByStatus(status: string): void {
        // Si el estado ya está seleccionado, quitamos el filtro
        if (this.selectedStatus === status) {
            this.selectedStatus = null;
        } else {
            this.selectedStatus = status;
        }
        this.applyFilters();
    }

    // Aplicar todos los filtros (búsqueda + estado)
    applyFilters(): void {
        let filtered = [...this.agents];

        // Filtro por texto de búsqueda
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase().trim();
            filtered = filtered
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

        // Filtro por estado (filtrar planillas dentro de cada cliente)
        if (this.selectedStatus) {
            filtered = filtered
                .map(agent => {
                    if (!agent.created_users) return agent;

                    // Filtrar clientes que tienen planillas con el estado seleccionado
                    const clientsWithFilteredForms = agent.created_users
                        .map((client: any) => {
                            if (!client.application_forms_as_client) return null;

                            // Filtrar planillas por estado
                            const filteredForms = client.application_forms_as_client.filter((form: any) =>
                                form.status?.toLowerCase() === this.selectedStatus
                            );

                            // Si el cliente tiene planillas con el estado, incluirlo
                            if (filteredForms.length > 0) {
                                return {
                                    ...client,
                                    application_forms_as_client: filteredForms
                                };
                            }

                            return null;
                        })
                        .filter((client: any) => client !== null);

                    // Si el agente tiene clientes con planillas filtradas, incluirlo
                    if (clientsWithFilteredForms.length > 0) {
                        return {
                            ...agent,
                            created_users: clientsWithFilteredForms
                        };
                    }

                    return null;
                })
                .filter(agent => agent !== null) as Agent[];
        }

        this.filteredAgents = filtered;
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
            if (result?.updated && result.form) {
                // Envolver en setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
                setTimeout(() => {
                    // Buscar y actualizar solo el formulario modificado en memoria
                    let agentUpdated: Agent | null = null;
                    for (const agent of this.agents) {
                        if (!agent.created_users) continue;
                        for (const client of agent.created_users) {
                            if (!client.application_forms_as_client) continue;
                            const formIndex = client.application_forms_as_client.findIndex((f: any) => f.id === result.form.id);
                            if (formIndex !== -1) {
                                client.application_forms_as_client[formIndex] = result.form;
                                agentUpdated = agent;
                                break;
                            }
                        }
                        if (agentUpdated) break;
                    }

                    // Recalcular el contador de cambios pendientes para el agente
                    if (agentUpdated) {
                        const pendingCount = agentUpdated.created_users?.reduce((count, client) => {
                            const clientPendingForms = client.application_forms_as_client?.filter(
                                form => form.has_pending_changes === true
                            ).length || 0;
                            return count + clientPendingForms;
                        }, 0) || 0;
                        agentUpdated.pending_changes_count = pendingCount;
                    }

                    // Reflejar cambios en la lista filtrada
                    this.filteredAgents = [...this.agents];

                    // Forzar detección de cambios
                    this.cdr.detectChanges();
                });
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

        let formsCountSubscription: Subscription | null = null;

        dialogRef.afterOpened().pipe(take(1)).subscribe(() => {
            const instance = dialogRef.componentInstance;
            if (instance?.formsCountChange) {
                formsCountSubscription = instance.formsCountChange.subscribe(count => {
                    this.pendingFormsCount = count;
                });
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            formsCountSubscription?.unsubscribe();
            formsCountSubscription = null;
            this.pendingFormsCount = null; // Volver a usar el valor oficial

            if (result?.updated) {
                this.loadData();
            }
        });
    }

    // Abrir modal con agentes conectados
    openOnlineAgents(): void {
        this.dialog.open(AgentsOnlineModalComponent, {
            width: '600px',
            maxWidth: '95vw',
            panelClass: 'agents-online-dialog'
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

        let formsCountSubscription: Subscription | null = null;

        dialogRef.afterOpened().pipe(take(1)).subscribe(() => {
            const instance = dialogRef.componentInstance;
            if (instance?.formsCountChange) {
                formsCountSubscription = instance.formsCountChange.subscribe(count => {
                    this.activeFormsCount = count;
                });
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            formsCountSubscription?.unsubscribe();
            formsCountSubscription = null;
            this.activeFormsCount = null;

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

    get pendingFormsDisplayCount(): number {
        return this.pendingFormsCount ?? this.stats?.pending_forms ?? 0;
    }

    get activeFormsDisplayCount(): number {
        return this.activeFormsCount ?? this.stats?.active_forms ?? 0;
    }
}
