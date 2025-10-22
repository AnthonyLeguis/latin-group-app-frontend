import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxIntlTelInputModule, CountryISO, SearchCountryField, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { ContactModalService } from '../../../../core/services/contact-modal.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NgxIntlTelInputModule],
    styleUrls: ['./contact.scss'],
    templateUrl: './contact.html',
})
export class ContactComponent implements OnInit, OnDestroy {
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
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.contactForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required]],
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
            phone: ['', [Validators.required]],
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
            const formData = this.contactForm.value;
            console.log('Form Data:', formData);
            alert('Mensaje enviado correctamente');
            this.contactForm.reset();
        }
    }

    onModalSubmit() {
        if (this.modalForm.valid) {
            const formData = this.modalForm.value;
            console.log('Modal Form Data:', formData);
            alert('Mensaje enviado correctamente');
            this.modalForm.reset();
            this.closeModal();
        }
    }
}
