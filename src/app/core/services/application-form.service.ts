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
     * Obtener todas las planillas (con filtros opcionales y paginación)
     */
    getApplicationForms(
        page: number = 1,
        perPage: number = 15,
        filters?: { status?: string; client_id?: number }
    ): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('per_page', perPage.toString());

        if (filters?.status) {
            params = params.set('status', filters.status);
        }

        if (filters?.client_id) {
            params = params.set('client_id', filters.client_id.toString());
        }

        return this.http.get<any>(this.apiUrl, { params });
    }

    /**
     * Obtener IDs de clientes que ya tienen application forms
     * (sin paginación, para filtrar clientes disponibles)
     */
    getClientsWithForms(): Observable<{ client_ids: number[] }> {
        return this.http.get<{ client_ids: number[] }>(`${this.apiUrl}/clients-with-forms`);
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
     * Aprobar cambios pendientes (solo admin)
     */
    approvePendingChanges(id: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${id}/approve-changes`, {});
    }

    /**
     * Rechazar cambios pendientes (solo admin)
     */
    rejectPendingChanges(id: number, rejection_reason: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${id}/reject-changes`, { rejection_reason });
    }

    /**
     * Obtener historial de cambios de una planilla
     */
    getFormHistory(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}/history`);
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

    /**
     * Subir documento a una planilla
     */
    uploadDocument(formId: number, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('document', file);

        return this.http.post<any>(`${this.apiUrl}/${formId}/documents`, formData);
    }

    /**
     * Eliminar documento de una planilla
     */
    deleteDocument(formId: number, documentId: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${formId}/documents/${documentId}`);
    }

    /**
     * Descargar documento de una planilla
     */
    downloadDocument(formId: number, documentId: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${formId}/documents/${documentId}/download`, {
            responseType: 'blob'
        });
    }

    /**
     * Renovar token de confirmación (extender 3 días más)
     */
    renewToken(formId: number): Observable<{ message: string; token: string; expires_at: string; confirmation_link: string }> {
        return this.http.post<{ message: string; token: string; expires_at: string; confirmation_link: string }>(
            `${this.apiUrl}/${formId}/renew-token`,
            {}
        );
    }
}
