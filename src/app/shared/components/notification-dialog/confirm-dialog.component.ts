import { Component, Inject, ChangeDetectorRef, ViewRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SpinnerGlobalComponent } from '../../components/spinner-global/spinner-global';

export interface DialogData {
    title?: string;
    message?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    confirmButtonText?: string;
    cancelButtonText?: string;
    autoClose?: boolean;
    autoCloseDuration?: number; // ms
    showLink?: boolean; // Si debe mostrar un link
    linkUrl?: string; // URL del link
    linkLabel?: string; // Etiqueta para el link
    disableBackdropClick?: boolean; // Evitar cerrar al hacer click fuera
    isLoading?: boolean; // Mostrar spinner de carga
    loadingMessage?: string; // Mensaje mientras se carga
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatTooltipModule, SpinnerGlobalComponent],
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
    linkCopied = false;

    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private cdr: ChangeDetectorRef
    ) {
        // Establecer tipo por defecto si no se proporciona
        if (!data.type) {
            data.type = 'info';
        }

        // Deshabilitar cierre por backdrop si se especifica
        if (data.disableBackdropClick) {
            this.dialogRef.disableClose = true;
        }

        // Auto-cerrar solo si no tiene link y autoClose está habilitado
        if (data.autoClose && !data.showLink) {
            setTimeout(() => this.dialogRef.close(true), data.autoCloseDuration || 3000);
        }
    }

    updateView(): void {
        const viewRef = this.cdr as ViewRef;
        if (viewRef.destroyed) {
            return;
        }
        this.cdr.markForCheck();
        this.cdr.detectChanges();
    }

    getIcon(): string {
        switch (this.data.type) {
            case 'success':
                return 'check_circle';
            case 'error':
                return 'error';
            case 'warning':
                return 'warning';
            case 'info':
            default:
                return 'info';
        }
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }

    onConfirm(): void {
        this.dialogRef.close(true);
    }

    copyLink(): void {
        if (this.data.linkUrl) {
            navigator.clipboard.writeText(this.data.linkUrl).then(() => {
                this.linkCopied = true;
                setTimeout(() => {
                    this.linkCopied = false;
                }, 2000);
            }).catch(err => {
                console.error('Error al copiar el link:', err);
            });
        }
    }
}
