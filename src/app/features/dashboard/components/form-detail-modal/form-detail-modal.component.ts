import { Component, inject, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApplicationForm } from '../../../../core/models/application-form.interface';
import { ApplicationDocument } from '../../../../core/models/application-document.interface';
import { ApplicationFormService } from '../../../../core/services/application-form.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FormSkeletonComponent } from '../../../../shared/components/form-skeleton/form-skeleton';
import { environment } from '../../../../core/config/environment';

@Component({
    selector: 'app-form-detail-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        FormSkeletonComponent
    ],
    templateUrl: './form-detail-modal.component.html',
    styleUrls: ['./form-detail-modal.component.scss']
})
export class FormDetailModalComponent implements OnInit {
    private fb = inject(FormBuilder);
    private formService = inject(ApplicationFormService);
    private notificationService = inject(NotificationService);
    private authService = inject(AuthService);
    private cdr = inject(ChangeDetectorRef);

    form!: ApplicationForm;
    statusForm: FormGroup;
    rejectionForm: FormGroup;
    loading = true;
    submitting = false;
    error: string | null = null;
    showRejectionForm = false;
    viewingPendingChanges = false;
    currentStatus: { value: string; label: string; icon: string; color: string } | undefined;
    isAdmin = false;
    isAgent = false;
    history: any[] = [];
    loadingHistory = false;
    documents: ApplicationDocument[] = [];
    deletingDocumentId: number | null = null;

    statuses = [
        { value: 'pendiente', label: 'Pendiente', icon: 'schedule', color: '#f59e0b' },
        { value: 'activo', label: 'Activo', icon: 'check_circle', color: '#10b981' },
        { value: 'inactivo', label: 'Inactivo', icon: 'cancel', color: '#6b7280' },
        { value: 'rechazado', label: 'Rechazado', icon: 'error', color: '#ef4444' }
    ];

    constructor(
        public dialogRef: MatDialogRef<FormDetailModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { formId: number }
    ) {
        // Verificar si el usuario es admin o agent
        this.isAdmin = this.authService.currentUser?.type === 'admin';
        this.isAgent = this.authService.currentUser?.type === 'agent';

        this.statusForm = this.fb.group({
            status: ['', Validators.required],
            status_comment: ['', [Validators.required, Validators.maxLength(1000)]]
        });

        this.rejectionForm = this.fb.group({
            rejection_reason: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
        });

        // Actualizar currentStatus cuando cambie el status
        this.statusForm.get('status')?.valueChanges.subscribe(value => {
            this.currentStatus = this.statuses.find(s => s.value === value);
        });
    }

    ngOnInit(): void {
        this.loadFormData();
        this.loadHistory();
    }

    loadFormData(): void {
        this.loading = true;
        this.error = null;
        this.formService.getApplicationForm(this.data.formId).subscribe({
            next: (form) => {
                //console.log('Form data loaded:', form);
                //console.log('Form status:', form.status);
                //console.log('Form status lowercase:', form.status?.toLowerCase());
                this.form = form;
                this.documents = form.documents || [];
                this.currentStatus = this.statuses.find(s => s.value === form.status);
                //console.log('Current status:', this.currentStatus);
                this.statusForm.patchValue({
                    status: form.status,
                    status_comment: form.status_comment || ''
                });
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading form:', error);
                this.error = error.error?.message || error.error?.error || 'Error al cargar la planilla. Por favor intenta de nuevo.';
                this.loading = false;
                this.cdr.detectChanges();
                this.notificationService.error(this.error!);
            }
        });
    }

    getCurrentStatus() {
        return this.statuses.find(s => s.value === this.form?.status);
    }

    onSubmit(): void {
        if (this.statusForm.invalid) return;

        this.submitting = true;
        const formData = this.statusForm.value;

        this.formService.updateStatus(this.form.id, formData).subscribe({
            next: (response) => {
                this.submitting = false;
                this.notificationService.success('Estado actualizado exitosamente');
                setTimeout(() => {
                    this.dialogRef.close({ updated: true, form: response.form });
                });
            },
            error: (error) => {
                this.submitting = false;
                console.error('Error updating status:', error);
                const errorMsg = error.error?.message || error.error?.error || 'Error al actualizar el estado';
                this.notificationService.error(errorMsg);
            }
        });
    }

    onClose(): void {
        this.dialogRef.close();
    }

    // Ver/comparar cambios pendientes
    togglePendingChangesView(): void {
        this.viewingPendingChanges = !this.viewingPendingChanges;
    }

