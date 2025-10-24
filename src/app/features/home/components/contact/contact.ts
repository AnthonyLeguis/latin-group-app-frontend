import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { environment } from '../../../../core/config/environment';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxIntlTelInputModule, CountryISO, SearchCountryField, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { SectionTitleComponent } from '../section-title/section-title.component';
import { ContactModalService } from '../../../../core/services/contact-modal.service';
import { ContactService } from '../../../../core/services/contact.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, DialogData } from '../../../../shared/components/notification-dialog/confirm-dialog.component';

declare const grecaptcha: any;

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NgxIntlTelInputModule, SectionTitleComponent],
    styleUrls: ['./contact.scss'],
    templateUrl: './contact.html',
})
export class ContactComponent implements OnInit, OnDestroy {
    recaptchaSiteKey = environment.recaptchaSiteKey;
    contactForm: FormGroup;
    modalForm: FormGroup;
    isModalOpen = false;
    private modalSubscription?: Subscription;
    preferredCountries = [CountryISO.UnitedStates, CountryISO.Mexico, CountryISO.Canada, CountryISO.Spain, CountryISO.Argentina, CountryISO.Colombia];
    CountryISO = CountryISO;
    SearchCountryField = SearchCountryField;
    PhoneNumberFormat = PhoneNumberFormat;

    constructor(
        private fb: FormBuilder,
        private contactModalService: ContactModalService,
        private contactService: ContactService,
        private dialog: MatDialog,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.contactForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            phone: [undefined, [Validators.required]],
            zipCode: ['', [Validators.required, Validators.minLength(3)]],
            serviceMedical: [false],
            serviceDental: [false],
            serviceAccidents: [false],
            serviceLife: [false],
            acceptSms: [false],
        });

        // Crear el formulario del modal con la misma estructura
        this.modalForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            phone: [undefined, [Validators.required]],
            zipCode: ['', [Validators.required, Validators.minLength(3)]],
            serviceMedical: [false],
            serviceDental: [false],
            serviceAccidents: [false],
            serviceLife: [false],
            acceptSms: [false],
        });
    }

    ngOnInit(): void {
        // Suscribirse al estado del modal
        this.modalSubscription = this.contactModalService.isOpen$.subscribe(
            (isOpen) => {
                this.isModalOpen = isOpen;
                // Solo manipular el DOM si estamos en el navegador
                if (isPlatformBrowser(this.platformId)) {
                    if (isOpen) {
                        // Prevenir scroll del body cuando el modal está abierto
                        document.body.style.overflow = 'hidden';
                    } else {
                        document.body.style.overflow = 'auto';
                    }
                }
            }
        );
    }

    ngOnDestroy(): void {
        // Limpiar la suscripción
        if (this.modalSubscription) {
            this.modalSubscription.unsubscribe();
        }
        // Restaurar scroll del body solo si estamos en el navegador
        if (isPlatformBrowser(this.platformId)) {
            document.body.style.overflow = 'auto';
        }
    }

    closeModal(): void {
        this.contactModalService.closeModal();
    }

    onSubmit() {
        if (this.contactForm.valid) {
            if (typeof grecaptcha !== 'undefined' && grecaptcha.enterprise) {
                grecaptcha.enterprise.ready(() => {
                    grecaptcha.enterprise.execute(this.recaptchaSiteKey, { action: 'submit_contact' }).then((token: string) => {
                        const phoneValue = this.contactForm.get('phone')?.value;
                        const phoneString = phoneValue && typeof phoneValue === 'object' && phoneValue.number
                            ? phoneValue.number
                            : phoneValue?.toString() || '';

                        const formData = {
                            ...this.contactForm.value,
                            phone: phoneString,
                            recaptcha_token: token
                        };
                        this.contactService.sendContactForm(formData).subscribe({
                            next: (response) => {
                                //console.log('Respuesta exitosa del backend:', response);
                                this.dialog.open(ConfirmDialogComponent, {
                                    data: {
                                        type: 'success',
                                        title: '¡Mensaje enviado!',
                                        message: 'Tu mensaje fue enviado correctamente. Nos pondremos en contacto contigo pronto.',
                                        autoClose: true,
                                        autoCloseDuration: 3000
                                    } as DialogData
                                });
                                this.contactForm.reset();
                            },
                            error: (err) => {
                                console.error('Error del backend al enviar contacto:', err);
                                this.dialog.open(ConfirmDialogComponent, {
                                    data: {
                                        type: 'error',
                                        title: 'Error',
                                        message: 'Hubo un problema al enviar tu mensaje. Por favor, intenta de nuevo.',
                                        cancelButtonText: 'Cerrar'
                                    } as DialogData
                                });
                            }
                        });
                    });
                });
            } else {
                console.error('reCAPTCHA Enterprise no está disponible');
            }
        }
    }

    onModalSubmit() {
        if (this.modalForm.valid) {
            if (typeof grecaptcha !== 'undefined' && grecaptcha.enterprise) {
                grecaptcha.enterprise.ready(() => {
                    grecaptcha.enterprise.execute(this.recaptchaSiteKey, { action: 'submit_contact' }).then((token: string) => {
                        const phoneValue = this.modalForm.get('phone')?.value;
                        const phoneString = phoneValue && typeof phoneValue === 'object' && phoneValue.number
                            ? phoneValue.number
                            : phoneValue?.toString() || '';

                        const formData = {
                            ...this.modalForm.value,
                            phone: phoneString,
                            recaptcha_token: token
                        };
                        this.contactService.sendContactForm(formData).subscribe({
                            next: (response) => {
                                console.log('Respuesta exitosa del backend (modal):', response);
                                this.dialog.open(ConfirmDialogComponent, {
                                    data: {
                                        type: 'success',
                                        title: '¡Mensaje enviado!',
                                        message: 'Tu mensaje fue enviado correctamente. Nos pondremos en contacto contigo pronto.',
                                        autoClose: true,
                                        autoCloseDuration: 3000
                                    } as DialogData
                                });
                                this.modalForm.reset();
                                this.closeModal();
                            },
                            error: (err) => {
                                console.error('Error del backend al enviar contacto (modal):', err);
                                this.dialog.open(ConfirmDialogComponent, {
                                    data: {
                                        type: 'error',
                                        title: 'Error',
                                        message: 'Hubo un problema al enviar tu mensaje. Por favor, intenta de nuevo.',
                                        cancelButtonText: 'Cerrar'
                                    } as DialogData
                                });
                            }
                        });
                    });
                });
            } else {
                console.error('reCAPTCHA Enterprise no está disponible');
            }
        }
    }
}
