import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config/environment';
import { ApplicationForm, UpdateStatusRequest } from '../models/application-form.interface';

@Injectable({
    providedIn: 'root'
})
export class ApplicationFormService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/application-forms`;

    /**
     * Obtener todas las planillas (con filtros opcionales)
     */
    getApplicationForms(filters?: { status?: string; client_id?: number }): Observable<any> {
        let params = new HttpParams();

        if (filters?.status) {
            params = params.set('status', filters.status);
        }

        if (filters?.client_id) {
            params = params.set('client_id', filters.client_id.toString());
        }

        return this.http.get<any>(this.apiUrl, { params });
    }

    /**
     * Obtener una planilla específica por ID
     */
    getApplicationForm(id: number): Observable<ApplicationForm> {
        return this.http.get<ApplicationForm>(`${this.apiUrl}/${id}`);
    }

    /**
     * Actualizar el estado de una planilla (solo admin)
     */
    updateStatus(id: number, data: UpdateStatusRequest): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${id}/status`, data);
    }

    /**
     * Confirmar planilla (solo agent creador)
     */
    confirmForm(id: number, confirmed: boolean): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${id}/confirm`, { confirmed });
    }

    /**
     * Actualizar planilla completa
     */
    updateForm(id: number, data: Partial<ApplicationForm>): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, data);
    }

    /**
     * Crear nueva planilla de aplicación
     */
    createApplicationForm(data: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, data);
    }

    /**
     * Eliminar planilla (solo admin)
     */
    deleteForm(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}
