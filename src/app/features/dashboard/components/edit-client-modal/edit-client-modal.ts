import { Component, Inject, OnInit, ChangeDetectorRef, AfterViewInit, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Injectable } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { ApplicationFormService } from '../../../../core/services/application-form.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ApplicationDocument } from '../../../../core/models/application-document.interface';
import localeEs from '@angular/common/locales/es';

// Registrar locale español
registerLocaleData(localeEs);

// Adaptador de fecha personalizado para español
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
    phone?: string;
    address?: string;
    created_at: string;
    agent?: {
        id: number;
        name: string;
    };
    application_form?: ApplicationForm;
}

interface ApplicationForm {
    // Firma de índice para permitir acceso dinámico
    [key: string]: any;

    id: number;
    status: string;
    applicant_name?: string;
    email?: string;
    phone?: string;
    phone2?: string;
    dob?: string;
    gender?: string;
    ssn?: string;
    legal_status?: string;
    document_number?: string;
    address?: string;
    unit_apt?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    employment_type?: string;
    employment_company_name?: string;
    work_phone?: string;
    wages?: number;
    wages_frequency?: string;
    insurance_company?: string;
    insurance_plan?: string;
    subsidy?: number;
    final_cost?: number;
    poliza_number?: string;
    poliza_category?: string;
    poliza_amount?: number;
    poliza_beneficiary?: string;
    poliza_payment_day?: string;
    // Personas adicionales (6 máximo)
    person1_name?: string;
    person1_relation?: string;
    person1_dob?: string;
    person1_gender?: string;
    person1_ssn?: string;
    person1_legal_status?: string;
    person1_is_applicant?: boolean;
    person2_name?: string;
    person2_relation?: string;
    person2_dob?: string;
    person2_gender?: string;
    person2_ssn?: string;
    person2_legal_status?: string;
    person2_is_applicant?: boolean;
    person3_name?: string;
    person3_relation?: string;
    person3_dob?: string;
    person3_gender?: string;
    person3_ssn?: string;
    person3_legal_status?: string;
    person3_is_applicant?: boolean;
    person4_name?: string;
    person4_relation?: string;
    person4_dob?: string;
    person4_gender?: string;
    person4_ssn?: string;
    person4_legal_status?: string;
    person4_is_applicant?: boolean;
    person5_name?: string;
    person5_relation?: string;
    person5_dob?: string;
    person5_gender?: string;
    person5_ssn?: string;
    person5_legal_status?: string;
    person5_is_applicant?: boolean;
    person6_name?: string;
    person6_relation?: string;
    person6_dob?: string;
    person6_gender?: string;
    person6_ssn?: string;
    person6_legal_status?: string;
    person6_is_applicant?: boolean;
}

// Adaptador personalizado para formato de fecha MMM-DD-YYYY
export class CustomDateAdapter extends NativeDateAdapter {
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
export const CUSTOM_DATE_FORMATS = {
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

@Component({
    selector: 'app-edit-client-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatCheckboxModule
    ],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
        { provide: LOCALE_ID, useValue: 'es-ES' },
        { provide: DateAdapter, useClass: SpanishDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
    ],
    templateUrl: './edit-client-modal.html',
    styleUrls: ['./edit-client-modal.scss']
})
export class EditClientModalComponent implements OnInit, AfterViewInit {
    clientForm!: FormGroup;
    applicationForm!: FormGroup;
    isLoading = false;
    isSaving = false;
    documents: ApplicationDocument[] = [];
    isLoadingDocuments = true;
    isUploading = false;
    selectedFile: File | null = null;
    isAdmin = false;
    hasApplicationForm = false;
    selectedPersonIndex = 1;

    // Opciones para campos de personas adicionales
    genderOptions = [
        { value: 'M', label: 'Masculino' },
        { value: 'F', label: 'Femenino' }
    ];

    relationOptions = [
        { value: 'Cónyuge', label: 'Cónyuge' },
        { value: 'Hijo/a', label: 'Hijo/a' },
        { value: 'Padre/Madre', label: 'Padre/Madre' },
        { value: 'Hermano/a', label: 'Hermano/a' },
        { value: 'Otro', label: 'Otro' }
    ];

