import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { ApplicationFormService } from '../../../../core/services/application-form.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../../shared/components/notification-dialog/confirm-dialog.component';

// Registrar el locale español
registerLocaleData(localeEs);

import { Injectable } from '@angular/core';
// Adaptador personalizado para español
@Injectable()
export class SpanishDateAdapter extends NativeDateAdapter {
    override getFirstDayOfWeek(): number {
        return 1; // Lunes como primer día de la semana
    }

    override getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
        // Angular Material espera Domingo como primer día
        if (style === 'long') {
            return ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        }
        if (style === 'short') {
            return ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'];
        }
        // narrow
        return ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    }

    override getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
        if (style === 'long') {
            return [
                'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
            ];
        }
        if (style === 'short') {
            return [
                'ene', 'feb', 'mar', 'abr', 'may', 'jun',
                'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
            ];
        }
        // narrow
        return ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    }
}

// Formato de fecha personalizado
export const MY_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

interface Client {
    id: number;
    name: string;
    email: string;
}

@Component({
    selector: 'app-new-quote',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatStepperModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        MatAutocompleteModule
    ],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
        { provide: LOCALE_ID, useValue: 'es-ES' },
        { provide: DateAdapter, useClass: SpanishDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
    ],
    templateUrl: './new-quote.html',
    styleUrl: './new-quote.scss'
})
export class NewQuoteComponent implements OnInit {
    // Estado de carga
    isLoadingClients = false;
    isSubmitting = false;

    // Clientes disponibles (sin application form)
    availableClients: Client[] = [];
    filteredClients: Client[] = [];
    selectedClient: Client | null = null;

    // Formularios por paso
    clientSelectionForm!: FormGroup;
    applicantForm!: FormGroup;
    employmentForm!: FormGroup;
    policyForm!: FormGroup;
    additionalPersonsForm!: FormGroup;
    paymentForm!: FormGroup;

    // Estados de género y opciones
    genderOptions = [
        { value: 'M', label: 'Masculino' },
        { value: 'F', label: 'Femenino' }
    ];

    legalStatusOptions = [
        { value: 'Ciudadano', label: 'Ciudadano' },
        { value: 'Residente', label: 'Residente' },
        { value: 'Visa de Trabajo', label: 'Visa de Trabajo' },
        { value: 'Otro', label: 'Otro' }
    ];

    employmentTypeOptions = [
        { value: 'W2', label: 'W2' },
        { value: '1099', label: '1099' },
        { value: 'Other', label: 'Otro' }
    ];

    wagesFrequencyOptions = [
        { value: 'Semanal', label: 'Semanal' },
        { value: 'Quincenal', label: 'Quincenal' },
        { value: 'Mensual', label: 'Mensual' },
        { value: 'Anual', label: 'Anual' }
    ];

    relationOptions = [
        { value: 'Cónyuge', label: 'Cónyuge' },
        { value: 'Hijo/a', label: 'Hijo/a' },
        { value: 'Padre/Madre', label: 'Padre/Madre' },
        { value: 'Hermano/a', label: 'Hermano/a' },
        { value: 'Otro', label: 'Otro' }
    ];

    cardTypeOptions = [
        { value: 'Visa', label: 'Visa' },
        { value: 'Mastercard', label: 'Mastercard' },
        { value: 'American Express', label: 'American Express' },
        { value: 'Discover', label: 'Discover' }
    ];

    constructor(
        private fb: FormBuilder,
        private applicationFormService: ApplicationFormService,
        private userService: UserService,
        private authService: AuthService,
        private dialog: MatDialog,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.initializeForms();
        this.loadAvailableClients();
    }

