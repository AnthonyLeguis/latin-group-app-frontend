import { Component, inject, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { ApplicationForm } from '../../../../core/models/application-form.interface';
import { ApplicationFormService } from '../../../../core/services/application-form.service';
import { FormDetailModalComponent } from '../form-detail-modal/form-detail-modal.component';
import { FormSkeletonComponent } from '../../../../shared/components/form-skeleton/form-skeleton';

@Component({
    selector: 'app-forms-list-modal',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatExpansionModule,
        FormSkeletonComponent
    ],
    templateUrl: './forms-list-modal.component.html',
    styleUrls: ['./forms-list-modal.component.scss']
})
export class FormsListModalComponent implements OnInit {
    private formService = inject(ApplicationFormService);
    private dialog = inject(MatDialog);

    private cdr = inject(ChangeDetectorRef);

    forms: ApplicationForm[] = [];
    loading = true;
    title = '';
    filterStatus = '';

    constructor(
        public dialogRef: MatDialogRef<FormsListModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { status: 'pendiente' | 'activo'; title: string }
    ) {
        this.filterStatus = data.status;
        this.title = data.title;
    }

    ngOnInit(): void {
        this.loadForms();
    }

    loadForms(): void {
        this.loading = true;
        console.log('Loading forms with status:', this.filterStatus);
        this.formService.getApplicationForms(1, 999, { status: this.filterStatus }).subscribe({
            next: (response) => {
                console.log('Forms response:', response);
                this.forms = response.data || response;
                console.log('Forms loaded:', this.forms.length);
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading forms:', error);
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    openFormDetail(formId: number): void {
        const dialogRef = this.dialog.open(FormDetailModalComponent, {
            width: '900px',
            maxWidth: '95vw',
            data: { formId },
            panelClass: 'form-detail-dialog'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result?.updated) {
                this.loadForms(); // Reload list after update
            }
        });
    }

    getStatusIcon(status: string): string {
        const icons: any = {
            'pendiente': 'schedule',
            'activo': 'check_circle',
            'inactivo': 'cancel',
            'rechazado': 'error'
        };
        return icons[status] || 'help';
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
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

    onClose(): void {
        this.dialogRef.close();
    }
}