    legalStatusOptions = [
        { value: 'Ciudadano', label: 'Ciudadano' },
        { value: 'Residente Permanente', label: 'Residente Permanente' },
        { value: 'Visa de Trabajo', label: 'Visa de Trabajo' },
        { value: 'Visa de Estudiante', label: 'Visa de Estudiante' },
        { value: 'Otro', label: 'Otro' }
    ];

    constructor(
        public dialogRef: MatDialogRef<EditClientModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { client: Client },
        private fb: FormBuilder,
        private userService: UserService,
        private applicationFormService: ApplicationFormService,
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef,
        private authService: AuthService
    ) {
        // No inicializar el formulario aquí, esperar a ngOnInit
        // Verificar si el usuario es admin
        this.isAdmin = this.authService.currentUser?.type === 'admin';
    }

    ngOnInit(): void {
        //console.log('🔍 Cliente recibido en modal:', this.data?.client);
        //console.log('📋 Application form:', this.data?.client?.application_form);

        // Verificar si tiene application form
        this.hasApplicationForm = !!(this.data?.client?.application_form?.id);

        // Inicializar el formulario aquí, después de que data esté disponible
        if (this.data && this.data.client) {
            this.clientForm = this.fb.group({
                name: [this.data.client.name, [Validators.required, Validators.minLength(3)]],
                email: [this.data.client.email, [Validators.required, Validators.email]],
                phone: [this.data.client.phone || ''],
                address: [this.data.client.address || '']
            });

            // Inicializar formulario de application form si existe
            if (this.hasApplicationForm) {
                this.initializeApplicationForm();
            }
        }
    }

    ngAfterViewInit(): void {
        if (!this.hasApplicationForm) {
            setTimeout(() => {
                this.isLoadingDocuments = false;
            });
            return;
        }

        // Defer la carga para evitar NG0100 en el primer ciclo
        setTimeout(() => {
            this.loadDocuments();
        });
    }

