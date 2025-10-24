import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DialogData {
    title?: string;
    message?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    confirmButtonText?: string;
    cancelButtonText?: string;
    autoClose?: boolean;
    autoCloseDuration?: number; // ms
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        // Establecer tipo por defecto si no se proporciona
        if (!data.type) {
            data.type = 'info';
        }

        if (data.autoClose) {
            setTimeout(() => this.dialogRef.close(true), data.autoCloseDuration || 3000);
        }
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
}
