import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApplicationFormService } from '../../../../core/services/application-form.service';
import { finalize } from 'rxjs/operators';

export interface TokenAuthorizationData {
    formId: number;
    clientName: string;
    confirmationToken: string;
    tokenExpiresAt: string;
    confirmed: boolean;
}

@Component({
    selector: 'app-token-authorization-modal',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatTooltipModule
    ],
    templateUrl: './token-authorization-modal.component.html',
    styleUrls: ['./token-authorization-modal.component.scss']
})
export class TokenAuthorizationModalComponent implements OnInit {
    confirmationLink = '';
    isRenewing = false;
    linkCopied = false;
    isTokenExpired = false;
    daysRemaining = 0;

    constructor(
        public dialogRef: MatDialogRef<TokenAuthorizationModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: TokenAuthorizationData,
        private formService: ApplicationFormService,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.updateConfirmationLink();
        this.calculateExpiration();
    }

    private updateConfirmationLink(): void {
        this.confirmationLink = `${window.location.origin}/confirm/${this.data.confirmationToken}`;
    }

    private calculateExpiration(): void {
        if (!this.data.tokenExpiresAt) {
            this.isTokenExpired = true;
            return;
        }

        const expiresAt = new Date(this.data.tokenExpiresAt);
        const now = new Date();
        const diffTime = expiresAt.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        this.daysRemaining = diffDays;
        this.isTokenExpired = diffDays <= 0;
    }

    copyLink(): void {
        navigator.clipboard.writeText(this.confirmationLink).then(() => {
            this.linkCopied = true;
            setTimeout(() => {
                this.linkCopied = false;
            }, 2000);
        }).catch(err => {
            console.error('Error al copiar el link:', err);
        });
    }

    renewToken(): void {
        this.isRenewing = true;

        this.formService
            .renewToken(this.data.formId)
            .pipe(finalize(() => {
                this.isRenewing = false;
                this.triggerChangeDetection();
            }))
            .subscribe({
                next: (response) => {
                    console.log('✅ Token renovado:', response);

                    // Actualizar datos locales
                    this.data.confirmationToken = response.token;
                    this.data.tokenExpiresAt = response.expires_at;

                    // Recalcular expiración y link
                    this.updateConfirmationLink();
                    this.calculateExpiration();

                    this.triggerChangeDetection();
                },
                error: (error) => {
                    console.error('❌ Error al renovar token:', error);

                    // Mostrar mensaje de error
                    alert(error.error?.error || 'Error al renovar el token');

                    this.triggerChangeDetection();
                }
            });
    }

    private triggerChangeDetection(): void {
        setTimeout(() => this.cd.detectChanges(), 0);
    }

    onClose(): void {
        this.dialogRef.close();
    }

    formatDate(dateString: string): string {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getExpirationClass(): string {
        if (this.isTokenExpired) return 'expired';
        if (this.daysRemaining <= 1) return 'expiring-soon';
        return 'valid';
    }

    getExpirationIcon(): string {
        if (this.isTokenExpired) return 'error';
        if (this.daysRemaining <= 1) return 'warning';
        return 'check_circle';
    }

    getExpirationMessage(): string {
        if (this.data.confirmed) {
            return 'Planilla confirmada por el cliente';
        }
        if (this.isTokenExpired) {
            return 'Token expirado - Debe renovarse';
        }
        if (this.daysRemaining === 0) {
            return 'Expira hoy';
        }
        if (this.daysRemaining === 1) {
            return 'Expira mañana';
        }
        return `Expira en ${this.daysRemaining} días`;
    }
}