    initializeApplicationForm(): void {
        const appForm = this.data.client.application_form;

        this.applicationForm = this.fb.group({
            // Información del Aplicante
            applicant_name: [appForm?.applicant_name || ''],
            email: [appForm?.email || ''],
            phone: [appForm?.phone || ''],
            phone2: [appForm?.phone2 || ''],
            dob: [appForm?.dob || ''],
            gender: [appForm?.gender || ''],
            ssn: [appForm?.ssn || ''],
            legal_status: [appForm?.legal_status || ''],
            document_number: [appForm?.document_number || ''],
            address: [appForm?.address || ''],
            unit_apt: [appForm?.unit_apt || ''],
            city: [appForm?.city || ''],
            state: [appForm?.state || ''],
            zip_code: [appForm?.zip_code || ''],

            // Información de Empleo
            employment_type: [appForm?.employment_type || ''],
            employment_company_name: [appForm?.employment_company_name || ''],
            work_phone: [appForm?.work_phone || ''],
            wages: [appForm?.wages || null],
            wages_frequency: [appForm?.wages_frequency || ''],

            // Información de Seguro y Póliza
            insurance_company: [appForm?.insurance_company || ''],
            insurance_plan: [appForm?.insurance_plan || ''],
            subsidy: [appForm?.subsidy || null],
            final_cost: [appForm?.final_cost || null],
            poliza_number: [appForm?.poliza_number || ''],
            poliza_category: [appForm?.poliza_category || ''],
            poliza_amount: [appForm?.poliza_amount || null],
            poliza_beneficiary: [appForm?.poliza_beneficiary || ''],
            poliza_payment_day: [appForm?.poliza_payment_day || ''],

            // Personas Adicionales (6 máximo)
            person1_name: [appForm?.person1_name || ''],
            person1_relation: [appForm?.person1_relation || ''],
            person1_dob: [appForm?.person1_dob || ''],
            person1_gender: [appForm?.person1_gender || ''],
            person1_ssn: [appForm?.person1_ssn || ''],
            person1_legal_status: [appForm?.person1_legal_status || ''],
            person1_is_applicant: [appForm?.person1_is_applicant || false],

            person2_name: [appForm?.person2_name || ''],
            person2_relation: [appForm?.person2_relation || ''],
            person2_dob: [appForm?.person2_dob || ''],
            person2_gender: [appForm?.person2_gender || ''],
            person2_ssn: [appForm?.person2_ssn || ''],
            person2_legal_status: [appForm?.person2_legal_status || ''],
            person2_is_applicant: [appForm?.person2_is_applicant || false],

            person3_name: [appForm?.person3_name || ''],
            person3_relation: [appForm?.person3_relation || ''],
            person3_dob: [appForm?.person3_dob || ''],
            person3_gender: [appForm?.person3_gender || ''],
            person3_ssn: [appForm?.person3_ssn || ''],
            person3_legal_status: [appForm?.person3_legal_status || ''],
            person3_is_applicant: [appForm?.person3_is_applicant || false],

            person4_name: [appForm?.person4_name || ''],
            person4_relation: [appForm?.person4_relation || ''],
            person4_dob: [appForm?.person4_dob || ''],
            person4_gender: [appForm?.person4_gender || ''],
            person4_ssn: [appForm?.person4_ssn || ''],
            person4_legal_status: [appForm?.person4_legal_status || ''],
            person4_is_applicant: [appForm?.person4_is_applicant || false],

            person5_name: [appForm?.person5_name || ''],
            person5_relation: [appForm?.person5_relation || ''],
            person5_dob: [appForm?.person5_dob || ''],
            person5_gender: [appForm?.person5_gender || ''],
            person5_ssn: [appForm?.person5_ssn || ''],
            person5_legal_status: [appForm?.person5_legal_status || ''],
            person5_is_applicant: [appForm?.person5_is_applicant || false],

            person6_name: [appForm?.person6_name || ''],
            person6_relation: [appForm?.person6_relation || ''],
            person6_dob: [appForm?.person6_dob || ''],
            person6_gender: [appForm?.person6_gender || ''],
            person6_ssn: [appForm?.person6_ssn || ''],
            person6_legal_status: [appForm?.person6_legal_status || ''],
            person6_is_applicant: [appForm?.person6_is_applicant || false]
        });
    }

    loadDocuments(): void {
        // Verificar si el cliente tiene application_form
        const hasApplicationForm = this.data?.client?.application_form && this.data.client.application_form.id;

        //console.log('🔍 Has application form?', hasApplicationForm);

        if (!hasApplicationForm) {
            //console.log('⚠️ Cliente no tiene application form');
            this.isLoadingDocuments = false;
            return;
        }

        this.isLoadingDocuments = true;
        //console.log('📥 Cargando documentos y datos completos para application_form_id:', this.data.client.application_form!.id);

        // Cargar la application form completa con todos sus datos
        this.applicationFormService.getApplicationForm(this.data.client.application_form!.id).subscribe({
            next: (response: any) => {
                if (response) {
                    this.data.client.application_form = response;
                    this.documents = response.documents || [];

                    if (this.hasApplicationForm) {
                        this.initializeApplicationForm();
                    }
                }

                this.isLoadingDocuments = false;
                this.cdr.markForCheck();
            },
            error: (error: any) => {
                console.error('❌ Error loading application form:', error);
                this.isLoadingDocuments = false;
                this.cdr.markForCheck();
            }
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            this.uploadDocument();
        }
    }

    uploadDocument(): void {
        if (!this.selectedFile || !this.data?.client?.application_form) {
            this.showMessage('El cliente no tiene una planilla de aplicación', 'error');
            return;
        }

        // console.log('📤 Subiendo archivo:', {
        //     name: this.selectedFile.name,
        //     size: this.selectedFile.size,
        //     type: this.selectedFile.type
        // });

        // Validar tipo de archivo primero
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'audio/mpeg', 'audio/mp3', 'audio/x-ms-wma'];
        const fileType = this.selectedFile.type.toLowerCase();
        const fileExtension = this.selectedFile.name.split('.').pop()?.toLowerCase();

        const isValidType = allowedTypes.includes(fileType) ||
            ['jpg', 'jpeg', 'png', 'pdf', 'mp3', 'wma'].includes(fileExtension || '');

        if (!isValidType) {
            this.showMessage('Tipo de archivo no permitido. Solo: PDF, JPG, PNG, MP3, WMA', 'error');
            this.selectedFile = null;
            return;
        }

        // Determinar si es audio
        const isAudio = fileType.startsWith('audio/') || ['mp3', 'wma'].includes(fileExtension || '');

        // Validar tamaño según tipo de archivo
        const maxSize = isAudio ? 15 * 1024 * 1024 : 5 * 1024 * 1024; // 15MB para audio, 5MB para otros
        const maxSizeLabel = isAudio ? '15MB' : '5MB';

        // console.log('✅ Validación:', {
        //     isAudio,
        //     maxSize,
        //     maxSizeLabel,
        //     fileSizeOK: this.selectedFile.size <= maxSize
        // });

        if (this.selectedFile.size > maxSize) {
            this.showMessage(`El archivo es demasiado grande. Máximo ${maxSizeLabel}`, 'error');
            this.selectedFile = null;
            return;
        }

        this.isUploading = true;

        this.applicationFormService.uploadDocument(
            this.data.client.application_form.id,
            this.selectedFile
        ).subscribe({
            next: (response: any) => {
                //console.log('✅ Document uploaded:', response);
                this.showMessage('Documento subido exitosamente', 'success');
                const reloadDocs = () => {
                    this.loadDocuments();
                };
                this.deferUploadReset(true, reloadDocs);
            },
            error: (error: any) => {
                console.error('❌ Error uploading document:', error);
                console.error('❌ Error details:', error.error);
                const errorMsg = error.error?.error || error.error?.message || 'Error al subir el documento';
                this.showMessage(errorMsg, 'error');
                this.deferUploadReset(false);
            }
        });
    }

