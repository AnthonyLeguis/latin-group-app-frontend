import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApplicationFormService } from '../../../../core/services/application-form.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ApplicationForm } from '../../../../core/models/application-form.interface';
import { FormSkeletonComponent } from '../../../../shared/components/form-skeleton/form-skeleton';
import { FormDetailModalComponent } from '../form-detail-modal/form-detail-modal.component';
import { TokenAuthorizationModalComponent } from '../token-authorization-modal/token-authorization-modal.component';
import { environment } from '../../../../core/config/environment';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

@Component({
    selector: 'app-quotes-history',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatChipsModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        FormSkeletonComponent
    ],
    templateUrl: './quotes-history.html',
    styleUrls: ['./quotes-history.scss']
})
export class QuotesHistoryComponent implements OnInit, OnDestroy {
    private formService = inject(ApplicationFormService);
    private authService = inject(AuthService);
    private dialog = inject(MatDialog);
    private cdr = inject(ChangeDetectorRef);
    private readonly apiBase = environment.apiUrl.replace(/\/$/, '');

    isLoading = true;
    isLoadingTable = false; // Nuevo: solo para la tabla
    forms: ApplicationForm[] = [];
    filteredForms: ApplicationForm[] = [];
    searchTerm = '';
    selectedStatus: string | null = null;
    totalForms = 0;
    currentPage = 1;
    pageSize = 15;
    
    // Subject para el debounce de búsqueda
    private searchSubject = new Subject<string>();

    // Usuario actual
    isAdmin = false;

    displayedColumns: string[] = ['client', 'form', 'status', 'confirmed', 'pdf', 'token'];

    ngOnInit(): void {
        this.checkUserRole();
        this.loadForms();
        this.setupSearchDebounce();
    }
    
    /**
     * Configurar debounce para la búsqueda
     */
    private setupSearchDebounce(): void {
        this.searchSubject.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(searchTerm => {
            this.currentPage = 1;
            this.loadForms(1);
        });
    }

    checkUserRole(): void {
        const user = this.authService.currentUser;
        this.isAdmin = user?.type === 'admin';

        // Si es admin, agregar columna de agente después de 'form'
        if (this.isAdmin && !this.displayedColumns.includes('agent')) {
            this.displayedColumns.splice(2, 0, 'agent');
        }
    }

    loadForms(page: number = 1): void {
        // Si es la carga inicial, mostrar skeleton completo
        // Si es búsqueda/filtro, solo mostrar loader en tabla
        if (page === 1 && this.forms.length === 0) {
            this.isLoading = true;
        } else {
            this.isLoadingTable = true;
        }
        
        const searchValue = (this.searchTerm || '').trim();
        const filters = searchValue ? { search: searchValue } : undefined;

        this.formService.getApplicationForms(page, this.pageSize, filters).pipe(
            finalize(() => {
                this.isLoading = false;
                this.isLoadingTable = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (response: any) => {
                this.forms = response.data || [];
                this.totalForms = response.total || this.forms.length;
                this.currentPage = response.current_page || page;
                this.pageSize = response.per_page || this.pageSize;
                this.applyFilters();
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                console.error('❌ Error loading forms:', error);
                this.forms = [];
                this.filteredForms = [];
                this.cdr.detectChanges();
            }
        });
    }

    onPageChange(event: PageEvent): void {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex + 1;
        this.loadForms(this.currentPage);
    }

    onSearch(): void {
        this.searchSubject.next(this.searchTerm);
    }

    clearSearch(): void {
        this.searchTerm = '';
        this.currentPage = 1;
        this.loadForms(1);
    }
    
    ngOnDestroy(): void {
        this.searchSubject.complete();
    }

    // Filtrar por estado
    filterByStatus(status: string): void {
        // Si el estado ya está seleccionado, quitamos el filtro
        if (this.selectedStatus === status) {
            this.selectedStatus = null;
        } else {
            this.selectedStatus = status;
        }
        this.applyFilters();
    }

    // Aplicar todos los filtros (búsqueda + estado)
    applyFilters(): void {
        let filtered = [...this.forms];

        // Filtro por texto de búsqueda
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase().trim();
            filtered = filtered.filter(form =>
                form.client?.name?.toLowerCase().includes(term) ||
                form.applicant_name?.toLowerCase().includes(term) ||
                (form.agent?.name || form.client?.created_by?.name || '').toLowerCase().includes(term) ||
                form.id.toString().includes(term)
            );
        }

        // Filtro por estado
        if (this.selectedStatus) {
            filtered = filtered.filter(form =>
                form.status?.toLowerCase() === this.selectedStatus
            );
        }

        this.filteredForms = filtered;
    }

