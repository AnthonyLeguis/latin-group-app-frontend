import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApplicationForm } from '../../../../core/models/application-form.interface';
import { ApplicationFormService } from '../../../../core/services/application-form.service';
import { FormSkeletonComponent } from '../../../../shared/components/form-skeleton/form-skeleton';

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
        MatSnackBarModule,
        FormSkeletonComponent
    ],
    templateUrl: './form-detail-modal.component.html',
    styleUrls: ['./form-detail-modal.component.scss']
})
export class FormDetailModalComponent implements OnInit {
    private fb = inject(FormBuilder);
    private formService = inject(ApplicationFormService);
    private snackBar = inject(MatSnackBar);

    form!: ApplicationForm;
    statusForm: FormGroup;
    loading = true;
    submitting = false;
    error: string | null = null;

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
        this.statusForm = this.fb.group({
            status: ['', Validators.required],
            status_comment: ['', [Validators.required, Validators.maxLength(1000)]]
        });
    }

    ngOnInit(): void {
        // Cargar datos después de que la vista se inicialice
        setTimeout(() => {
            this.loadFormData();
        }, 0);
    }

    loadFormData(): void {
        this.loading = true;
        this.error = null;
        this.formService.getApplicationForm(this.data.formId).subscribe({
            next: (form) => {
                console.log('Form data loaded:', form);
                this.form = form;
                this.statusForm.patchValue({
                    status: form.status,
                    status_comment: form.status_comment || ''
                });
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading form:', error);
                this.error = error.error?.message || error.error?.error || 'Error al cargar la planilla. Por favor intenta de nuevo.';
                this.loading = false;
                this.snackBar.open(this.error!, 'Cerrar', {
                    duration: 5000,
                    panelClass: ['error-snackbar']
                });
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
                this.snackBar.open('Estado actualizado exitosamente', 'Cerrar', {
                    duration: 3000,
                    panelClass: ['success-snackbar']
                });
                this.dialogRef.close({ updated: true, form: response.form });
            },
            error: (error) => {
                console.error('Error updating status:', error);
                const errorMsg = error.error?.message || error.error?.error || 'Error al actualizar el estado';
                this.snackBar.open(errorMsg, 'Cerrar', {
                    duration: 5000,
                    panelClass: ['error-snackbar']
                });
                this.submitting = false;
            }
        });
    }

    onClose(): void {
        this.dialogRef.close();
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
}