    private deferUploadReset(reloadDocuments: boolean, afterReset?: () => void): void {
        setTimeout(() => {
            this.isUploading = false;
            this.selectedFile = null;
            if (reloadDocuments && afterReset) {
                afterReset();
            }
        });
    }

    deleteDocument(documentId: number): void {
        if (!this.data?.client?.application_form) {
            return;
        }

        if (!confirm('¿Estás seguro de que deseas eliminar este documento?')) {
            return;
        }

        this.applicationFormService.deleteDocument(
            this.data.client.application_form.id,
            documentId
        ).subscribe({
            next: (response: any) => {
                //console.log('Document deleted:', response);
                this.showMessage('Documento eliminado exitosamente', 'success');
                this.loadDocuments();
            },
            error: (error: any) => {
                console.error('Error deleting document:', error);
                this.showMessage('Error al eliminar el documento', 'error');
            }
        });
    }

    viewDocument(document: ApplicationDocument): void {
        if (!this.data?.client?.application_form) {
            return;
        }

        const previewUrl = document.file_url;
        if (!previewUrl) {
            this.showMessage('No se pudo obtener la URL del documento', 'error');
            return;
        }

        window.open(previewUrl, '_blank');
    }

    downloadDocument(document: ApplicationDocument): void {
        if (!this.data?.client?.application_form) {
            return;
        }

        this.applicationFormService.downloadDocument(
            this.data.client.application_form.id,
            document.id
        ).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = window.document.createElement('a');
                link.href = url;
                link.download = document.original_name || document.file_name;
                window.document.body.appendChild(link);
                link.click();
                window.document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                this.showMessage('Documento descargado exitosamente', 'success');
            },
            error: (error: any) => {
                console.error('❌ Error descargando documento:', error);
                const errorMsg = error.error?.error || error.error?.message || 'Error al descargar el documento';
                this.showMessage(errorMsg, 'error');
            }
        });
    }

    getFileIcon(document: ApplicationDocument): string {
        if (document.is_audio) {
            return 'audiotrack';
        } else if (document.is_image) {
            return 'image';
        } else if (document.is_pdf) {
            return 'picture_as_pdf';
        } else {
            return 'insert_drive_file';
        }
    }

    onSave(): void {
        // Validar formulario de cliente si tiene cambios
        const hasClientChanges = this.clientForm && this.clientForm.dirty;
        const hasApplicationChanges = this.applicationForm && this.applicationForm.dirty && this.hasApplicationForm;

        if (!hasClientChanges && !hasApplicationChanges) {
            this.showMessage('No hay cambios para guardar', 'error');
            return;
        }

        // Validar formularios que tienen cambios
        if (hasClientChanges && this.clientForm.invalid) {
            this.clientForm.markAllAsTouched();
            this.showMessage('Por favor, completa correctamente los campos del cliente', 'error');
            return;
        }

        if (hasApplicationChanges && this.applicationForm.invalid) {
            this.applicationForm.markAllAsTouched();
            this.showMessage('Por favor, completa correctamente los campos de la planilla', 'error');
            return;
        }

        this.isSaving = true;
        this.cdr.detectChanges();

        let savedCount = 0;
        let totalToSave = 0;
        let requiresApproval = false;

        // Si es agent, TODOS los cambios (client + application) van como pending_changes
        // Si es admin, los cambios de client van directo, los de application dependen del status
        if (this.isAdmin) {
            if (hasClientChanges) totalToSave++;
            if (hasApplicationChanges) totalToSave++;
        } else {
            // Agent: combinar ambos cambios en una sola actualización de application form
            totalToSave = 1;
        }

        const checkCompletion = () => {
            savedCount++;
            if (savedCount === totalToSave) {
                setTimeout(() => {
                    this.isSaving = false;
                    if (requiresApproval) {
                        this.showMessage('Cambios guardados. Pendientes de aprobación del administrador', 'success');
                    } else {
                        this.showMessage('Cambios guardados exitosamente', 'success');
                    }
                    this.dialogRef.close(true);
                    this.cdr.detectChanges();
                });
            }
        };

        // LÓGICA PARA ADMIN
        if (this.isAdmin) {
            // Admin: guardar cambios del cliente directamente
            if (hasClientChanges) {
                const clientData = this.clientForm.value;
                this.userService.updateUser(this.data?.client?.id, clientData).subscribe({
                    next: (response) => {
                        checkCompletion();
                    },
                    error: (error) => {
                        console.error('❌ Error actualizando cliente:', error);
                        setTimeout(() => {
                            this.isSaving = false;
                            this.showMessage('Error al actualizar el cliente', 'error');
                            this.cdr.detectChanges();
                        });
                    }
                });
            }

            // Admin: guardar cambios de la planilla (puede ser directo o pending según status)
            if (hasApplicationChanges) {
                const formData = this.applicationForm.value;
                const applicationFormId = this.data.client.application_form!.id;

                this.applicationFormService.updateForm(applicationFormId, formData).subscribe({
                    next: (response: any) => {
                        if (response.requires_approval) {
                            requiresApproval = true;
                        }
                        checkCompletion();
                    },
                    error: (error) => {
                        console.error('❌ Error actualizando application form:', error);
                        const errorMsg = error.error?.error || error.error?.message || 'Error al actualizar la planilla';
                        setTimeout(() => {
                            this.isSaving = false;
                            this.showMessage(errorMsg, 'error');
                            this.cdr.detectChanges();
                        });
                    }
                });
            }
        }
        // LÓGICA PARA AGENT
        else {
            // Agent necesita que el cliente tenga una application form
            if (!this.hasApplicationForm) {
                this.isSaving = false;
                this.showMessage('Este cliente no tiene una planilla asociada. No se pueden guardar cambios.', 'error');
                return;
            }

            const applicationFormStatus = this.data.client.application_form?.status?.toLowerCase();
            const isActive = applicationFormStatus === 'activo';

            // Si la planilla está ACTIVA, todo va como pending_changes con prefijos client_
            if (isActive) {
                // Agent: combinar TODOS los cambios (client + application) en pending_changes
                const combinedData: any = {};

                // Incluir cambios del cliente si hay (con prefijo client_)
                if (hasClientChanges) {
                    const clientData = this.clientForm.value;
                    if (clientData.name !== undefined) combinedData.client_name = clientData.name;
                    if (clientData.email !== undefined) combinedData.client_email = clientData.email;
                    if (clientData.phone !== undefined) combinedData.client_phone = clientData.phone;
                    if (clientData.address !== undefined) combinedData.client_address = clientData.address;
                }

                // Incluir cambios de la planilla si hay
                if (hasApplicationChanges) {
                    Object.assign(combinedData, this.applicationForm.value);
                }

                const applicationFormId = this.data.client.application_form!.id;

                this.applicationFormService.updateForm(applicationFormId, combinedData).subscribe({
                    next: (response: any) => {
                        requiresApproval = true; // Planilla activa requiere aprobación
                        checkCompletion();
                    },
                    error: (error) => {
                        console.error('❌ Error guardando cambios:', error);
                        const errorMsg = error.error?.error || error.error?.message || 'Error al guardar los cambios';
                        setTimeout(() => {
                            this.isSaving = false;
                            this.showMessage(errorMsg, 'error');
                            this.cdr.detectChanges();
                        });
                    }
                });
            }
            // Si la planilla NO está activa, el agent puede modificar directamente (como admin)
            else {
                totalToSave = 0;
                if (hasClientChanges) totalToSave++;
                if (hasApplicationChanges) totalToSave++;

                // Guardar cambios del cliente directamente
                if (hasClientChanges) {
                    const clientData = this.clientForm.value;
                    this.userService.updateUser(this.data?.client?.id, clientData).subscribe({
                        next: (response) => {
                            checkCompletion();
                        },
                        error: (error) => {
                            console.error('❌ Error actualizando cliente:', error);
                            setTimeout(() => {
                                this.isSaving = false;
                                this.showMessage('Error al actualizar el cliente', 'error');
                                this.cdr.detectChanges();
                            });
                        }
                    });
                }

                // Guardar cambios de la planilla directamente
                if (hasApplicationChanges) {
                    const formData = this.applicationForm.value;
                    const applicationFormId = this.data.client.application_form!.id;

                    this.applicationFormService.updateForm(applicationFormId, formData).subscribe({
                        next: (response: any) => {
                            checkCompletion();
                        },
                        error: (error) => {
                            console.error('❌ Error actualizando application form:', error);
                            const errorMsg = error.error?.error || error.error?.message || 'Error al actualizar la planilla';
                            setTimeout(() => {
                                this.isSaving = false;
                                this.showMessage(errorMsg, 'error');
                                this.cdr.detectChanges();
                            });
                        }
                    });
                }
            }
        }
    }

    formatCurrency(value: number | null | undefined): string {
        if (value === null || value === undefined) {
            return 'N/A';
        }
        // Mostrar el valor numérico sin formato de moneda para mantener consistencia con el input
        return value.toString();
    }

    formatDate(dateString: string | null | undefined): string {
        if (!dateString) {
            return 'N/A';
        }

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'N/A';
            }

            const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
            const month = monthNames[date.getMonth()];
            const day = String(date.getDate()).padStart(2, '0');
            const year = date.getFullYear();

            return `${month}-${day}-${year}`;
        } catch (error) {
            return 'N/A';
        }
    }

    // Métodos para navegación de personas adicionales
    getPersonsArray(): number[] {
        return [1, 2, 3, 4, 5, 6];
    }

    selectPerson(personNum: number): void {
        this.selectedPersonIndex = personNum;
    }

    hasPersonData(personNum: number): boolean {
        if (!this.applicationForm) {
            return false;
        }

        const personName = this.applicationForm.get(`person${personNum}_name`)?.value;
        const personRelation = this.applicationForm.get(`person${personNum}_relation`)?.value;
        const personDob = this.applicationForm.get(`person${personNum}_dob`)?.value;
        const personGender = this.applicationForm.get(`person${personNum}_gender`)?.value;
        const personSsn = this.applicationForm.get(`person${personNum}_ssn`)?.value;

        return !!(personName || personRelation || personDob || personGender || personSsn);
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }

    private showMessage(message: string, type: 'success' | 'error'): void {
        if (type === 'success') {
            this.notificationService.success(message);
        } else {
            this.notificationService.error(message);
        }
    }
}
