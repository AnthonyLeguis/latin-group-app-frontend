import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../../shared/components/notification-dialog/confirm-dialog.component';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatDialogModule
    ],
    templateUrl: './change-password.html',
    styleUrls: ['./change-password.scss']
})
export class ChangePasswordComponent implements OnInit {
    passwordForm!: FormGroup;
    loading = false;
    hideCurrentPassword = true;
    hideNewPassword = true;
    hideConfirmPassword = true;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.initForm();
    }

    initForm(): void {
        this.passwordForm = this.fb.group({
            current_password: ['', [Validators.required, Validators.minLength(8)]],
            new_password: ['', [Validators.required, Validators.minLength(8)]],
            new_password_confirmation: ['', [Validators.required, Validators.minLength(8)]]
        }, {
            validators: this.passwordMatchValidator
        });
    }

    // Validador personalizado para verificar que las contraseñas coincidan
    passwordMatchValidator(formGroup: FormGroup) {
        const newPassword = formGroup.get('new_password')?.value;
        const confirmPassword = formGroup.get('new_password_confirmation')?.value;

        if (newPassword !== confirmPassword) {
            formGroup.get('new_password_confirmation')?.setErrors({ mismatch: true });
            return { mismatch: true };
        }

        return null;
    }

    onSubmit(): void {
        if (this.passwordForm.invalid) {
            this.markFormGroupTouched(this.passwordForm);
            this.dialog.open(ConfirmDialogComponent, {
                data: {
                    title: 'Campos incompletos',
                    message: 'Por favor complete todos los campos correctamente antes de continuar.',
                    type: 'warning',
                    confirmButtonText: 'Entendido'
                },
                width: '400px',
                panelClass: 'custom-dialog-container'
            });
            return;
        }

        this.loading = true;
        const formData = this.passwordForm.value;

        this.authService.changePassword(formData).subscribe({
            next: (response) => {
                this.loading = false;
                this.passwordForm.reset();

                this.dialog.open(ConfirmDialogComponent, {
                    data: {
                        title: 'Contraseña actualizada',
                        message: 'Tu contraseña ha sido actualizada exitosamente. Por seguridad, has cerrado sesión en todos tus dispositivos.',
                        type: 'success',
                        confirmButtonText: 'Aceptar',
                        autoClose: true,
                        autoCloseDuration: 4000
                    },
                    width: '450px',
                    panelClass: 'custom-dialog-container'
                });
            },
            error: (error) => {
                this.loading = false;
                const errorMessage = error.error?.error || 'Error al cambiar la contraseña';

                this.dialog.open(ConfirmDialogComponent, {
                    data: {
                        title: 'Error al cambiar contraseña',
                        message: errorMessage,
                        type: 'error',
                        confirmButtonText: 'Cerrar'
                    },
                    width: '400px',
                    panelClass: 'custom-dialog-container'
                });
            }
        });
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();

            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }

    getErrorMessage(field: string): string {
        const control = this.passwordForm.get(field);

        if (control?.hasError('required')) {
            return 'Este campo es requerido';
        }

        if (control?.hasError('minlength')) {
            return 'Mínimo 8 caracteres';
        }

        if (field === 'new_password_confirmation' && control?.hasError('mismatch')) {
            return 'Las contraseñas no coinciden';
        }

        return '';
    }
}
