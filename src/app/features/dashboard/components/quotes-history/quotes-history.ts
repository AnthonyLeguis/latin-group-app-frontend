import { Component, OnInit, inject } from '@angular/core';
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
import { ApplicationFormService } from '../../../../core/services/application-form.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ApplicationForm } from '../../../../core/models/application-form.interface';
import { FormSkeletonComponent } from '../../../../shared/components/form-skeleton/form-skeleton';
import { FormDetailModalComponent } from '../form-detail-modal/form-detail-modal.component';

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
        FormSkeletonComponent
    ],
    templateUrl: './quotes-history.html',
    styleUrls: ['./quotes-history.scss']
})
export class QuotesHistoryComponent implements OnInit {
    private formService = inject(ApplicationFormService);
    private authService = inject(AuthService);
    private dialog = inject(MatDialog);

    isLoading = true;
    forms: ApplicationForm[] = [];
    filteredForms: ApplicationForm[] = [];
    searchTerm = '';
    selectedStatus: string | null = null; // Estado seleccionado para filtrar
    totalForms = 0;
    currentPage = 1;
    pageSize = 15;

    // Usuario actual
    isAdmin = false;

    displayedColumns: string[] = ['client', 'form', 'status', 'confirmed', 'pdf'];

    ngOnInit(): void {
        this.checkUserRole();
        this.loadForms();
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
        this.isLoading = true;
        this.formService.getApplicationForms(page, this.pageSize).subscribe({
            next: (response: any) => {
                console.log('📋 Quotes history response:', response);
                // El backend devuelve un objeto paginado: { data: [...], total: X, current_page, per_page }
                this.forms = response.data || [];
                this.filteredForms = [...this.forms];
                this.totalForms = response.total || 0;
                this.currentPage = response.current_page || 1;
                this.pageSize = response.per_page || 15;
                this.isLoading = false;
            },
            error: (error: any) => {
                console.error('❌ Error loading forms:', error);
                this.isLoading = false;
            }
        });
    }

    onPageChange(event: PageEvent): void {
        this.loadForms(event.pageIndex + 1);
    }

    onSearch(): void {
        this.applyFilters();
    }

    clearSearch(): void {
        this.searchTerm = '';
        this.applyFilters();
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
        const url = `http://127.0.0.1:8000/api/v1/forms/${form.id}/download-pdf`;

        console.log('🔍 Intentando descargar PDF:', {
            url,
            form_id: form.id,
            pdf_path: form.pdf_path,
            hasToken: !!token
        });

        fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/pdf'
            }
        })
            .then(response => {
                console.log('📥 Respuesta del servidor:', {
                    status: response.status,
                    ok: response.ok,
                    headers: Object.fromEntries(response.headers.entries())
                });

                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.message || 'Error al descargar el PDF');
                    }).catch(() => {
                        throw new Error(`Error ${response.status}: ${response.statusText}`);
                    });
                }
                return response.blob();
            })
            .then(blob => {
                console.log('✅ PDF descargado, tamaño:', blob.size, 'bytes');

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
        const url = `http://127.0.0.1:8000/api/v1/forms/${form.id}/view-pdf?token=${token}`;
        window.open(url, '_blank');
    }
}
