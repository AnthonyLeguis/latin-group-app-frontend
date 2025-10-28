import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { UserService } from '../../../../core/services/user.service';
import { ApplicationFormService } from '../../../../core/services/application-form.service';

interface Client {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    created_at: string;
    agent?: {
        id: number;
        name: string;
    };
    application_form?: {
        id: number;
    };
}

interface Document {
    id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    uploaded_at: string;
    file_url?: string;
    is_image?: boolean;
    is_pdf?: boolean;
    file_size_formatted?: string;
}

@Component({
    selector: 'app-edit-client-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTabsModule
    ],
    templateUrl: './edit-client-modal.html',
    styleUrls: ['./edit-client-modal.scss']
})
export class EditClientModalComponent implements OnInit {
    clientForm: FormGroup;
    isLoading = false;
    isSaving = false;
    documents: Document[] = [];
    isLoadingDocuments = true;
    isUploading = false;
    selectedFile: File | null = null;

    constructor(
        public dialogRef: MatDialogRef<EditClientModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { client: Client },
        private fb: FormBuilder,
        private userService: UserService,
        private applicationFormService: ApplicationFormService,
        private snackBar: MatSnackBar
    ) {
        this.clientForm = this.fb.group({
            name: [data.client.name, [Validators.required, Validators.minLength(3)]],
            email: [data.client.email, [Validators.required, Validators.email]],
            phone: [data.client.phone || ''],
            address: [data.client.address || '']
        });
    }

    ngOnInit(): void {
        this.loadDocuments();
    }

    loadDocuments(): void {
        if (!this.data.client.application_form) {
            this.isLoadingDocuments = false;
            return;
        }

        this.isLoadingDocuments = true;
        this.applicationFormService.getApplicationForms({ client_id: this.data.client.id }).subscribe({
            next: (response: any) => {
                if (response.data && response.data.length > 0) {
                    this.documents = response.data[0].documents || [];
                }
                this.isLoadingDocuments = false;
            },
            error: (error: any) => {
                console.error('Error loading documents:', error);
                this.isLoadingDocuments = false;
            }
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            this.uploadDocument();
        }
    }

    uploadDocument(): void {
        if (!this.selectedFile || !this.data.client.application_form) {
            this.showMessage('El cliente no tiene una planilla de aplicación', 'error');
            return;
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (this.selectedFile.size > maxSize) {
            this.showMessage('El archivo es demasiado grande. Máximo 10MB', 'error');
            this.selectedFile = null;
            return;
        }

        this.isUploading = true;

        this.applicationFormService.uploadDocument(
            this.data.client.application_form.id,
            this.selectedFile
        ).subscribe({
            next: (response: any) => {
                console.log('Document uploaded:', response);
                this.showMessage('Documento subido exitosamente', 'success');
                this.selectedFile = null;
                this.loadDocuments();
            },
            error: (error: any) => {
                console.error('Error uploading document:', error);
                this.showMessage('Error al subir el documento', 'error');
                this.isUploading = false;
                this.selectedFile = null;
            }
        });
    }

    deleteDocument(documentId: number): void {
        if (!this.data.client.application_form) {
            return;
        }

        if (!confirm('¿Estás seguro de que deseas eliminar este documento?')) {
            return;
        }

        this.applicationFormService.deleteDocument(
            this.data.client.application_form.id,
            documentId
        ).subscribe({
            next: (response: any) => {
                console.log('Document deleted:', response);
                this.showMessage('Documento eliminado exitosamente', 'success');
                this.loadDocuments();
            },
            error: (error: any) => {
                console.error('Error deleting document:', error);
                this.showMessage('Error al eliminar el documento', 'error');
            }
        });
    }

    viewDocument(document: Document): void {
        if (document.file_url) {
            window.open(document.file_url, '_blank');
        }
    }

    downloadDocument(document: Document): void {
        if (document.file_url) {
            window.open(document.file_url, '_blank');
        }
    }

    getFileIcon(document: Document): string {
        if (document.is_image) {
            return 'image';
        } else if (document.is_pdf) {
            return 'picture_as_pdf';
        } else {
            return 'insert_drive_file';
        }
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    onSave(): void {
        if (this.clientForm.invalid) {
            this.clientForm.markAllAsTouched();
            this.showMessage('Por favor, completa todos los campos requeridos', 'error');
            return;
        }

        this.isSaving = true;
        const formData = this.clientForm.value;

        this.userService.updateUser(this.data.client.id, formData).subscribe({
            next: (response) => {
                console.log('Client updated:', response);
                this.showMessage('Cliente actualizado exitosamente', 'success');
                this.dialogRef.close(true);
            },
            error: (error) => {
                console.error('Error updating client:', error);
                this.showMessage('Error al actualizar el cliente', 'error');
                this.isSaving = false;
            }
        });
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }

    private showMessage(message: string, type: 'success' | 'error'): void {
        this.snackBar.open(message, 'Cerrar', {
            duration: 4000,
            panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error',
            horizontalPosition: 'end',
            verticalPosition: 'top'
        });
    }
}
