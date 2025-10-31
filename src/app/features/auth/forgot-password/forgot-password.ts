import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';
import { SpinnerGlobalComponent } from '../../../shared/components/spinner-global/spinner-global';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        SpinnerGlobalComponent
    ],
    templateUrl: './forgot-password.html',
    styleUrl: './forgot-password.scss'
})
export class ForgotPasswordComponent implements OnDestroy {
    emailForm: FormGroup;
    isLoading = false;
    errorMessage = '';
    emailSent = false;
    canResend = false;
    resendTimer = 60; // segundos
    private timerInterval: any;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService,
        private cd: ChangeDetectorRef
    ) {
        this.emailForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    ngOnDestroy(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    onSubmit(): void {
        if (this.emailForm.valid && !this.isLoading) {
            this.isLoading = true;
            this.errorMessage = '';

            const email = this.emailForm.value.email;

            //console.log('📧 Solicitando recuperación de contraseña para:', email);

            this.authService.forgotPassword(email).subscribe({
                next: (response) => {
                    //console.log('✅ Respuesta completa:', response);
                    //console.log('✅ Correo de recuperación enviado exitosamente');

                    // Asegurar que se actualiza el estado
                    setTimeout(() => {
                        this.isLoading = false;
                        this.emailSent = true;
                        this.startResendTimer();
                        this.cd.detectChanges();
                    }, 0);
                },
                error: (error) => {
                    console.error('❌ Error completo:', error);
                    console.error('❌ Error al enviar correo de recuperación');

                    setTimeout(() => {
                        this.isLoading = false;
                        this.errorMessage = error.error?.error || 'Error al enviar el correo. Intente nuevamente.';
                        this.cd.detectChanges();
                    }, 0);
                },
                complete: () => {
                    //console.log('🏁 Observable completado');
                }
            });
        }
    }

    startResendTimer(): void {
        this.canResend = false;
        this.resendTimer = 60;

        this.timerInterval = setInterval(() => {
            this.resendTimer--;
            if (this.resendTimer <= 0) {
                this.canResend = true;
                clearInterval(this.timerInterval);
            }
            this.cd.detectChanges();
        }, 1000);
    }

    onResend(): void {
        if (this.canResend && !this.isLoading) {
            this.emailSent = false;
            this.onSubmit();
        }
    }

    onBackToLogin(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.router.navigate(['/auth/login']);
    }
}