    // Aprobar cambios pendientes
    onApprovePendingChanges(): void {
        if (!this.form?.has_pending_changes) return;

        this.submitting = true;
        this.formService.approvePendingChanges(this.form.id).subscribe({
            next: (response) => {
                this.submitting = false;
                this.notificationService.success('Cambios aprobados y aplicados exitosamente');
                // Recargar el historial después de aprobar
                this.loadHistory();
                setTimeout(() => {
                    this.dialogRef.close({ updated: true, form: response.form });
                });
            },
            error: (error) => {
                this.submitting = false;
                console.error('Error approving changes:', error);
                const errorMsg = error.error?.message || error.error?.error || 'Error al aprobar los cambios';
                this.notificationService.error(errorMsg);
            }
        });
    }

    // Mostrar formulario de rechazo
    onShowRejectionForm(): void {
        this.showRejectionForm = true;
    }

    // Cancelar rechazo
    onCancelRejection(): void {
        this.showRejectionForm = false;
        this.rejectionForm.reset();
    }

    // Rechazar cambios pendientes
    onRejectPendingChanges(): void {
        if (this.rejectionForm.invalid || !this.form?.has_pending_changes) return;

        this.submitting = true;
        const reason = this.rejectionForm.value.rejection_reason;

        this.formService.rejectPendingChanges(this.form.id, reason).subscribe({
            next: (response) => {
                this.submitting = false;
                this.notificationService.success('Cambios rechazados exitosamente');
                // Recargar el historial después de rechazar
                this.loadHistory();
                setTimeout(() => {
                    this.dialogRef.close({ updated: true, form: response.form });
                });
            },
            error: (error) => {
                this.submitting = false;
                console.error('Error rejecting changes:', error);
                const errorMsg = error.error?.message || error.error?.error || 'Error al rechazar los cambios';
                this.notificationService.error(errorMsg);
            }
        });
    }

    // Obtener el valor del campo en cambios pendientes
    getPendingValue(field: string): any {
        return this.form?.pending_changes?.[field];
    }

    // Verificar si un campo tiene cambios pendientes
    hasPendingChange(field: string): boolean {
        if (!this.form?.has_pending_changes || !this.form?.pending_changes?.hasOwnProperty(field)) {
            return false;
        }

        const pendingValue = this.getPendingValue(field);
        let currentValue: any;

        // Si es un campo del cliente (con prefijo client_), obtener del objeto client
        if (field.startsWith('client_')) {
            const clientField = field.replace('client_', ''); // Remover prefijo
            currentValue = this.form.client ? (this.form.client as any)[clientField] : undefined;
        } else {
            // Campo de la application form
            currentValue = (this.form as any)[field];
        }

        // Normalizar valores para comparación
        const normalizePending = this.normalizeValue(pendingValue);
        const normalizeCurrent = this.normalizeValue(currentValue);

        return normalizePending !== normalizeCurrent;
    }

    // Normalizar valores para comparación (manejar números, strings, null)
    normalizeValue(value: any): any {
        // Si es null o undefined, retornar null
        if (value === null || value === undefined || value === '') {
            return null;
        }

        // Si es un número o string numérico, convertir a número y comparar
        const numValue = Number(value);
        if (!isNaN(numValue) && value !== '') {
            return numValue;
        }

        // Si es string, trim y lowercase
        if (typeof value === 'string') {
            return value.trim().toLowerCase();
        }

        return value;
    }

    // Obtener valor de un campo del form de forma segura (para acceso dinámico)
    getFormValue(field: string): any {
        if (!this.form) return undefined;

        // Si es un campo del cliente (con prefijo client_), obtener del objeto client
        if (field.startsWith('client_')) {
            const clientField = field.replace('client_', ''); // Remover prefijo
            return this.form.client ? (this.form.client as any)[clientField] : undefined;
        }

        // Campo de la application form
        return (this.form as any)[field];
    }

