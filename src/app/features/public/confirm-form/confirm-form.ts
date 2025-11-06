import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../core/config/environment';
import { timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface ConfirmationData {
    id: number;
    client_name: string;
    email?: string;
    phone?: string;
    address?: string;
    zip_code?: string;
    city?: string;
    state?: string;
    dob?: string;
    insurance_company?: string;
    insurance_plan?: string;
    wages?: number;
    final_cost?: string;
    confirmed?: boolean;
    confirmed_at?: string;
    token_expires_at?: string;
    days_remaining?: number;
    agent_name?: string;
    agent_phone?: string;
}

@Component({
    selector: 'app-confirm-form',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './confirm-form.html',
    styleUrls: ['./confirm-form.scss']
})
export class ConfirmFormComponent implements OnInit {
    token: string = '';
    formData: ConfirmationData | null = null;
    loading: boolean = true;
    error: string = '';
    success: boolean = false;
    confirming: boolean = false;

    // Estados de error
    tokenExpired: boolean = false;
    alreadyConfirmed: boolean = false;
    tokenInvalid: boolean = false;

    constructor(
        private route: ActivatedRoute,
        public router: Router,
        private http: HttpClient,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        // Obtener el token de la URL
        this.token = this.route.snapshot.paramMap.get('token') || '';

        if (!this.token) {
            this.error = 'Token no proporcionado';
            this.loading = false;
            return;
        }

        this.loadFormData();
    }

    loadFormData(): void {
        this.loading = true;
        this.error = '';

        const url = `${environment.apiUrl}/confirm/${this.token}`;

        // Ocultar la pantalla de carga después de 3 segundos automáticamente
        setTimeout(() => {
            if (this.loading) {
                this.loading = false;
                this.cd.detectChanges();
            }
        }, 3000);

        this.http.get<{ success: boolean, form: ConfirmationData }>(url).pipe(
            timeout(10000), // Timeout de 10 segundos
            catchError(error => {
                if (error.name === 'TimeoutError') {
                    this.error = 'La solicitud está tardando demasiado. Por favor, verifique su conexión a internet y que el servidor backend esté corriendo.';
                    this.loading = false;
                    this.cd.detectChanges();
                }
                return throwError(() => error);
            })
        ).subscribe({
            next: (response) => {
                this.formData = response.form;
                this.loading = false;

                // Si el formulario ya está confirmado, mostrar mensaje de éxito
                if (response.form.confirmed && response.form.confirmed_at) {
                    this.success = true;
                    this.alreadyConfirmed = true;
                    this.error = 'Esta planilla ya fue confirmada anteriormente. Puede cerrar esta pestaña.';
                }

                setTimeout(() => this.cd.detectChanges(), 0);
            },
            error: (error) => {
                this.loading = false;

                // Manejar diferentes tipos de error
                if (error.status === 404) {
                    // Cuando el token se invalida después de confirmar, también retorna 404
                    // El mensaje del backend nos indica si ya fue confirmada
                    const errorMessage = error.error?.message || '';

                    if (errorMessage.includes('ya no es válido') || errorMessage.includes('puede cerrar')) {
                        // Token invalidado porque ya fue confirmado
                        this.success = true;
                        this.error = 'Ya su planilla ha sido aceptada. Puede cerrar esta pestaña.';
                    } else {
                        // Token nunca existió o es inválido
                        this.tokenInvalid = true;
                        this.error = 'El enlace de confirmación no es válido o no existe.';
                    }
                } else if (error.status === 410) {
                    this.tokenExpired = true;
                    this.error = 'El enlace de confirmación ha expirado. Por favor, contacte con su agente para obtener un nuevo enlace.';
                } else if (error.status === 409) {
                    this.alreadyConfirmed = true;
                    this.error = 'Este formulario ya ha sido confirmado anteriormente.';
                } else if (error.status === 0) {
                    this.error = 'No se puede conectar con el servidor. Verifique que el backend esté corriendo en http://127.0.0.1:8000';
                } else if (error.name !== 'TimeoutError') {
                    this.error = error.error?.error || error.error?.message || 'Error al cargar los datos del formulario.';
                }

                setTimeout(() => this.cd.detectChanges(), 0);
            }
        });
    }

    confirmDocument(): void {
        if (!this.token || this.confirming) {
            return;
        }

        this.confirming = true;

        const url = `${environment.apiUrl}/confirm/${this.token}/accept`;

        this.http.post<{ message: string, success: boolean, confirmed_at?: string, form_id?: number }>(url, {}).subscribe({
            next: (response) => {
                //console.log('✅ Documento confirmado:', response);
                this.success = true;
                this.confirming = false;

                // Actualizar la información de confirmación
                if (this.formData) {
                    this.formData.confirmed = true;
                    this.formData.confirmed_at = response.confirmed_at;
                }

                // Forzar actualización de la vista
                setTimeout(() => this.cd.detectChanges(), 0);
            },
            error: (error) => {
                console.error('❌ Error al confirmar:', error);
                this.confirming = false;
                this.loading = false; // Asegurar que no quede en loading

                // Manejar diferentes tipos de error
                if (error.status === 404) {
                    this.tokenInvalid = true;
                    this.error = 'El enlace de confirmación no es válido.';
                } else if (error.status === 410) {
                    this.tokenExpired = true;
                    this.error = 'El enlace de confirmación ha expirado.';
                } else if (error.status === 409) {
                    this.alreadyConfirmed = true;
                    this.error = 'Este formulario ya ha sido confirmado.';
                } else if (error.status === 500) {
                    // Error interno del servidor
                    this.error = error.error?.message || 'Error interno del servidor. Por favor, contacte al administrador.';
                } else {
                    this.error = error.error?.message || error.error?.error || 'Error al confirmar el documento.';
                }

                // Forzar actualización de la vista
                setTimeout(() => this.cd.detectChanges(), 0);
            }
        });
    }

    getInsuranceTypeLabel(type?: string): string {
        const types: { [key: string]: string } = {
            'health': 'Seguro de Salud',
            'life': 'Seguro de Vida',
            'auto': 'Seguro de Auto',
            'home': 'Seguro de Hogar',
            'business': 'Seguro de Negocios'
        };
        return type ? types[type] || type : 'No especificado';
    }

    formatDate(date?: string): string {
        if (!date) return 'No especificada';
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}
