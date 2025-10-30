import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../../../core/services/auth.service';
import { FormSkeletonComponent } from '../../../../../shared/components/form-skeleton/form-skeleton';

@Component({
    selector: 'app-add-client-modal',
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
        FormSkeletonComponent
    ],
    templateUrl: './add-client-modal.html',
    styleUrls: ['./add-client-modal.scss']
})
export class AddClientModalComponent implements OnInit {
    @Output() clientCreated = new EventEmitter<any>();
    @Output() cancelModal = new EventEmitter<void>();

    clientForm!: FormGroup;
    loading = false;
    isInitializing = true;
    isAdmin = false;
    agents: any[] = [];
    currentUser: any;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.currentUser = this.authService.currentUser;
        this.isAdmin = this.currentUser?.type === 'admin';

        this.initForm();

        if (this.isAdmin) {
            this.loadAgents();
        } else {
            setTimeout(() => {
                this.isInitializing = false;
            }, 300);
        }
    }

    initForm(): void {
        this.clientForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['latin1234*'],
            type: ['client'],
            agent_id: [this.isAdmin ? '' : this.currentUser?.id, this.isAdmin ? [Validators.required] : []]
        });

        if (!this.isAdmin) {
            this.clientForm.get('agent_id')?.disable();
        }
    }

    loadAgents(): void {
        setTimeout(() => {
            this.agents = [
                { id: 2, name: 'Agent User', email: 'agent@example.com' }
            ];
            this.isInitializing = false;
        }, 500);
    }

    onNameInput(): void {
        const control = this.clientForm.get('name');
        if (control) {
            const value = control.value as string;
            control.setValue(value.replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()), { emitEvent: false });
        }
    }

    onEmailInput(): void {
        const control = this.clientForm.get('email');
        if (control) {
            const value = control.value as string;
            control.setValue(value.toLowerCase(), { emitEvent: false });
        }
    }

    onCancel(): void {
        this.clientForm.reset();
        this.initForm();
        this.cancelModal.emit();
    }

    onSubmit(): void {
        if (this.clientForm.invalid) {
            this.markFormGroupTouched(this.clientForm);
            this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', {
                duration: 3000,
                panelClass: ['error-snackbar']
            });
            return;
        }

        this.loading = true;
        const formData = this.clientForm.getRawValue();

        this.authService.register(formData).subscribe({
            next: (response) => {
                this.loading = false;
                this.snackBar.open('Cliente creado exitosamente', 'Cerrar', {
                    duration: 3000,
                    panelClass: ['success-snackbar']
                });

                // Emitir evento con el nuevo cliente creado
                this.clientCreated.emit(response);

                this.clientForm.reset();
                this.initForm();
            },
            error: (error) => {
                this.loading = false;
                const errorMessage = error.error?.message || error.error?.error || 'Error al crear cliente';
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
        const control = this.clientForm.get(field);
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
}
