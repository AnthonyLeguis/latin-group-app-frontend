import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config/environment';

export interface UserStats {
    total_users: number;
    total_admins: number;
    total_agents: number;
    total_clients: number;
    pending_forms: number;
    active_forms: number;
    inactive_forms: number;
    rejected_forms: number;
    online_agents: number;
}

export interface ApplicationForm {
    id: number;
    status: string;
    reviewed_by: number | null;
    created_at: string;
    has_pending_changes?: boolean;
    pending_changes?: any;
    pending_changes_at?: string;
    pending_changes_by?: number;
}

export interface Client {
    id: number;
    name: string;
    email: string;
    application_forms_as_client: ApplicationForm[];
    created_by_admin?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface Agent {
    id: number;
    name: string;
    email: string;
    clients_count: number;
    pending_changes_count?: number; // Nueva propiedad
    created_users: Client[];
}

export interface AgentsReportResponse {
    agents: Agent[];
    total_agents: number;
    total_clients: number;
    pending_changes_forms: ApplicationForm[]; // Nueva propiedad
    total_pending_changes: number; // Nueva propiedad
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    private getHeaders(): HttpHeaders {
        const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('auth_token') : null;
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    }

    getAgentsReport(): Observable<AgentsReportResponse> {
        return this.http.get<AgentsReportResponse>(
            `${environment.apiUrl}/users/agents-report`,
            { headers: this.getHeaders() }
        );
    }

    getStats(): Observable<UserStats> {
        return this.http.get<UserStats>(
            `${environment.apiUrl}/users/stats`,
            { headers: this.getHeaders() }
        );
    }

    /**
     * Obtener lista de usuarios con filtros opcionales y paginación
     */
    getUsers(filters?: { type?: string; page?: number }): Observable<any> {
        const params = new URLSearchParams();

        if (filters?.type) {
            params.append('type', filters.type);
        }

        if (filters?.page) {
            params.append('page', filters.page.toString());
        }

        const url = `${environment.apiUrl}/users${params.toString() ? '?' + params.toString() : ''}`;
        //console.log('Solicitando usuarios desde:', url);

        return this.http.get<any>(url, { headers: this.getHeaders() });
    }

    /**
     * Actualizar información de un usuario
     */
    updateUser(userId: number, data: any): Observable<any> {
        return this.http.put<any>(
            `${environment.apiUrl}/users/${userId}`,
            data,
            { headers: this.getHeaders() }
        );
    }

    /**
     * Eliminar un usuario
     */
    deleteUser(userId: number): Observable<any> {
        return this.http.delete<any>(
            `${environment.apiUrl}/users/${userId}`,
            { headers: this.getHeaders() }
        );
    }
}
