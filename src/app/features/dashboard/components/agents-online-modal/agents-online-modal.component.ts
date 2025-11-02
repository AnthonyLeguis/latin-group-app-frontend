import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OnlineAgentsService, OnlineAgentsResponse, OnlineAgent } from '../../../../core/services/online-agents.service';
import { WebSocketService } from '../../../../core/services/websocket.service';

@Component({
    selector: 'app-agents-online-modal',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './agents-online-modal.component.html',
    styleUrls: ['./agents-online-modal.component.scss']
})
export class AgentsOnlineModalComponent implements OnInit, OnDestroy {
    private onlineAgentsService = inject(OnlineAgentsService);
    private webSocketService = inject(WebSocketService);
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
