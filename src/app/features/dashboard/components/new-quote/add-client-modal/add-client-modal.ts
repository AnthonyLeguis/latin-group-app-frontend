import { ChangeDetectorRef, Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../../../../core/services/auth.service';
import { UserService } from '../../../../../core/services/user.service';
import { FormSkeletonComponent } from '../../../../../shared/components/form-skeleton/form-skeleton';
import { ConfirmDialogComponent } from '../../../../../shared/components/notification-dialog/confirm-dialog.component';

@Component({
    selector: 'app-add-client-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatDialogModule,
        MatSelectModule,
        MatCheckboxModule,
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
    isSelfAgent = false; // Checkbox para "Yo soy el agente"

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private userService: UserService,
        private dialog: MatDialog,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        console.log('🔧 AddClientModal: Iniciando...');
        this.currentUser = this.authService.currentUser;
        this.isAdmin = this.currentUser?.type === 'admin';
        console.log('👤 Usuario actual:', this.currentUser);
        console.log('🔑 Es admin?', this.isAdmin);

        this.initForm();

        if (this.isAdmin) {
            this.loadAgents();
        } else {
            setTimeout(() => {
                console.log('✅ Formulario listo (no-admin)');
                this.isInitializing = false;
                this.cd.detectChanges();
            }, 300);
        }
    }

    initForm(): void {
        // Si isSelfAgent está marcado, no requerir agent_id
        const agentValidators = this.isAdmin && !this.isSelfAgent ? [Validators.required] : [];

        this.clientForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['latin1234*'],
            type: ['client'],
            agent_id: [this.isAdmin ? '' : this.currentUser?.id, agentValidators]
        });

        if (!this.isAdmin) {
            this.clientForm.get('agent_id')?.disable();
        }

        // Si isSelfAgent está marcado, deshabilitar y asignar el admin actual
        if (this.isSelfAgent && this.isAdmin) {
            this.clientForm.get('agent_id')?.setValue(this.currentUser?.id);
            this.clientForm.get('agent_id')?.disable();
        }
    }

    loadAgents(): void {
        console.log('📋 Cargando agentes reales desde el backend...');
        this.userService.getUsers({ type: 'agent' }).subscribe({
            next: (response) => {
                // La respuesta puede ser paginada, extraer los datos correctamente
                this.agents = response.data || response;
                console.log('✅ Agentes cargados:', this.agents);
                this.isInitializing = false;
                console.log('✅ Formulario listo (admin)');
                this.cd.detectChanges();
            },
            error: (error) => {
                console.error('❌ Error cargando agentes:', error);
                this.dialog.open(ConfirmDialogComponent, {
                    data: {
                        title: 'Error',
                        message: 'Error al cargar la lista de agentes',
                        type: 'error',
                        confirmButtonText: 'Cerrar'
                    },
                    width: '400px'
                });
                this.isInitializing = false;
                this.cd.detectChanges();
            }
        });
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

    onSelfAgentChange(checked: boolean): void {
        this.isSelfAgent = checked;
        const agentControl = this.clientForm.get('agent_id');

        if (checked) {
            // Si marca "Yo soy el agente", establecer el ID del admin actual y remover validación required
            agentControl?.setValue(this.currentUser?.id);
            agentControl?.clearValidators();
            agentControl?.disable();
        } else {
            // Si desmarca, limpiar, habilitar el select y agregar validación required
            agentControl?.setValue('');
            agentControl?.setValidators([Validators.required]);
            agentControl?.enable();
        }

        agentControl?.updateValueAndValidity();
        this.cd.detectChanges();
    }

    onCancel(): void {
        this.isSelfAgent = false;
        this.clientForm.reset();
        this.initForm();
        this.cancelModal.emit();
        setTimeout(() => this.cd.detectChanges(), 0);
    }

    onSubmit(): void {
        if (this.clientForm.invalid) {
            this.markFormGroupTouched(this.clientForm);
            this.dialog.open(ConfirmDialogComponent, {
                data: {
                    title: 'Formulario Incompleto',
                    message: 'Por favor complete todos los campos requeridos',
                    type: 'warning',
                    confirmButtonText: 'Entendido'
                },
                width: '400px'
            });
            return;
        }

        this.loading = true;
        const formData = this.clientForm.getRawValue();

        this.authService.register(formData).subscribe({
            next: (response) => {
                this.loading = false;
                this.dialog.open(ConfirmDialogComponent, {
                    data: {
                        title: '¡Éxito!',
                        message: 'Cliente creado exitosamente',
                        type: 'success',
                        confirmButtonText: 'Entendido',
                        autoClose: true,
                        autoCloseDuration: 2000
                    },
                    width: '400px'
                });

                const createdUser = (response as any)?.user ?? response;
                const emittedClient = {
                    ...createdUser,
                    agent_id: formData.agent_id || this.currentUser?.id
                };

                // Emitir evento con el nuevo cliente creado
                this.clientCreated.emit(emittedClient);

                this.isSelfAgent = false;
                this.clientForm.reset();
                this.initForm();
                setTimeout(() => this.cd.detectChanges(), 0);
            },
            error: (error) => {
                this.loading = false;
                const errorMessage = error.error?.message || error.error?.error || 'Error al crear cliente';
                this.dialog.open(ConfirmDialogComponent, {
                    data: {
                        title: 'Error',
                        message: errorMessage,
                        type: 'error',
                        confirmButtonText: 'Cerrar'
                    },
                    width: '400px'
                });
                setTimeout(() => this.cd.detectChanges(), 0);
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
