import { Component, OnInit, LOCALE_ID, inject } from '@angular/core';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { ApplicationFormService } from '../../../../core/services/application-form.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../../shared/components/notification-dialog/confirm-dialog.component';
import { AddClientModalComponent } from './add-client-modal/add-client-modal';

// Registrar el locale español
registerLocaleData(localeEs);

// Adaptador personalizado para español
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
        MatAutocompleteModule,
        MatDialogModule,
        AddClientModalComponent
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
    // Validador personalizado para teléfono formateado
    phoneValidator(control: any): { [key: string]: boolean } | null {
        if (!control.value) {
            return null; // Si está vacío, lo maneja Validators.required
        }
        const digits = control.value.replace(/\D/g, '');
        if (digits.length >= 10) {
            return null; // Válido si tiene 10 o más dígitos
        }
        return { 'invalidPhone': true };
    }

    // Formatea el input de teléfono en formato (###) ###-####
    formatPhone(controlName: string, form: FormGroup): void {
        const control = form.get(controlName);
        if (!control) return;
        let digits = (control.value || '').replace(/\D/g, '').substring(0, 10);
        let formatted = digits;
        if (digits.length > 6) {
            formatted = `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6, 10)}`;
        } else if (digits.length > 3) {
            formatted = `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}`;
        } else if (digits.length > 0) {
            formatted = `(${digits}`;
        }
        control.setValue(formatted, { emitEvent: false });
        control.updateValueAndValidity({ emitEvent: false });
    }
    // Estado de carga
    isLoadingClients = false;
    isSubmitting = false;

    // Clientes disponibles (sin application form)
    availableClients: Client[] = [];
    filteredClients: Client[] = [];
    selectedClient: Client | null = null;

    // Modal para agregar nuevo cliente
    showAddClientModal = false;

    // Control de personas adicionales
    selectedPersonIndex = 1; // Persona actualmente visible (1-6)
    maxPersons = 6; // Máximo de personas adicionales

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
        { value: 'Para Visa', label: 'Para Visa' },
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

    // Inyección usando inject() - mejor para SSR/hydration
    private fb = inject(FormBuilder);
    private applicationFormService = inject(ApplicationFormService);
    private userService = inject(UserService);
    private authService = inject(AuthService);
    private dialog = inject(MatDialog);
    private router = inject(Router);

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
            phone: ['', [Validators.required, this.phoneValidator.bind(this)]],
            phone2: ['', this.phoneValidator.bind(this)],
            email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
            gender: ['', Validators.required],
            ssn: ['', [Validators.maxLength(20), Validators.pattern('^[0-9]*$')]],
            legal_status: ['', [Validators.required, Validators.maxLength(100)]],
            document_number: ['', [Validators.required, Validators.maxLength(50)]]
        });

        // Paso 2: Empleo
        this.employmentForm = this.fb.group({
            employment_type: [''],
            employment_company_name: ['', Validators.maxLength(255)],
            work_phone: ['', this.phoneValidator.bind(this)],
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
            person1_ssn: ['', [Validators.maxLength(20), Validators.pattern('^[0-9]*$')]],
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
            person2_ssn: ['', [Validators.maxLength(20), Validators.pattern('^[0-9]*$')]],
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
            person3_ssn: ['', [Validators.maxLength(20), Validators.pattern('^[0-9]*$')]],
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
            person4_ssn: ['', [Validators.maxLength(20), Validators.pattern('^[0-9]*$')]],
            person4_gender: [''],
            person4_wages: [null, Validators.min(0)],
            person4_frequency: [''],

            // Persona 5
            person5_name: ['', Validators.maxLength(255)],
            person5_relation: [''],
            person5_is_applicant: [false],
            person5_legal_status: ['', Validators.maxLength(100)],
            person5_document_number: ['', Validators.maxLength(50)],
            person5_dob: [''],
            person5_company_name: ['', Validators.maxLength(255)],
            person5_ssn: ['', [Validators.maxLength(20), Validators.pattern('^[0-9]*$')]],
            person5_gender: [''],
            person5_wages: [null, Validators.min(0)],
            person5_frequency: [''],

            // Persona 6
            person6_name: ['', Validators.maxLength(255)],
            person6_relation: [''],
            person6_is_applicant: [false],
            person6_legal_status: ['', Validators.maxLength(100)],
            person6_document_number: ['', Validators.maxLength(50)],
            person6_dob: [''],
            person6_company_name: ['', Validators.maxLength(255)],
            person6_ssn: ['', [Validators.maxLength(20), Validators.pattern('^[0-9]*$')]],
            person6_gender: [''],
            person6_wages: [null, Validators.min(0)],
            person6_frequency: ['']
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

        console.log('🔍 Cargando clientes disponibles...');
        console.log('👤 Usuario actual:', currentUser);

        // Obtener todos los clientes (el backend ya filtra por agente si corresponde)
        this.userService.getUsers({ type: 'client' }).subscribe({
            next: (response: any) => {
                const allClients = response.data || response;
                console.log('📋 Total de clientes obtenidos:', allClients.length);
                console.log('📋 Clientes:', allClients);

                // Obtener IDs de clientes que ya tienen application form
                this.applicationFormService.getClientsWithForms().subscribe({
                    next: (clientsWithFormsResponse) => {
                        const clientsWithForms = clientsWithFormsResponse.client_ids || [];
                        console.log('🚫 Clientes con forms (IDs):', clientsWithForms);
                        console.log('🚫 Total de clientes con forms:', clientsWithForms.length);

                        // Mostrar solo clientes sin application form
                        // El backend ya filtró los clientes según el rol (admin ve todos, agent ve sus clientes)
                        this.availableClients = allClients.filter((client: any) => {
                            const hasForm = clientsWithForms.includes(client.id);
                            //console.log(`   Cliente ${client.id} (${client.name}): ${hasForm ? '❌ tiene form' : '✅ disponible'}`);
                            return !hasForm;
                        });

                        this.filteredClients = [...this.availableClients];
                        this.isLoadingClients = false;

                        console.log('✅ Clientes disponibles para application form:', this.availableClients.length);
                        console.log('✅ Lista final:', this.availableClients);
                    },
                    error: (error) => {
                        console.error('❌ Error al cargar clientes con application forms:', error);
                        // Si hay error, mostrar todos los clientes que el backend devolvió
                        this.availableClients = allClients;
                        this.filteredClients = [...this.availableClients];
                        this.isLoadingClients = false;
                    }
                });
            },
            error: (error) => {
                console.error('❌ Error al cargar clientes:', error);
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

        // Limpiar teléfonos (quitar formato, dejar solo dígitos)
        const phoneFields = ['phone', 'phone2', 'work_phone'];
        phoneFields.forEach(field => {
            if (formData[field]) {
                formData[field] = formData[field].replace(/\D/g, '');
            }
        });

        // Convertir fechas a formato ISO
        if (formData.dob) {
            formData.dob = this.formatDate(formData.dob);
        }
        ['person1_dob', 'person2_dob', 'person3_dob', 'person4_dob', 'person5_dob', 'person6_dob'].forEach(field => {
            if (formData[field]) {
                formData[field] = this.formatDate(formData[field]);
            }
        });

        // Enviar al backend
        this.applicationFormService.createApplicationForm(formData).subscribe({
            next: (response) => {
                console.log('✅ Planilla creada:', response);

                // Extraer el token de confirmación del backend
                const token = response.confirmation_token;
                const expiresAt = response.token_expires_at;

                // Generar el link de confirmación con el TOKEN
                const confirmationLink = `${window.location.origin}/confirm/${token}`;

                // Mostrar notificación con link
                const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                    data: {
                        title: '¡Planilla Creada Exitosamente!',
                        message: 'La planilla de aplicación ha sido generada correctamente. Comparta el siguiente link con el cliente para que confirme su información:',
                        type: 'success',
                        confirmButtonText: 'Entendido',
                        showLink: true,
                        linkUrl: confirmationLink,
                        linkLabel: 'Link de confirmación:',
                        disableBackdropClick: true
                    },
                    width: '500px',
                    disableClose: true
                });

                this.isSubmitting = false;

                // Redirigir después de cerrar el dialog
                dialogRef.afterClosed().subscribe(() => {
                    this.router.navigate(['/dashboard/agents-report']);
                });
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

    // Métodos para navegación de personas adicionales
    selectPerson(personIndex: number): void {
        if (personIndex >= 1 && personIndex <= this.maxPersons) {
            this.selectedPersonIndex = personIndex;
        }
    }

    hasPersonData(personIndex: number): boolean {
        const nameControl = this.additionalPersonsForm.get(`person${personIndex}_name`);
        return nameControl?.value?.trim().length > 0;
    }

    getPersonsArray(): number[] {
        return Array.from({ length: this.maxPersons }, (_, i) => i + 1);
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

    // Métodos para modal de agregar cliente
    openAddClientModal(): void {
        this.showAddClientModal = true;
    }

    closeAddClientModal(): void {
        this.showAddClientModal = false;
    }

    onClientCreated(newClient: any): void {
        // Agregar el nuevo cliente a la lista disponible
        this.availableClients.unshift(newClient);
        this.filteredClients = this.availableClients;

        // Seleccionar automáticamente el nuevo cliente
        this.selectClient(newClient);

        // Cerrar el modal
        this.closeAddClientModal();

        this.showSuccess('Cliente creado. Ya puede seleccionarlo para continuar con la cotización');
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
