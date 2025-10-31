import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';
import { SpinnerGlobalComponent } from '../../../shared/components/spinner-global/spinner-global';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        SpinnerGlobalComponent
    ],
    templateUrl: './reset-password.html',
    styleUrl: './reset-password.scss'
})
export class ResetPasswordComponent implements OnInit {
    resetForm: FormGroup;
    isLoading = false;
    errorMessage = '';
    passwordReset = false;
    showPassword = false;
    showConfirmPassword = false;
    token: string = '';
    email: string = '';
    passwordStrength: number = 0;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService,
        private cd: ChangeDetectorRef
    ) {
        this.resetForm = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(8)]],
            password_confirmation: ['', [Validators.required]]
        }, {
            validators: this.passwordMatchValidator
        });

        // Calcular fortaleza de contraseña en tiempo real
        this.resetForm.get('password')?.valueChanges.subscribe(password => {
            this.passwordStrength = this.calculatePasswordStrength(password);
        });
    }

    ngOnInit(): void {
        // Obtener token y email de los query params
        this.route.queryParams.subscribe(params => {
            this.token = params['token'] || '';
            this.email = params['email'] || '';

            //console.log('🔑 Token recibido:', this.token);
            //console.log('📧 Email recibido:', this.email);

            if (!this.token || !this.email) {
                console.error('❌ Faltan parámetros en la URL');
                this.errorMessage = 'Enlace inválido. Por favor solicita uno nuevo.';
            }
        });
    }

    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password');
        const confirmPassword = control.get('password_confirmation');

        if (!password || !confirmPassword) {
            return null;
        }

        if (confirmPassword.value === '') {
            return null;
        }

        if (password.value !== confirmPassword.value) {
            confirmPassword.setErrors({ matching: true });
            return { matching: true };
        } else {
            const errors = confirmPassword.errors;
            if (errors) {
                delete errors['matching'];
                confirmPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
            }
            return null;
        }
    }

    calculatePasswordStrength(password: string): number {
        if (!password) return 0;

        let strength = 0;

        // Longitud
        if (password.length >= 8) strength++;

        // Letras y números
        if (/[a-zA-Z]/.test(password) && /\d/.test(password)) strength++;

        // Mayúsculas y minúsculas o caracteres especiales
        if ((/[a-z]/.test(password) && /[A-Z]/.test(password)) || /[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

        return strength;
    }

    getPasswordStrengthText(): string {
        switch (this.passwordStrength) {
            case 1: return 'Débil';
            case 2: return 'Media';
            case 3: return 'Fuerte';
            default: return 'Muy débil';
        }
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility(): void {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    onSubmit(): void {
        if (this.resetForm.valid && this.token && this.email && !this.isLoading) {
            this.isLoading = true;
            this.errorMessage = '';

            const resetData = {
                email: this.email,
                token: this.token,
                password: this.resetForm.value.password,
                password_confirmation: this.resetForm.value.password_confirmation
            };

            //console.log('🔐 Restableciendo contraseña...');
            //console.log('📧 Email:', this.email);
            //console.log('🔑 Token length:', this.token.length);

            this.authService.resetPassword(resetData).subscribe({
                next: (response) => {
                    //console.log('✅ Respuesta completa:', response);
                    //console.log('✅ Contraseña restablecida exitosamente');

                    // Asegurar que se actualiza el estado
                    setTimeout(() => {
                        this.isLoading = false;
                        this.passwordReset = true;
                        this.cd.detectChanges();
                    }, 0);
                },
                error: (error) => {
                    console.error('❌ Error completo:', error);
                    console.error('❌ Status:', error.status);
                    console.error('❌ Error message:', error.error?.error);

                    setTimeout(() => {
                        this.isLoading = false;
                        this.errorMessage = error.error?.error || 'Error al restablecer la contraseña. Intente nuevamente.';
                        this.cd.detectChanges();
                    }, 0);
                },
                complete: () => {
                    //console.log('🏁 Observable completado');
                }
            });
        } else {
            console.warn('⚠️ Formulario inválido o falta información:', {
                formValid: this.resetForm.valid,
                hasToken: !!this.token,
                hasEmail: !!this.email,
                isLoading: this.isLoading
            });
        }
    }

    onGoToLogin(): void {
        this.router.navigate(['/auth/login']);
    }

    onBackToLogin(): void {
        this.router.navigate(['/auth/login']);
    }
}