    // Obtener todos los cambios pendientes organizados
    getModifiedFields(): { label: string; field: string; category?: string }[] {
        if (!this.form?.has_pending_changes || !this.form?.pending_changes) {
            return [];
        }

        const changes: { label: string; field: string; category?: string }[] = [];
        const pendingChanges = this.form.pending_changes;

        // Definir mapeo de campos con sus etiquetas
        const fieldLabels: { [key: string]: { label: string; category?: string } } = {
            // Información del Cliente (campos con prefijo client_)
            'client_name': { label: 'Nombre del Cliente', category: 'client' },
            'client_email': { label: 'Email del Cliente', category: 'client' },
            'client_phone': { label: 'Teléfono del Cliente', category: 'client' },
            'client_address': { label: 'Dirección del Cliente', category: 'client' },

            // Información del Aplicante
            'applicant_name': { label: 'Nombre Completo', category: 'applicant' },
            'email': { label: 'Email', category: 'applicant' },
            'phone': { label: 'Teléfono', category: 'applicant' },
            'phone2': { label: 'Teléfono Alterno', category: 'applicant' },
            'dob': { label: 'Fecha de Nacimiento', category: 'applicant' },
            'gender': { label: 'Género', category: 'applicant' },
            'ssn': { label: 'SSN', category: 'applicant' },
            'legal_status': { label: 'Estatus Legal', category: 'applicant' },
            'document_number': { label: 'Número de Documento', category: 'applicant' },
            'address': { label: 'Dirección', category: 'applicant' },
            'unit_apt': { label: 'Unidad/Apto', category: 'applicant' },
            'city': { label: 'Ciudad', category: 'applicant' },
            'state': { label: 'Estado', category: 'applicant' },
            'zip_code': { label: 'Código Postal', category: 'applicant' },

            // Información de Empleo
            'employment_type': { label: 'Tipo de Empleo', category: 'employment' },
            'employment_company_name': { label: 'Empresa', category: 'employment' },
            'work_phone': { label: 'Teléfono del Trabajo', category: 'employment' },
            'wages': { label: 'Salario', category: 'employment' },
            'wages_frequency': { label: 'Frecuencia de Pago', category: 'employment' },

            // Información de Seguro
            'insurance_company': { label: 'Compañía de Seguro', category: 'insurance' },
            'insurance_plan': { label: 'Plan de Seguro', category: 'insurance' },
            'subsidy': { label: 'Subsidio', category: 'insurance' },
            'final_cost': { label: 'Costo de la Prima', category: 'insurance' },
            'poliza_number': { label: 'Número de Póliza', category: 'insurance' },
            'poliza_category': { label: 'Categoría Póliza', category: 'insurance' },
            'poliza_amount': { label: 'Monto Prima Dental', category: 'insurance' },
            'poliza_beneficiary': { label: 'Beneficiario', category: 'insurance' },
            'poliza_payment_day': { label: 'Día de Pago', category: 'insurance' }
        };

        // Verificar cambios en campos principales
        Object.keys(pendingChanges).forEach(field => {
            if (this.hasPendingChange(field)) {
                if (fieldLabels[field]) {
                    changes.push({
                        label: fieldLabels[field].label,
                        field,
                        category: fieldLabels[field].category
                    });
                } else if (field.startsWith('person')) {
                    // Manejar personas adicionales
                    const match = field.match(/person(\d+)_(.+)/);
                    if (match) {
                        const personNum = match[1];
                        const personField = match[2];
                        const personFieldLabels: { [key: string]: string } = {
                            'name': 'Nombre',
                            'relation': 'Relación',
                            'dob': 'Fecha de Nacimiento',
                            'gender': 'Género',
                            'ssn': 'SSN',
                            'is_applicant': 'Es Aplicante'
                        };
                        changes.push({
                            label: personFieldLabels[personField] || personField,
                            field,
                            category: `person${personNum}`
                        });
                    }
                }
            }
        });

        return changes;
    }

    // Obtener personas modificadas (números únicos)
    getModifiedPersons(): number[] {
        const modifiedFields = this.getModifiedFields();
        const persons = new Set<number>();

        modifiedFields.forEach(change => {
            if (change.category?.startsWith('person')) {
                const personNum = parseInt(change.category.replace('person', ''));
                persons.add(personNum);
            }
        });

        return Array.from(persons).sort();
    }

