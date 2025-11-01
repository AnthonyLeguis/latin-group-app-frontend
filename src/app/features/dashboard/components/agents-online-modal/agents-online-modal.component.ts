import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OnlineAgentsService, OnlineAgentsResponse, OnlineAgent } from '../../../../core/services/online-agents.service';

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
    private destroy$ = new Subject<void>();

    loading = true;
    isRefreshing = false;
    data: OnlineAgentsResponse | null = null;
    lastUpdatedSeconds = 0;
    private updateInterval: any;

    constructor(
        public dialogRef: MatDialogRef<AgentsOnlineModalComponent>
    ) { }

    ngOnInit(): void {
        // Activar polling en tiempo real (cada 10s)
        this.onlineAgentsService.startRealtimeTracking();

        // Suscribirse a los datos de agentes online
        this.onlineAgentsService.getOnlineAgents()
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.data = data;
                this.loading = false;
                this.isRefreshing = false;
                this.lastUpdatedSeconds = 0;
            });

        // Actualizar el contador de "hace X segundos"
        this.updateInterval = setInterval(() => {
            this.lastUpdatedSeconds++;
        }, 1000);
    }

    ngOnDestroy(): void {
        // Volver a polling normal
        this.onlineAgentsService.stopRealtimeTracking();

        // Limpiar
        this.destroy$.next();
        this.destroy$.complete();

        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
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

    refresh(): void {
        if (this.isRefreshing) {
            return;
        }

        this.isRefreshing = true;
        this.onlineAgentsService.refresh();
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