    initializeForms(): void {
        // Paso 0: Selección de cliente
        this.clientSelectionForm = this.fb.group({
            clientSearch: ['', Validators.required],
            selectedClientId: [null, Validators.required]
        });

        // Paso 1: Datos del Aplicante
        this.applicantForm = this.fb.group({
            applicant_name: ['', [Validators.required, Validators.maxLength(255)]],
            dob: ['', Validators.required],
            address: ['', [Validators.required, Validators.maxLength(500)]],
            unit_apt: ['', Validators.maxLength(50)],
            city: ['', [Validators.required, Validators.maxLength(100)]],
            state: ['', [Validators.required, Validators.maxLength(50)]],
            zip_code: ['', [Validators.required, Validators.maxLength(20)]],
            phone: ['', [Validators.required, Validators.maxLength(20)]],
            phone2: ['', Validators.maxLength(20)],
            email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
            gender: ['', Validators.required],
            ssn: ['', [Validators.required, Validators.maxLength(20)]],
            legal_status: ['', [Validators.required, Validators.maxLength(100)]],
            document_number: ['', [Validators.required, Validators.maxLength(50)]]
        });

        // Paso 2: Empleo
        this.employmentForm = this.fb.group({
            employment_type: [''],
            employment_company_name: ['', Validators.maxLength(255)],
            work_phone: ['', Validators.maxLength(20)],
            wages: [null, Validators.min(0)],
            wages_frequency: ['']
        });

        // Paso 3: Póliza
        this.policyForm = this.fb.group({
            insurance_company: ['', Validators.maxLength(255)],
            insurance_plan: ['', Validators.maxLength(255)],
            subsidy: [null, Validators.min(0)],
            final_cost: [null, Validators.min(0)],
            poliza_number: ['', Validators.maxLength(100)],
            poliza_category: ['', Validators.maxLength(100)],
            poliza_amount: [null, Validators.min(0)],
            poliza_payment_day: [null, [Validators.min(1), Validators.max(31)]],
            poliza_beneficiary: ['', Validators.maxLength(255)]
        });

        // Paso 4: Personas Adicionales (4 personas opcionales)
        this.additionalPersonsForm = this.fb.group({
            // Persona 1
            person1_name: ['', Validators.maxLength(255)],
            person1_relation: [''],
            person1_is_applicant: [false],
            person1_legal_status: ['', Validators.maxLength(100)],
            person1_document_number: ['', Validators.maxLength(50)],
            person1_dob: [''],
            person1_company_name: ['', Validators.maxLength(255)],
            person1_ssn: ['', Validators.maxLength(20)],
            person1_gender: [''],
            person1_wages: [null, Validators.min(0)],
            person1_frequency: [''],

            // Persona 2
            person2_name: ['', Validators.maxLength(255)],
            person2_relation: [''],
            person2_is_applicant: [false],
            person2_legal_status: ['', Validators.maxLength(100)],
            person2_document_number: ['', Validators.maxLength(50)],
            person2_dob: [''],
            person2_company_name: ['', Validators.maxLength(255)],
            person2_ssn: ['', Validators.maxLength(20)],
            person2_gender: [''],
            person2_wages: [null, Validators.min(0)],
            person2_frequency: [''],

            // Persona 3
            person3_name: ['', Validators.maxLength(255)],
            person3_relation: [''],
            person3_is_applicant: [false],
            person3_legal_status: ['', Validators.maxLength(100)],
            person3_document_number: ['', Validators.maxLength(50)],
            person3_dob: [''],
            person3_company_name: ['', Validators.maxLength(255)],
            person3_ssn: ['', Validators.maxLength(20)],
            person3_gender: [''],
            person3_wages: [null, Validators.min(0)],
            person3_frequency: [''],

            // Persona 4
            person4_name: ['', Validators.maxLength(255)],
            person4_relation: [''],
            person4_is_applicant: [false],
            person4_legal_status: ['', Validators.maxLength(100)],
            person4_document_number: ['', Validators.maxLength(50)],
            person4_dob: [''],
            person4_company_name: ['', Validators.maxLength(255)],
            person4_ssn: ['', Validators.maxLength(20)],
            person4_gender: [''],
            person4_wages: [null, Validators.min(0)],
            person4_frequency: ['']
        });

        // Paso 5: Método de Pago
        this.paymentForm = this.fb.group({
            card_type: [''],
            card_number: ['', Validators.maxLength(25)],
            card_expiration: ['', Validators.maxLength(10)],
            card_cvv: ['', Validators.maxLength(5)],
            bank_name: ['', Validators.maxLength(255)],
            bank_routing: ['', Validators.maxLength(20)],
            bank_account: ['', Validators.maxLength(30)]
        });

        // Listener para búsqueda de clientes
        this.clientSelectionForm.get('clientSearch')?.valueChanges.subscribe(value => {
            this.filterClients(value);
        });
    }

