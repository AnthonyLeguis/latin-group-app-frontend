import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, Subject, interval, of } from 'rxjs';
import { switchMap, startWith, catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../config/environment';

export interface OnlineAgent {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    last_activity: string | null;
    is_online: boolean;
    minutes_ago: number | null;
    total_active_time?: number; // Total de minutos acumulados activo
}

export interface OnlineAgentsResponse {
    total_agents: number;
    online_agents: number;
    offline_agents: number;
    agents: OnlineAgent[];
    last_updated: string;
}

@Injectable({
    providedIn: 'root'
})
export class OnlineAgentsService {
    private readonly normalInterval = 10_000; // 10 segundos para dashboard
    private readonly realtimeInterval = 3_000; // 3 segundos cuando modal está abierto
    private currentInterval = this.normalInterval;
    private realtimeConsumers = 0;

    private pollingSubject$ = new Subject<number>();
    private onlineAgents$: Observable<OnlineAgentsResponse>;

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        // Configurar el observable de polling
        this.onlineAgents$ = this.pollingSubject$.pipe(
            startWith(0), // Emitir inmediatamente al suscribirse
            switchMap(() => interval(this.currentInterval).pipe(startWith(0))),
            switchMap(() => this.fetchOnlineAgents()),
            shareReplay({ bufferSize: 1, refCount: true })
        );
    }

    /**
     * Obtener el observable de agentes online con polling automático
     */
    getOnlineAgents(): Observable<OnlineAgentsResponse> {
        return this.onlineAgents$;
    }

    /**
     * Activar modo de actualización en tiempo real (polling cada 10s)
     * Útil cuando el modal está abierto
     */
    startRealtimeTracking(): void {
        this.realtimeConsumers++;

        if (this.realtimeConsumers === 1) {
            this.setPollingInterval(this.realtimeInterval);
        }
    }

    /**
     * Volver al modo normal de polling (cada 30s)
     * Se llama al cerrar el modal
     */
    stopRealtimeTracking(): void {
        if (this.realtimeConsumers > 0) {
            this.realtimeConsumers--;
        }

        if (this.realtimeConsumers === 0 && this.currentInterval !== this.normalInterval) {
            this.setPollingInterval(this.normalInterval);
        }
    }

    /**
     * Forzar una actualización inmediata
     */
    refresh(): void {
        this.pollingSubject$.next(0);
    }

    private setPollingInterval(interval: number): void {
        this.currentInterval = interval;
        this.pollingSubject$.next(interval);
    }

    /**
     * Petición HTTP para obtener agentes online
     */
    private fetchOnlineAgents(): Observable<OnlineAgentsResponse> {
        if (!isPlatformBrowser(this.platformId)) {
            return of({
                total_agents: 0,
                online_agents: 0,
                offline_agents: 0,
                agents: [],
                last_updated: new Date().toISOString()
            });
        }

        return this.http.get<OnlineAgentsResponse>(
            `${environment.apiUrl}/users/online-agents`
        ).pipe(
            catchError(error => {
                console.error('Error fetching online agents:', error);
                return of({
                    total_agents: 0,
                    online_agents: 0,
                    offline_agents: 0,
                    agents: [],
                    last_updated: new Date().toISOString()
                });
            })
        );
    }

    /**
     * Obtener solo el conteo (útil para las estadísticas)
     */
    getOnlineCount(): Observable<{ online: number; total: number }> {
        return this.onlineAgents$.pipe(
            switchMap(data => of({
                online: data.online_agents,
                total: data.total_agents
            }))
        );
    }
}
