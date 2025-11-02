import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { OnlineAgentsService, OnlineAgentsResponse, OnlineAgent } from '../../../../core/services/online-agents.service';
import { WebSocketService } from '../../../../core/services/websocket.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../../shared/components/notification-dialog/confirm-dialog.component';
import { environment } from '../../../../core/config/environment';

@Component({
    selector: 'app-agents-online-modal',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTooltipModule
    ],
    templateUrl: './agents-online-modal.component.html',
    styleUrls: ['./agents-online-modal.component.scss']
})
export class AgentsOnlineModalComponent implements OnInit, OnDestroy {
    private onlineAgentsService = inject(OnlineAgentsService);
    private webSocketService = inject(WebSocketService);
    private authService = inject(AuthService);
    private http = inject(HttpClient);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    loading = true;
    data: OnlineAgentsResponse | null = null;

    constructor(
        public dialogRef: MatDialogRef<AgentsOnlineModalComponent>
    ) { }

    ngOnInit(): void {
        // Cargar datos iniciales
        this.loadOnlineAgents();

        // Suscribirse a actualizaciones en tiempo real vía WebSocket
        this.webSocketService.agentStats$
            .pipe(takeUntil(this.destroy$))
            .subscribe(stats => {
                if (stats) {
                    console.log('Modal: Recibiendo actualización WebSocket, recargando lista');
                    // Cuando llegue actualización, recargar la lista completa
                    this.loadOnlineAgents();
                }
            });
    }

    private loadOnlineAgents(): void {
        this.onlineAgentsService.getOnlineAgents()
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.data = data;
                this.loading = false;
                this.cdr.detectChanges();
            });
    }

    ngOnDestroy(): void {
        // Limpiar
        this.destroy$.next();
        this.destroy$.complete();
    }

    getTimeAgo(minutesAgo: number | null): string {
        if (minutesAgo === null) {
            return 'Nunca';
        }

        if (minutesAgo < 1) {
            return 'Ahora mismo';
        } else if (minutesAgo < 60) {
            return `Hace ${minutesAgo} ${minutesAgo === 1 ? 'minuto' : 'minutos'}`;
        } else {
            const hours = Math.floor(minutesAgo / 60);
            return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
        }
    }

    /**
     * Formatear minutos a formato "Xh Ym" o "Xm"
     */
    formatActiveTime(minutes: number | undefined): string {
        if (!minutes || minutes === 0) {
            return '0m';
        }

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours === 0) {
            return `${mins}m`;
        } else if (mins === 0) {
            return `${hours}h`;
        } else {
            return `${hours}h ${mins}m`;
        }
    }

    /**
     * Resetear tiempo activo de un agente
     */
    resetActiveTime(agent: OnlineAgent, event: Event): void {
        event.stopPropagation(); // Evitar propagación del click

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Resetear tiempo activo',
                message: `¿Está seguro que desea resetear el tiempo activo de ${agent.name}? Esta acción no se puede deshacer.`,
                confirmButtonText: 'Sí, resetear',
                cancelButtonText: 'Cancelar',
                type: 'warning'
            },
            width: '400px',
            panelClass: 'custom-dialog-container'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.performReset(agent);
            }
        });
    }

    /**
     * Realizar el reset en el backend
     */
    private performReset(agent: OnlineAgent): void {
        this.http.post(`${environment.apiUrl}/users/${agent.id}/reset-active-time`, {})
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.snackBar.open('Tiempo activo reseteado correctamente', 'Cerrar', {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });

                    // Recargar la lista
                    this.loadOnlineAgents();
                },
                error: (error) => {
                    console.error('Error reseteando tiempo activo:', error);
                    this.snackBar.open('Error al resetear el tiempo activo', 'Cerrar', {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                }
            });
    }

    /**
     * Verificar si el usuario actual es admin
     */
    get isAdmin(): boolean {
        return this.authService.isAdmin();
    }

    onClose(): void {
        this.dialogRef.close();
    }

    get onlineAgents(): OnlineAgent[] {
        return this.data?.agents.filter(a => a.is_online) || [];
    }

    get offlineAgents(): OnlineAgent[] {
        return this.data?.agents.filter(a => !a.is_online) || [];
    }
}