    formatDate(date: string | undefined): string {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatCurrency(value: number | undefined): string {
        if (!value) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    }

    hasDocuments(): boolean {
        return this.documents && this.documents.length > 0;
    }

    getDocumentIcon(document: ApplicationDocument): string {
        if (document.is_audio) {
            return 'audiotrack';
        }
        if (document.is_image) {
            return 'image';
        }
        if (document.is_pdf) {
            return 'picture_as_pdf';
        }
        return 'insert_drive_file';
    }

    getDocumentTypeLabel(document: ApplicationDocument): string {
        if (document.is_audio) {
            return 'Audio';
        }
        if (document.is_image) {
            return 'Imagen';
        }
        if (document.is_pdf) {
            return 'PDF';
        }
        if (document.document_type) {
            return document.document_type;
        }
        return document.file_type?.toUpperCase() || 'Documento';
    }

    getDocumentSize(document: ApplicationDocument): string {
        if (document.file_size_formatted) {
            return document.file_size_formatted;
        }
        if (typeof document.file_size === 'number') {
            const sizeInKb = document.file_size / 1024;
            if (sizeInKb >= 1024) {
                const sizeInMb = sizeInKb / 1024;
                return `${sizeInMb.toFixed(1)} MB`;
            }
            return `${sizeInKb.toFixed(0)} KB`;
        }
        return 'Sin tamaño';
    }

    formatDocumentDate(date: string | undefined): string {
        if (!date) {
            return 'Sin fecha';
        }
        return new Date(date).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    viewDocument(document: ApplicationDocument): void {
        if (!this.form?.id || document.is_audio) {
            return;
        }

        if (document.is_image && document.file_url) {
            window.open(document.file_url, '_blank');
            return;
        }

        const url = `${environment.apiUrl}/application-forms/${this.form.id}/documents/${document.id}/view`;
        window.open(url, '_blank');
    }

    downloadDocument(document: ApplicationDocument): void {
        if (!this.form?.id) {
            return;
        }

        const url = `${environment.apiUrl}/application-forms/${this.form.id}/documents/${document.id}/download`;
        window.open(url, '_blank');
    }

    deleteDocument(document: ApplicationDocument): void {
        if (!this.isAdmin || !this.form?.id) {
            return;
        }

        const confirmed = confirm('¿Estás seguro de que deseas eliminar este documento?');
        if (!confirmed) {
            return;
        }

        this.deletingDocumentId = document.id;
        this.formService.deleteDocument(this.form.id, document.id).subscribe({
            next: () => {
                this.notificationService.success('Documento eliminado exitosamente');
                this.documents = this.documents.filter(item => item.id !== document.id);
                this.deletingDocumentId = null;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error deleting document:', error);
                const errorMsg = error.error?.error || error.error?.message || 'Error al eliminar el documento';
                this.notificationService.error(errorMsg);
                this.deletingDocumentId = null;
                this.cdr.detectChanges();
            }
        });
    }

    hasAdditionalPersons(): boolean {
        if (!this.form) return false;
        return !!(
            (this.form as any).person1_name ||
            (this.form as any).person2_name ||
            (this.form as any).person3_name ||
            (this.form as any).person4_name ||
            (this.form as any).person5_name ||
            (this.form as any).person6_name
        );
    }

    getAdditionalPersons(): any[] {
        if (!this.form) return [];
        const persons = [];
        for (let i = 1; i <= 6; i++) {
            const person = {
                name: (this.form as any)[`person${i}_name`],
                relation: (this.form as any)[`person${i}_relation`],
                dob: (this.form as any)[`person${i}_dob`],
                gender: (this.form as any)[`person${i}_gender`],
                ssn: (this.form as any)[`person${i}_ssn`],
                is_applicant: (this.form as any)[`person${i}_is_applicant`],
                document_number: (this.form as any)[`person${i}_document_number`],
                legal_status: (this.form as any)[`person${i}_legal_status`],
                company_name: (this.form as any)[`person${i}_company_name`],
                wages: (this.form as any)[`person${i}_wages`],
                frequency: (this.form as any)[`person${i}_frequency`]
            };
            if (person.name) {
                persons.push(person);
            }
        }
        return persons;
    }

    /**
     * Cargar historial de cambios de la planilla
     */
    loadHistory(): void {
        if (!this.data.formId) return;

        this.loadingHistory = true;
        this.formService.getFormHistory(this.data.formId).subscribe({
            next: (response: any) => {
                this.history = response.history || [];
                this.loadingHistory = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading history:', error);
                this.loadingHistory = false;
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Determinar si se debe mostrar el historial (admin o agent creador)
     */
    canViewHistory(): boolean {
        if (!this.form) return false;
        return this.isAdmin || (this.isAgent && this.form.agent_id === this.authService.currentUser?.id);
    }

    /**
     * Obtener el ícono según el tipo de acción
     */
    getHistoryIcon(action: string): string {
        const icons: { [key: string]: string } = {
            'status_changed': 'swap_horiz',
            'pending_changes_proposed': 'edit',
            'pending_changes_approved': 'check_circle',
            'pending_changes_rejected': 'cancel',
            'created': 'add_circle',
            'updated': 'update'
        };
        return icons[action] || 'history';
    }

    /**
     * Obtener el título legible de la acción
     */
    getHistoryActionLabel(action: string): string {
        const labels: { [key: string]: string } = {
            'status_changed': 'Cambio de Estado',
            'pending_changes_proposed': 'Propuesta de Cambios',
            'pending_changes_approved': 'Cambios Aprobados',
            'pending_changes_rejected': 'Cambios Rechazados',
            'created': 'Planilla Creada',
            'updated': 'Actualización General'
        };
        return labels[action] || 'Acción';
    }

    /**
     * Obtener la clase CSS según el tipo de acción
     */
    getHistoryActionClass(action: string): string {
        const classes: { [key: string]: string } = {
            'status_changed': 'status-change',
            'pending_changes_proposed': 'proposed',
            'pending_changes_approved': 'approved',
            'pending_changes_rejected': 'rejected',
            'created': 'created',
            'updated': 'updated'
        };
        return classes[action] || '';
    }
}

