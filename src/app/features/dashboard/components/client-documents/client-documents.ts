import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ApplicationFormService } from '../../../../core/services/application-form.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ApplicationDocument } from '../../../../core/models/application-document.interface';
import { ApplicationForm } from '../../../../core/models/application-form.interface';

@Component({
    selector: 'app-client-documents',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatDialogModule
    ],
    templateUrl: './client-documents.html',
    styleUrls: ['./client-documents.scss']
})
export class ClientDocumentsComponent implements OnInit {
    isLoading = true;
    applicationForm: ApplicationForm | null = null;
    documents: ApplicationDocument[] = [];
    selectedFile: File | null = null;
    isUploading = false;

    constructor(
        private applicationFormService: ApplicationFormService,
        private authService: AuthService,
        private dialog: MatDialog,
        private notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadDocuments();
    }

    loadDocuments(): void {
        this.isLoading = true;
        const userId = this.authService.currentUser?.id;

        if (!userId) {
            console.error('No user ID found');
            this.isLoading = false;
            return;
        }

        this.applicationFormService.getApplicationForms(1, 999, { client_id: userId }).subscribe({
            next: (response: any) => {
                //console.log('Application form loaded:', response);
                if (response.data && response.data.length > 0) {
                    this.applicationForm = response.data[0];
                    this.documents = this.applicationForm?.documents || [];
                } else {
                    this.applicationForm = null;
                    this.documents = [];
                }
                this.isLoading = false;
            },
            error: (error: any) => {
                console.error('Error loading documents:', error);
                this.isLoading = false;
                if (error.status === 404) {
                    // No application form found - this is okay
                    this.applicationForm = null;
                    this.documents = [];
                } else {
                    this.showMessage('Error al cargar los documentos', 'error');
                }
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
        if (!this.selectedFile || !this.applicationForm) {
            return;
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (this.selectedFile.size > maxSize) {
            this.showMessage('El archivo es demasiado grande. Máximo 10MB', 'error');
            this.selectedFile = null;
            return;
        }

        this.isUploading = true;

        this.applicationFormService.uploadDocument(this.applicationForm.id, this.selectedFile).subscribe({
            next: (response: any) => {
                //console.log('Document uploaded:', response);
                this.showMessage('Documento subido exitosamente', 'success');
                this.selectedFile = null;
                this.loadDocuments(); // Reload to get updated list
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
        if (!this.applicationForm) {
            return;
        }

        if (!confirm('¿Estás seguro de que deseas eliminar este documento?')) {
            return;
        }

        this.applicationFormService.deleteDocument(this.applicationForm.id, documentId).subscribe({
            next: (response: any) => {
                //console.log('Document deleted:', response);
                this.showMessage('Documento eliminado exitosamente', 'success');
                this.loadDocuments(); // Reload to get updated list
            },
            error: (error: any) => {
                console.error('Error deleting document:', error);
                this.showMessage('Error al eliminar el documento', 'error');
            }
        });
    }

    downloadDocument(document: ApplicationDocument): void {
        if (document.file_url) {
            window.open(document.file_url, '_blank');
        }
    }

    viewDocument(document: ApplicationDocument): void {
        if (document.file_url) {
            window.open(document.file_url, '_blank');
        }
    }

    getFileIcon(document: ApplicationDocument): string {
        if (document.is_image) {
            return 'image';
        } else if (document.is_pdf) {
            return 'picture_as_pdf';
        } else {
            return 'insert_drive_file';
        }
    }

    getFileTypeLabel(document: ApplicationDocument): string {
        if (document.is_image) {
            return 'Imagen';
        } else if (document.is_pdf) {
            return 'PDF';
        } else {
            return document.file_type.toUpperCase();
        }
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    private showMessage(message: string, type: 'success' | 'error'): void {
        if (type === 'success') {
            this.notificationService.success(message);
        } else {
            this.notificationService.error(message);
        }
    }
}
