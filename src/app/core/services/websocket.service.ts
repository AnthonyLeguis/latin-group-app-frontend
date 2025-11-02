import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Declarar Pusher en el window object
declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: any;
    }
}

export interface AgentStats {
    online_agents: number;
    total_agents: number;
    timestamp: string;
}

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private echo: any = null;
    private agentStatsSubject = new BehaviorSubject<AgentStats | null>(null);
    public agentStats$: Observable<AgentStats | null> = this.agentStatsSubject.asObservable();
    private isInitialized = false;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        if (isPlatformBrowser(this.platformId)) {
            this.initializeEcho();
        }
    }

    private initializeEcho(): void {
        if (this.isInitialized || !isPlatformBrowser(this.platformId)) {
            return;
        }

        try {
            // Hacer Pusher disponible globalmente
            window.Pusher = Pusher;

            // Inicializar Echo
            this.echo = new Echo({
                broadcaster: 'reverb',
                key: 'eegnqtrbjxppeyadeoua', // REVERB_APP_KEY del .env
                wsHost: 'localhost',
                wsPort: 8080,
                wssPort: 8080,
                forceTLS: false,
                enabledTransports: ['ws', 'wss'],
                disableStats: true,
            });

            window.Echo = this.echo;

            // Escuchar el canal de actividad de agentes
            this.echo.channel('agent-activity')
                .listen('AgentActivityUpdated', (data: any) => {
                    console.log('WebSocket: Recibiendo actualización de agentes', data);
                    if (data.stats) {
                        this.agentStatsSubject.next(data.stats);
                    }
                });

            this.isInitialized = true;
            console.log('WebSocket: Conexión establecida con Laravel Reverb');

        } catch (error) {
            console.error('WebSocket: Error al inicializar Echo', error);
        }
    }

    /**
     * Reconectar manualmente el WebSocket
     */
    public reconnect(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.disconnect();
            this.isInitialized = false;
            this.initializeEcho();
        }
    }

    /**
     * Desconectar el WebSocket
     */
    public disconnect(): void {
        if (this.echo) {
            this.echo.disconnect();
            this.echo = null;
            this.isInitialized = false;
            console.log('WebSocket: Desconectado');
        }
    }

    /**
     * Verificar si está conectado
     */
    public isConnected(): boolean {
        return this.isInitialized && this.echo !== null;
    }
}
