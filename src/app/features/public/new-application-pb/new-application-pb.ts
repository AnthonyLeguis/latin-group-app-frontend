import { Component, OnInit, LOCALE_ID, ViewChild, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { ApplicationFormService } from '../../../core/services/application-form.service';
import { UserService } from '../../../core/services/user.service';
import { ConfirmDialogComponent } from '../../../shared/components/notification-dialog/confirm-dialog.component';
import { AddClientModalComponent } from './add-client-modal/add-client-modal';
import { environment } from '../../../core/config/environment';

// Registrar el locale español
registerLocaleData(localeEs);

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
                'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
                'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
            ];
        }
        // narrow
        return ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    }

    override format(date: Date, displayFormat: string): string {
        if (displayFormat === 'MMM-DD-YYYY') {
            const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
            const month = monthNames[date.getMonth()];
            const day = String(date.getDate()).padStart(2, '0');
            const year = date.getFullYear();
            return `${month}-${day}-${year}`;
        }
        return super.format(date, displayFormat);
    }
}

// Formato de fecha personalizado
export const MY_FORMATS = {
    parse: {
        dateInput: 'MMM-DD-YYYY',
    },
    display: {
        dateInput: 'MMM-DD-YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

interface Client {
    id: number;
    name: string;
    email: string;
    agent_id?: number;
}

interface AdditionalPersonFormValue {
    name: string;
    relation: string;
    is_applicant: boolean;
    legal_status: string;
    document_number: string;
    dob: Date | null;
    company_name: string;
    ssn: string;
    gender: string;
    wages: number | null;
    frequency: string;
}

@Component({
    selector: 'app-new-application-pb',
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
    templateUrl: './new-application-pb.html',
    styleUrl: './new-application-pb.scss'
})
export class NewApplicationPbComponent implements OnInit {
    @ViewChild(MatStepper) stepper?: MatStepper;

    // Validador personalizado para teléfono formateado
    phoneValidator(control: any): { [key: string]: boolean } | null {
        // Si el valor es null, undefined, o string vacío, es válido (campo opcional)
        if (!control.value || String(control.value).trim() === '') {
            return null;
        }
        const digits = String(control.value).replace(/\D/g, '');
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

    enforceDigits(form: FormGroup, controlName: string, maxLength?: number): void {
        const control = form.get(controlName);
        if (!control) {
            return;
        }

        const rawValue = control.value ?? '';
        const digits = String(rawValue).replace(/\D/g, '');
        const limitedDigits = typeof maxLength === 'number' ? digits.slice(0, maxLength) : digits;

        control.setValue(limitedDigits, { emitEvent: false });
        control.updateValueAndValidity({ emitEvent: false });
    }

    formatCardExpiration(form: FormGroup, controlName: string): void {
        const control = form.get(controlName);
        if (!control) {
            return;
        }

        let digits = String(control.value || '').replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 3) {
            digits = `${digits.slice(0, 2)}/${digits.slice(2)}`;
        }

        control.setValue(digits, { emitEvent: false });
        control.updateValueAndValidity({ emitEvent: false });
    }
    // Estado de carga
    isLoadingClients = false;
    isLoadingAgents = false;
    isSubmitting = false;

    hasSavedDataFlag = false;

    // Agentes disponibles (para versión pública)
    agents: any[] = [];

    // Clientes disponibles (sin application form)
    availableClients: Client[] = [];
    filteredClients: Client[] = [];
    selectedClient: Client | null = null;

    // Modal para agregar nuevo cliente
    showAddClientModal = false;

    // Control de personas adicionales
    selectedPersonIndex = 1; // Persona actualmente visible (1-6)
    maxPersons = 6; // Máximo de personas adicionales

    // Control de completado de pasos opcionales
    employmentStepCompleted = false;
    policyStepCompleted = false;
    additionalPersonsStepCompleted = false;
    paymentStepCompleted = false;

    // Formularios por paso
    agentSelectionForm!: FormGroup; // ✅ CAMBIO: Ahora es para seleccionar agente
    clientSelectionForm!: FormGroup;
    applicantForm!: FormGroup;
    employmentForm!: FormGroup;
    policyForm!: FormGroup;
    additionalPersonsForm!: FormGroup;
    paymentForm!: FormGroup;
    currentAdditionalPersonGroup: FormGroup | null = null;

    private isResettingForms = false;

    // Estados de género y opciones
    genderOptions = [
        { value: 'M', label: 'Masculino' },
        { value: 'F', label: 'Femenino' }
    ];

    legalStatusOptions = [
        { value: 'Ciudadano', label: 'Ciudadano' },
        { value: 'Residente', label: 'Residente' },
        { value: 'Para Visa', label: 'Para Visa' },
        { value: 'Permiso de trabajo', label: 'Permiso de trabajo' },
        { value: 'Parole humanitario', label: 'Parole humanitario' },
        { value: 'Asilo político', label: 'Asilo político' },
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
    private dialog = inject(MatDialog);
    private router = inject(Router);
    private platformId = inject(PLATFORM_ID);
    private isBrowser = isPlatformBrowser(this.platformId);

    ngOnInit(): void {
        this.initializeForms();
        this.loadPublicAgents(); // Cargar agentes públicos
        this.loadAvailableClients(); // Cargar clientes públicos
        this.loadSavedFormData(); // Cargar datos guardados si existen
        this.setupAutoSave(); // Configurar autoguardado
    }

    initializeForms(): void {
        // Paso 0: Selección de AGENTE (obligatorio) ✅ CAMBIO
        this.agentSelectionForm = this.fb.group({
            agent_id: [null, Validators.required]  // OBLIGATORIO
        });

        // Paso 1: Selección de CLIENTE (mismo flujo que versión protegida)
        this.clientSelectionForm = this.fb.group({
            clientSearch: ['', Validators.required],
            selectedClientId: [null, Validators.required]
        });

        this.clientSelectionForm.get('clientSearch')?.valueChanges.subscribe(value => {
            this.filterClients(value);
        });

        // Paso 2: Datos del Aplicante
        this.applicantForm = this.fb.group({
            applicant_name: ['', [Validators.required, Validators.maxLength(255)]],
            dob: ['', Validators.required],
            address: ['', [Validators.required, Validators.maxLength(500)]],
            unit_apt: ['', Validators.maxLength(50)],
            city: ['', [Validators.required, Validators.maxLength(100)]],
            state: ['', [Validators.required, Validators.maxLength(50)]],
            zip_code: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
            phone: ['', [Validators.required, this.phoneValidator.bind(this)]],
            phone2: ['', this.phoneValidator.bind(this)],
            email: ['', [Validators.email, Validators.maxLength(255)]], // Email ahora opcional para clients
            gender: ['', Validators.required],
            ssn: ['', [Validators.pattern('^(?:\\d{4}|\\d{9})?$')]],
            legal_status: ['', [Validators.required, Validators.maxLength(100)]],
            document_number: ['', Validators.maxLength(50)] // Ahora opcional
        });

        // Paso 3: Empleo
        this.employmentForm = this.fb.group({
            employment_type: [''],
            employment_company_name: ['', Validators.maxLength(255)],
            work_phone: ['', this.phoneValidator.bind(this)],
            wages: [null, Validators.min(0)],
            wages_frequency: ['']
        });

        // Paso 4: Póliza
        this.policyForm = this.fb.group({
            insurance_company: ['', Validators.maxLength(255)],
            insurance_plan: ['', Validators.maxLength(255)],
            subsidy: [null, Validators.min(0)],
            final_cost: [null, Validators.min(0)],
            poliza_number: ['', Validators.maxLength(100)],
            poliza_category: ['', Validators.maxLength(100)],
            poliza_key: ['', Validators.maxLength(100)], // Nuevo campo Clave
            poliza_amount: [null, Validators.min(0)],
            poliza_payment_day: [null, [Validators.pattern('^(?:[1-9]|[12][0-9]|3[01])?$')]],
            poliza_beneficiary: ['', Validators.maxLength(255)]
        });

        // Paso 5: Personas Adicionales (hasta 6 personas opcionales)
        this.additionalPersonsForm = this.fb.group({
            persons: this.fb.array([])
        });

        const personsArray = this.getAdditionalPersonsArray();
        for (let i = 0; i < this.maxPersons; i++) {
            personsArray.push(this.createAdditionalPersonGroup());
        }

        this.currentAdditionalPersonGroup = this.getPersonGroup(this.selectedPersonIndex);

        // Paso 6: Método de Pago
        this.paymentForm = this.fb.group({
            card_type: [''],
            card_number: ['', [Validators.pattern('^(?:\\d{13,19})?$')]],
            card_expiration: ['', [Validators.pattern('^(?:(0[1-9]|1[0-2])\\/\\d{2})?$')]],
            card_cvv: ['', [Validators.pattern('^(?:\\d{3,4})?$')]],
            bank_name: ['', Validators.maxLength(255)],
            card_routing: ['', [Validators.pattern('^(?:\\d{9})?$')]],
            card_account: ['', [Validators.pattern('^(?:\\d{4,17})?$')]]
        });
    }

    // Clave para localStorage
    private readonly STORAGE_KEY = 'newQuoteFormData';

    // Cargar datos guardados del localStorage
    loadSavedFormData(): void {
        if (!this.isBrowser) return;
        this.hasSavedDataFlag = false;
        
        try {
            const savedData = localStorage.getItem(this.STORAGE_KEY);
            if (!savedData) {
                return;
            }

            const formData = JSON.parse(savedData);
            this.hasSavedDataFlag = true;

            // Restaurar selección de agente
            if (formData.agentSelection) {
                this.agentSelectionForm.patchValue(formData.agentSelection, { emitEvent: false });
            }

            // Restaurar selección de cliente
            if (formData.clientSelection) {
                this.clientSelectionForm.patchValue(formData.clientSelection, { emitEvent: false });
            }

            if (formData.selectedClient) {
                const savedClient = formData.selectedClient as Client;
                this.selectedClient = savedClient;
                this.clientSelectionForm.patchValue({
                    clientSearch: savedClient.name,
                    selectedClientId: savedClient.id
                }, { emitEvent: false });

                if (savedClient.agent_id) {
                    this.agentSelectionForm.patchValue({ agent_id: savedClient.agent_id }, { emitEvent: false });
                }

                this.applicantForm.patchValue({
                    applicant_name: savedClient.name,
                    email: savedClient.email
                }, { emitEvent: false });
            }

            // Restaurar formularios
            if (formData.applicant) {
                // Convertir la fecha de string a Date si existe
                if (formData.applicant.dob) {
                    formData.applicant.dob = new Date(formData.applicant.dob);
                }
                this.applicantForm.patchValue(formData.applicant, { emitEvent: false });
            }

            if (formData.employment) {
                this.employmentForm.patchValue(formData.employment, { emitEvent: false });
            }

            if (formData.policy) {
                this.policyForm.patchValue(formData.policy, { emitEvent: false });
            }

            if (formData.additionalPersons) {
                this.restoreAdditionalPersons(formData.additionalPersons);
            }

            if (formData.payment) {
                this.paymentForm.patchValue(formData.payment, { emitEvent: false });
            }
        } catch (error) {
            console.error('❌ Error al cargar datos guardados:', error);
            // Si hay error, limpiar el localStorage corrupto
            localStorage.removeItem(this.STORAGE_KEY);
            this.hasSavedDataFlag = false;
        }
    }

    // Configurar autoguardado en todos los formularios
    setupAutoSave(): void {
        // Autoguardar cada vez que cambie algún formulario
        const forms = [
            this.agentSelectionForm,
            this.clientSelectionForm,
            this.applicantForm,
            this.employmentForm,
            this.policyForm,
            this.additionalPersonsForm,
            this.paymentForm
        ];

        forms.forEach(form => {
            form.valueChanges.subscribe(() => {
                this.saveFormData();
            });
        });
    }

    // Guardar datos del formulario en localStorage
    saveFormData(): void {
        if (!this.isBrowser || this.isResettingForms) return;
        
        try {
            const formData = {
                agentSelection: this.agentSelectionForm.value,
                clientSelection: this.clientSelectionForm.value,
                selectedClient: this.selectedClient,
                applicant: this.applicantForm.value,
                employment: this.employmentForm.value,
                policy: this.policyForm.value,
                additionalPersons: this.getAdditionalPersonsArray().value,
                payment: this.paymentForm.value,
                timestamp: new Date().toISOString()
            };

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(formData));
            this.hasSavedDataFlag = true;
        } catch (error) {
            console.error('❌ Error al guardar datos:', error);
        }
    }

    // Limpiar datos guardados
    clearSavedFormData(): void {
        if (!this.isBrowser) return;
        localStorage.removeItem(this.STORAGE_KEY);
        this.hasSavedDataFlag = false;
    }

    // Cargar agentes públicos
    loadPublicAgents(): void {
        this.isLoadingAgents = true;
        this.applicationFormService.getPublicAgentsList().subscribe({
            next: (response: any) => {
                this.agents = response.data || [];
                this.isLoadingAgents = false;
                console.log('✅ Agentes cargados:', this.agents.length);
            },
            error: (error: any) => {
                console.error('❌ Error al cargar agentes:', error);
                this.showError('Error al cargar la lista de agentes');
                this.isLoadingAgents = false;
            }
        });
    }

    // Obtener agente seleccionado (helper para template)
    getSelectedAgent(): any {
        const agentId = this.agentSelectionForm.value.agent_id;
        return this.agents.find(a => a.id === agentId);
    }

    // Cargar clientes disponibles sin application form
    loadAvailableClients(): void {
        this.isLoadingClients = true;
        this.userService.getPublicClientsList().subscribe({
            next: (response: any) => {
                const allClients = response.data || response;
                this.availableClients = allClients;
                this.filteredClients = [...this.availableClients];
                this.isLoadingClients = false;
                console.log('✅ Clientes cargados:', this.availableClients.length);
            },
            error: (error: any) => {
                console.error('❌ Error al cargar clientes:', error);
                this.showError('Error al cargar la lista de clientes');
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
        }, { emitEvent: false });
        
        // Pre-llenar algunos campos del aplicante con los datos del cliente
        this.applicantForm.patchValue({
            applicant_name: client.name,
            email: client.email
        }, { emitEvent: false });

        if (client.agent_id) {
            this.agentSelectionForm.patchValue({ agent_id: client.agent_id }, { emitEvent: false });
        }

        this.saveFormData();
    }

    clearClientSelection(): void {
        this.selectedClient = null;
        this.clientSelectionForm.reset();
        this.applicantForm.patchValue({
            applicant_name: '',
            email: ''
        }, { emitEvent: false });

        this.saveFormData();
    }

    onSubmit(): void {
        // Validar selección de agente
        if (!this.agentSelectionForm.valid) {
            this.showError('Debe seleccionar un agente');
            return;
        }

        if (!this.clientSelectionForm.valid || !this.selectedClient) {
            this.showError('Debe seleccionar un cliente');
            return;
        }

        if (!this.applicantForm.valid) {
            this.showError('Complete todos los campos requeridos del aplicante');
            return;
        }

        this.isSubmitting = true;

        const personsArray = this.getAdditionalPersonsArray();

        // Combinar todos los datos - agent_id es obligatorio
        const formData: any = {
            agent_id: this.agentSelectionForm.value.agent_id,
            ...this.applicantForm.value,
            ...this.employmentForm.value,
            ...this.policyForm.value,
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

        const sanitizeDigits = (value: any, maxLength?: number): any => {
            if (value === null || value === undefined) {
                return value;
            }
            const digits = String(value).replace(/\D/g, '');
            return typeof maxLength === 'number' ? digits.slice(0, maxLength) : digits;
        };

        if (formData.zip_code) {
            formData.zip_code = sanitizeDigits(formData.zip_code, 5);
        }

        if (formData.ssn) {
            formData.ssn = sanitizeDigits(formData.ssn, 9);
        }

        if (formData.poliza_payment_day) {
            const dayDigits = sanitizeDigits(formData.poliza_payment_day, 2);
            formData.poliza_payment_day = dayDigits ? Number(dayDigits) : null;
        }

        ['card_number', 'card_cvv', 'card_routing', 'card_account'].forEach(field => {
            if (formData[field]) {
                const maxLengthMap: Record<string, number> = {
                    card_number: 19,
                    card_cvv: 4,
                    card_routing: 9,
                    card_account: 17
                };
                formData[field] = sanitizeDigits(formData[field], maxLengthMap[field]);
            }
        });

        if (formData.card_expiration) {
            formData.card_expiration = String(formData.card_expiration).trim();
        }

        // Convertir fechas a formato ISO
        if (formData.dob) {
            formData.dob = this.formatDate(formData.dob);
        }

        const additionalPersonsPayload = this.buildAdditionalPersonsPayload(personsArray, sanitizeDigits);
        Object.assign(formData, additionalPersonsPayload);

        // Convertir strings vacíos en null para evitar errores en el backend
        Object.keys(formData).forEach(key => {
            if (formData[key] === '' || formData[key] === undefined) {
                formData[key] = null;
            }
        });

        // Usar endpoint público
        this.applicationFormService.createPublicApplication(formData).subscribe({
            next: (response: any) => {
                console.log('✅ Planilla pública creada:', response);

                // Extraer el token de confirmación del backend
                const token = response.confirmation_token;
                const confirmationLink = response.confirmation_link || `${environment.frontendUrl}/confirm/${token}`;

                // Mostrar notificación con link y mensaje de email enviado
                const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                    data: {
                        title: '¡Planilla Creada Exitosamente!',
                        message: 'La planilla ha sido creada y el PDF completo fue enviado al agente por correo electrónico. Comparta el siguiente link con el cliente para que confirme su información:',
                        type: 'success',
                        confirmButtonText: 'Entendido',
                        showLink: true,
                        linkUrl: confirmationLink,
                        linkLabel: 'Link de confirmación para el cliente:',
                        disableBackdropClick: true
                    },
                    width: '600px',
                    disableClose: true
                });

                // Envolver en setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
                setTimeout(() => {
                    this.isSubmitting = false;
                }, 0);

                // Limpiar datos guardados del localStorage
                this.clearSavedFormData();

                // Reiniciar formulario tras cerrar el diálogo
                dialogRef.afterClosed().subscribe(() => {
                    this.resetAllForms();
                });
            },
            error: (error: any) => {
                console.error('Error al crear planilla pública:', error);
                const errorMsg = error.error?.error || error.error?.message || 'Error al crear la planilla de aplicación';
                this.showError(errorMsg);
                this.isSubmitting = false;
            }
        });
    }

    private resetAllForms(): void {
        this.isResettingForms = true;

        if (this.stepper) {
            this.stepper.reset();
        }

        this.agentSelectionForm.reset({ agent_id: null }, { emitEvent: false });
        this.clientSelectionForm.reset({ clientSearch: '', selectedClientId: null }, { emitEvent: false });
        this.selectedClient = null;
        this.filteredClients = [...this.availableClients];

        this.applicantForm.reset({
            applicant_name: '',
            dob: null,
            address: '',
            unit_apt: '',
            city: '',
            state: '',
            zip_code: '',
            phone: '',
            phone2: '',
            email: '',
            gender: '',
            ssn: '',
            legal_status: '',
            document_number: ''
        }, { emitEvent: false });

        this.employmentForm.reset({
            employment_type: '',
            employment_company_name: '',
            work_phone: '',
            wages: null,
            wages_frequency: ''
        }, { emitEvent: false });

        this.policyForm.reset({
            insurance_company: '',
            insurance_plan: '',
            subsidy: null,
            final_cost: null,
            poliza_number: '',
            poliza_category: '',
            poliza_key: '',
            poliza_amount: null,
            poliza_payment_day: null,
            poliza_beneficiary: ''
        }, { emitEvent: false });

        this.additionalPersonsForm.reset({}, { emitEvent: false });
        const personsArray = this.getAdditionalPersonsArray();
        // Re-crear el arreglo para garantizar que cada grupo conserve sus validadores
        personsArray.clear();
        for (let i = 0; i < this.maxPersons; i++) {
            personsArray.push(this.createAdditionalPersonGroup());
        }

        this.paymentForm.reset({
            card_type: '',
            card_number: '',
            card_expiration: '',
            card_cvv: '',
            bank_name: '',
            card_routing: '',
            card_account: ''
        }, { emitEvent: false });

        this.selectedPersonIndex = 1;
        this.currentAdditionalPersonGroup = this.getPersonGroup(this.selectedPersonIndex);

        this.employmentStepCompleted = false;
        this.policyStepCompleted = false;
        this.additionalPersonsStepCompleted = false;
        this.paymentStepCompleted = false;
        this.hasSavedDataFlag = false;
        this.showAddClientModal = false;

        setTimeout(() => {
            this.isResettingForms = false;
        }, 0);
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
            this.currentAdditionalPersonGroup = this.getPersonGroup(personIndex);
        }
    }

    hasPersonData(personIndex: number): boolean {
        const group = this.getPersonGroup(personIndex);
        const nameValue = group.get('name')?.value;
        return typeof nameValue === 'string' && nameValue.trim().length > 0;
    }

    getPersonsArray(): number[] {
        return Array.from({ length: this.maxPersons }, (_, i) => i + 1);
    }

    private getAdditionalPersonsArray(): FormArray {
        return this.additionalPersonsForm.get('persons') as FormArray;
    }

    private createAdditionalPersonGroup(): FormGroup {
        return this.fb.group({
            name: ['', Validators.maxLength(255)],
            relation: [''],
            is_applicant: [false],
            legal_status: ['', Validators.maxLength(100)],
            document_number: ['', Validators.maxLength(50)],
            dob: [null],
            company_name: ['', Validators.maxLength(255)],
            ssn: ['', [Validators.pattern('^(?:\\d{4}|\\d{9})?$')]],
            gender: [''],
            wages: [null, Validators.min(0)],
            frequency: ['']
        });
    }

    private getPersonGroup(index: number): FormGroup {
        const personsArray = this.getAdditionalPersonsArray();
        const group = personsArray.at(index - 1);
        if (!group) {
            throw new Error(`Person group index ${index} is out of range`);
        }
        return group as FormGroup;
    }

    private restoreAdditionalPersons(data: any): void {
        const personsArray = this.getAdditionalPersonsArray();

        if (Array.isArray(data)) {
            data.forEach((personData, idx) => {
                const group = personsArray.at(idx) as FormGroup | undefined;
                if (!group) {
                    return;
                }
                const normalized = this.normalizePersonData(personData);
                group.patchValue(normalized, { emitEvent: false });
            });
            this.currentAdditionalPersonGroup = this.getPersonGroup(this.selectedPersonIndex);
            return;
        }

        for (let i = 1; i <= this.maxPersons; i++) {
            const group = personsArray.at(i - 1) as FormGroup | undefined;
            if (!group) {
                continue;
            }

            const legacyData = {
                name: data[`person${i}_name`],
                relation: data[`person${i}_relation`],
                is_applicant: data[`person${i}_is_applicant`],
                legal_status: data[`person${i}_legal_status`],
                document_number: data[`person${i}_document_number`],
                dob: data[`person${i}_dob`],
                company_name: data[`person${i}_company_name`],
                ssn: data[`person${i}_ssn`],
                gender: data[`person${i}_gender`],
                wages: data[`person${i}_wages`],
                frequency: data[`person${i}_frequency`]
            };

            const normalized = this.normalizePersonData(legacyData);
            group.patchValue(normalized, { emitEvent: false });
        }

        this.currentAdditionalPersonGroup = this.getPersonGroup(this.selectedPersonIndex);
    }

    private normalizePersonData(raw: Partial<AdditionalPersonFormValue> | any): AdditionalPersonFormValue {
        const toStringOrEmpty = (value: any): string => (typeof value === 'string' ? value : value ?? '');
        const toBooleanOrFalse = (value: any): boolean => (typeof value === 'boolean' ? value : !!value);
        const toNumberOrNull = (value: any): number | null => {
            if (value === null || value === undefined || value === '') {
                return null;
            }
            const parsed = Number(value);
            return Number.isNaN(parsed) ? null : parsed;
        };

        let dobValue: Date | null = null;
        if (raw?.dob) {
            const parsedDate = new Date(raw.dob);
            dobValue = Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
        }

        return {
            name: toStringOrEmpty(raw?.name),
            relation: toStringOrEmpty(raw?.relation),
            is_applicant: toBooleanOrFalse(raw?.is_applicant),
            legal_status: toStringOrEmpty(raw?.legal_status),
            document_number: toStringOrEmpty(raw?.document_number),
            dob: dobValue,
            company_name: toStringOrEmpty(raw?.company_name),
            ssn: toStringOrEmpty(raw?.ssn),
            gender: toStringOrEmpty(raw?.gender),
            wages: toNumberOrNull(raw?.wages),
            frequency: toStringOrEmpty(raw?.frequency)
        };
    }

    private buildAdditionalPersonsPayload(personsArray: FormArray, sanitizeDigits: (value: any, maxLength?: number) => any): Record<string, any> {
        const payload: Record<string, any> = {};

        personsArray.controls.forEach((control, index) => {
            const personIndex = index + 1;
            const value = control.value as AdditionalPersonFormValue;

            const entries: Record<string, any> = {
                name: value.name ?? null,
                relation: value.relation ?? null,
                is_applicant: value.is_applicant ?? false,
                legal_status: value.legal_status ?? null,
                document_number: value.document_number ?? null,
                dob: value.dob ? this.formatDate(value.dob) : null,
                company_name: value.company_name ?? null,
                ssn: value.ssn ? sanitizeDigits(value.ssn, 9) : null,
                gender: value.gender ?? null,
                wages: value.wages ?? null,
                frequency: value.frequency ?? null
            };

            Object.entries(entries).forEach(([key, val]) => {
                payload[`person${personIndex}_${key}`] = val === '' ? null : val;
            });
        });

        return payload;
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
        if (!newClient) {
            return;
        }

        const client: Client = {
            id: newClient.id,
            name: newClient.name,
            email: newClient.email,
            agent_id: newClient.agent_id
        };

        // Evitar duplicados si ya existe en la lista
        this.availableClients = [client, ...this.availableClients.filter(c => c.id !== client.id)];
        this.filteredClients = [...this.availableClients];

        // Seleccionar automáticamente el nuevo cliente
        this.selectClient(client);

        // Cerrar el modal
        this.closeAddClientModal();

        this.showSuccess('Cliente creado exitosamente');
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
                // Limpiar datos guardados al cancelar
                this.clearSavedFormData();
                this.router.navigate(['/dashboard/agents-report']);
            }
        });
    }

    // Método temporal de debug para el formulario de empleo
    debugEmploymentForm(): void {
        console.log('📋 Estado del formulario de empleo:');
        console.log('Valid:', this.employmentForm.valid);
        console.log('Invalid:', this.employmentForm.invalid);
        console.log('Errors:', this.employmentForm.errors);
        console.log('Values:', this.employmentForm.value);

        // Revisar cada control individual
        Object.keys(this.employmentForm.controls).forEach(key => {
            const control = this.employmentForm.get(key);
            if (control && control.invalid) {
                console.log(`❌ Campo inválido: ${key}`, {
                    value: control.value,
                    errors: control.errors
                });
            }
        });
    }

    // Marcar steps opcionales como completados
    markEmploymentStepCompleted(): void {
        this.employmentStepCompleted = true;
    }

    markPolicyStepCompleted(): void {
        this.policyStepCompleted = true;
    }

    markAdditionalPersonsStepCompleted(): void {
        this.additionalPersonsStepCompleted = true;
    }

    markPaymentStepCompleted(): void {
        this.paymentStepCompleted = true;
    }
}
