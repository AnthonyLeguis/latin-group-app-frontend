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
    rejected_forms: number;
}

export interface ApplicationForm {
    id: number;
    status: string;
    reviewed_by: number | null;
    created_at: string;
}

export interface Client {
    id: number;
    name: string;
    email: string;
    application_forms_as_client: ApplicationForm[];
}

export interface Agent {
    id: number;
    name: string;
    email: string;
    clients_count: number;
    created_users: Client[];
}

export interface AgentsReportResponse {
    agents: Agent[];
    total_agents: number;
    total_clients: number;
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
     * Obtener lista de usuarios con filtros opcionales
     */
    getUsers(filters?: { type?: string }): Observable<any> {
        let url = `${environment.apiUrl}/users`;

        if (filters?.type) {
            url += `?type=${filters.type}`;
        }

        return this.http.get<any>(url, { headers: this.getHeaders() });
    }
}
