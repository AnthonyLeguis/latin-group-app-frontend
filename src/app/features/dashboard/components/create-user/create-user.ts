import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { AuthService } from '../../../../core/services/auth.service';
import { FormSkeletonComponent } from '../../../../shared/components/form-skeleton/form-skeleton';

@Component({
    selector: 'app-create-user',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatSnackBarModule,
        MatSelectModule,
        MatRadioModule,
        FormSkeletonComponent
    ],
    templateUrl: './create-user.html',
    styleUrls: ['./create-user.scss']
})
export class CreateUserComponent implements OnInit {
    // Transforma cada palabra a uppercase
    onNameInput(): void {
        const control = this.userForm.get('name');
        if (control) {
            const value = control.value as string;
            control.setValue(value.replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()), { emitEvent: false });
        }
    }

    // Transforma el email a minúsculas
    onEmailInput(): void {
        const control = this.userForm.get('email');
        if (control) {
            const value = control.value as string;
            control.setValue(value.toLowerCase(), { emitEvent: false });
        }
    }
    userForm!: FormGroup;
    loading = false;
    isInitializing = true; // Para mostrar skeleton durante inicialización
    currentUser: any;

    userTypes = [
        { value: 'admin', label: 'Administrador', icon: 'admin_panel_settings', description: 'Acceso completo al sistema' },
        { value: 'agent', label: 'Agente', icon: 'support_agent', description: 'Puede gestionar clientes' }
    ];

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.currentUser = this.authService.currentUser;

        // Verificar que sea admin
        if (this.currentUser?.type !== 'admin') {
            this.snackBar.open('No tiene permisos para acceder a esta sección', 'Cerrar', {
                duration: 3000,
                panelClass: ['error-snackbar']
            });
            this.router.navigate(['/dashboard']);
            return;
        }

        this.initForm();

        // Simular carga inicial (en caso de que se necesiten datos adicionales)
        setTimeout(() => {
            this.isInitializing = false;
        }, 300);
    }

    initForm(): void {
        this.userForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['latin1234*'], // Password por defecto
            type: ['agent', [Validators.required]] // Por defecto agent
        });
    }

    onSubmit(): void {
        if (this.userForm.invalid) {
            this.markFormGroupTouched(this.userForm);
            this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', {
                duration: 3000,
                panelClass: ['error-snackbar']
            });
            return;
        }

        this.loading = true;
        const formData = this.userForm.value;

        this.authService.register(formData).subscribe({
            next: (response) => {
                this.loading = false;
                const userTypeLabel = this.userTypes.find(t => t.value === formData.type)?.label;
                this.snackBar.open(`${userTypeLabel} creado exitosamente`, 'Cerrar', {
                    duration: 3000,
                    panelClass: ['success-snackbar']
                });
                this.userForm.reset();
                this.initForm(); // Reiniciar form con valores por defecto
            },
            error: (error) => {
                this.loading = false;
                const errorMessage = error.error?.message || error.error?.error || 'Error al crear usuario';
                this.snackBar.open(errorMessage, 'Cerrar', {
                    duration: 5000,
                    panelClass: ['error-snackbar']
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
        const control = this.userForm.get(field);
        if (control?.hasError('required')) {
            return 'Este campo es requerido';
        }
        if (control?.hasError('email')) {
            return 'Email inválido';
        }
        if (control?.hasError('minlength')) {
            return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
        }
        return '';
    }

    getSelectedUserType() {
        const selectedType = this.userForm.get('type')?.value;
        return this.userTypes.find(t => t.value === selectedType);
    }
}