    openFormDetail(formId: number): void {
        const dialogRef = this.dialog.open(FormDetailModalComponent, {
            width: '900px',
            maxWidth: '95vw',
            maxHeight: '90vh',
            data: { formId },
            panelClass: 'form-detail-dialog'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result?.updated) {
                this.loadForms();
            }
        });
    }

    getStatusClass(status: string): string {
        return status?.toLowerCase() || 'pendiente';
    }

    getStatusIcon(status: string): string {
        const statusMap: { [key: string]: string } = {
            'pendiente': 'schedule',
            'activo': 'check_circle',
            'inactivo': 'cancel',
            'rechazado': 'error'
        };
        return statusMap[status?.toLowerCase()] || 'schedule';
    }

    getStatusLabel(status: string): string {
        const statusMap: { [key: string]: string } = {
            'pendiente': 'Pendiente',
            'activo': 'Activo',
            'inactivo': 'Inactivo',
            'rechazado': 'Rechazado'
        };
        return statusMap[status?.toLowerCase()] || status;
    }

    getAgentName(form: ApplicationForm): string {
        return form.agent?.name || form.client?.created_by?.name || 'Sin agente';
    }

    formatDate(date: string): string {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    downloadPDF(form: ApplicationForm): void {
        if (!form.pdf_path) {
            console.warn('PDF no disponible para esta planilla');
            return;
        }

        // Hacer request al endpoint de descarga
        const token = this.authService.getToken();
        if (!token) {
            alert('No se pudo obtener el token de autenticación para descargar el PDF');
            return;
        }

        const url = `${this.apiBase}/forms/${form.id}/download-pdf`;

        // ////console.log('🔍 Intentando descargar PDF:', {
        //     url,
        //     form_id: form.id,
        //     pdf_path: form.pdf_path,
        //     hasToken: !!token
        // });

        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/pdf'
            }
        })
            .then(async response => {
                // //console.log('📥 Respuesta del servidor:', {
                //     status: response.status,
                //     ok: response.ok,
                //     headers: Object.fromEntries(response.headers.entries())
                // });

                if (!response.ok) {
                    try {
                        const err = await response.json();
                        throw new Error(err.message || 'Error al descargar el PDF');
                    } catch {
                        throw new Error(`Error ${response.status}: ${response.statusText}`);
                    }
                }
                return response.blob();
            })
            .then(blob => {
                ////console.log('✅ PDF descargado, tamaño:', blob.size, 'bytes');

                // Crear un blob URL y descargar
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${form.client?.name}_Confirmación_${form.id}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('❌ Error descargando PDF:', error);
                alert(`Error al descargar el PDF: ${error.message}`);
            });
    }

    viewPDF(form: ApplicationForm): void {
        if (!form.pdf_path) {
            console.warn('PDF no disponible para esta planilla');
            return;
        }

        // Abrir en nueva pestaña para visualizar
        const token = this.authService.getToken();
        if (!token) {
            alert('No se pudo obtener el token de autenticación para visualizar el PDF');
            return;
        }

        const url = `${this.apiBase}/forms/${form.id}/view-pdf?token=${encodeURIComponent(token)}`;
        window.open(url, '_blank');
    }

    openTokenAuthorizationModal(form: ApplicationForm): void {
        this.dialog.open(TokenAuthorizationModalComponent, {
            data: {
                formId: form.id,
                clientName: form.client?.name || 'Cliente Desconocido',
                confirmationToken: form.confirmation_token,
                tokenExpiresAt: form.token_expires_at,
                confirmed: form.confirmed
            },
            width: '600px',
            maxWidth: '95vw',
            panelClass: 'token-authorization-dialog'
        });
    }
}