    loadAvailableClients(): void {
        this.isLoadingClients = true;
        const currentUser = this.authService.currentUser;

        if (!currentUser) {
            this.showError('No se pudo obtener el usuario actual');
            this.isLoadingClients = false;
            return;
        }

        // Obtener todos los clientes
        this.userService.getUsers({ type: 'client' }).subscribe({
            next: (response: any) => {
                const allClients = response.data || response;

                // Filtrar clientes que ya tienen application form
                this.applicationFormService.getApplicationForms().subscribe({
                    next: (forms: any) => {
                        const formsData = forms.data || forms;
                        const clientsWithForms = formsData.map((f: any) => f.client_id);

                        // Si es agent, filtrar solo sus clientes sin application form
                        if (currentUser.type === 'agent') {
                            this.availableClients = allClients.filter((client: any) =>
                                !clientsWithForms.includes(client.id) &&
                                client.created_by === currentUser.id
                            );
                        } else {
                            // Admin ve todos los clientes sin application form
                            this.availableClients = allClients.filter((client: any) =>
                                !clientsWithForms.includes(client.id)
                            );
                        }

                        this.filteredClients = [...this.availableClients];
                        this.isLoadingClients = false;
                    },
                    error: (error) => {
                        console.error('Error al cargar application forms:', error);
                        // Si hay error, mostrar todos los clientes
                        this.availableClients = allClients;
                        this.filteredClients = [...this.availableClients];
                        this.isLoadingClients = false;
                    }
                });
            },
            error: (error) => {
                console.error('Error al cargar clientes:', error);
                this.showError('Error al cargar los clientes disponibles');
                this.isLoadingClients = false;
            }
        });
    }

    filterClients(searchTerm: string): void {
        if (!searchTerm || typeof searchTerm !== 'string') {
            this.filteredClients = [...this.availableClients];
            return;
        }

        const term = searchTerm.toLowerCase();
        this.filteredClients = this.availableClients.filter(client =>
            client.name.toLowerCase().includes(term) ||
            client.email.toLowerCase().includes(term)
        );
    }

    selectClient(client: Client): void {
        this.selectedClient = client;
        this.clientSelectionForm.patchValue({
            clientSearch: client.name,
            selectedClientId: client.id
        });

        // Pre-llenar algunos campos del aplicante con los datos del cliente
        this.applicantForm.patchValue({
            applicant_name: client.name,
            email: client.email
        });
    }

    clearClientSelection(): void {
        this.selectedClient = null;
        this.clientSelectionForm.reset();
        this.applicantForm.patchValue({
            applicant_name: '',
            email: ''
        });
    }

    onSubmit(): void {
        // Validar todos los formularios
        if (!this.clientSelectionForm.valid) {
            this.showError('Debe seleccionar un cliente');
            return;
        }

        if (!this.applicantForm.valid) {
            this.showError('Complete todos los campos requeridos del aplicante');
            return;
        }

        this.isSubmitting = true;

        // Combinar todos los datos
        const formData = {
            client_id: this.selectedClient?.id,
            ...this.applicantForm.value,
            ...this.employmentForm.value,
            ...this.policyForm.value,
            ...this.additionalPersonsForm.value,
            ...this.paymentForm.value,
            status: 'pendiente',
            confirmed: false
        };

        // Convertir fechas a formato ISO
        if (formData.dob) {
            formData.dob = this.formatDate(formData.dob);
        }
        ['person1_dob', 'person2_dob', 'person3_dob', 'person4_dob'].forEach(field => {
            if (formData[field]) {
                formData[field] = this.formatDate(formData[field]);
            }
        });

        // Enviar al backend
        this.applicationFormService.createApplicationForm(formData).subscribe({
            next: (response) => {
                this.showSuccess('Planilla de aplicación creada exitosamente');
                this.isSubmitting = false;
                // Redirigir a la vista de reporte de agentes o al listado
                setTimeout(() => {
                    this.router.navigate(['/dashboard/agents-report']);
                }, 1500);
            },
            error: (error) => {
                console.error('Error al crear application form:', error);
                const errorMsg = error.error?.error || error.error?.message || 'Error al crear la planilla de aplicación';
                this.showError(errorMsg);
                this.isSubmitting = false;
            }
        });
    }

    formatDate(date: any): string {
        if (date instanceof Date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return date;
    }

    showSuccess(message: string): void {
        this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: '¡Éxito!',
                message: message,
                type: 'success',
                confirmButtonText: 'Aceptar',
                autoClose: true,
                autoCloseDuration: 3000
            },
            width: '400px'
        });
    }

    showError(message: string): void {
        this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Error',
                message: message,
                type: 'error',
                confirmButtonText: 'Aceptar'
            },
            width: '400px'
        });
    }

    cancel(): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: '¿Cancelar creación?',
                message: '¿Está seguro de cancelar? Se perderán todos los datos ingresados.',
                type: 'warning',
                confirmButtonText: 'Sí, cancelar',
                cancelButtonText: 'No, continuar'
            },
            width: '400px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.router.navigate(['/dashboard/agents-report']);
            }
        });
    }
}
