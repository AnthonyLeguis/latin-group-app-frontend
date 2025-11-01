import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, DialogData } from '../../shared/components/notification-dialog/confirm-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    constructor(private dialog: MatDialog) { }

    /**
     * Muestra una notificación de éxito
     */
    success(message: string, title: string = 'Éxito', duration: number = 3000): void {
        this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title,
                message,
                type: 'success',
                confirmButtonText: 'Aceptar',
                autoClose: true,
                autoCloseDuration: duration
            } as DialogData
        });
    }

    /**
     * Muestra una notificación de error
     */
    error(message: string, title: string = 'Error', duration: number = 5000): void {
        this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title,
                message,
                type: 'error',
                confirmButtonText: 'Aceptar',
                autoClose: false
            } as DialogData
        });
    }

    /**
     * Muestra una notificación de advertencia
     */
    warning(message: string, title: string = 'Advertencia', duration: number = 4000): void {
        this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title,
                message,
                type: 'warning',
                confirmButtonText: 'Aceptar',
                autoClose: true,
                autoCloseDuration: duration
            } as DialogData
        });
    }

    /**
     * Muestra una notificación informativa
     */
    info(message: string, title: string = 'Información', duration: number = 3000): void {
        this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title,
                message,
                type: 'info',
                confirmButtonText: 'Aceptar',
                autoClose: true,
                autoCloseDuration: duration
            } as DialogData
        });
    }

    /**
     * Muestra un diálogo de confirmación
     * Retorna una promesa que resuelve true si confirma, false si cancela
     */
    confirm(message: string, title: string = 'Confirmar acción'): Promise<boolean> {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title,
                message,
                type: 'warning',
                confirmButtonText: 'Confirmar',
                cancelButtonText: 'Cancelar',
                autoClose: false
            } as DialogData
        });

        return dialogRef.afterClosed().toPromise();
    }

    /**
     * Muestra una notificación con link copiable
     */
    showWithLink(message: string, linkUrl: string, linkLabel: string = 'Ver enlace', title: string = 'Éxito'): void {
        this.dialog.open(ConfirmDialogComponent, {
            width: '500px',
            data: {
                title,
                message,
                type: 'success',
                confirmButtonText: 'Cerrar',
                autoClose: false,
                showLink: true,
                linkUrl,
                linkLabel
            } as DialogData
        });
    }
}
