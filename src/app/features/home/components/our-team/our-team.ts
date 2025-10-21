import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface Testimonial {
    text: string;
    name: string;
    role: string;
    image: string;
}

@Component({
    selector: 'app-our-team',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './our-team.html',
    styleUrl: './our-team.scss'
})
export class OurTeamComponent implements OnInit, OnDestroy {
    // First row - 2 team members
    firstRowMembers = [
        {
            name: 'José Colmenarez',
            license: 'Licencia: TX #12345',
            states: 'FL, TX, OH, OK, GA,VA,NC, SC, IN, IL, AZ, CO, NM, CA, TN',
            image: 'images/our-team/colmenarez_jose.png'
        },
        {
            name: 'Nayibeth Leiva',
            license: 'Licencia: FL #67890',
            states: 'FL, TX, OH, OK, GA,VA,NC, SC, IN, IL, AZ, CO, NM, CA, TN',
            image: 'images/our-team/leiva_nayibeth.png'
        }
    ];

    // Second row - Testimonials
    testimonials: Testimonial[] = [
        {
            text: 'En Latin Group Insurence estamos comprometidos con nuestros clientes a llevarlos de la mano por el mundo de los seguros, brindando un apoyo y respaldo a cada una de las situaciones de forma personalizada y empática...',
            name: 'José Colmenarez',
            role: 'Agente',
            image: 'images/our-team/colmenarez_jose.png'
        },
        {
            text: 'Años de Experiencia y altos estándares de atención nos validan para estar al servicio de nuestros clientes, nuestra misión es que te sientas seguro y protegido...',
            name: 'Nayibeth Leiva',
            role: 'Agente',
            image: 'images/our-team/leiva_nayibeth.png'
        },
        {
            text: 'Estamos seguros, que junto a nuestro apoyo sentirás la tranquilidad que mereces, damos cada día lo mejor para estar a su disposición...',
            name: 'Jhoanny C',
            role: 'Post-Venta',
            image: 'images/our-team/male-profile.png'
        }
    ];

    // Carousel properties
    allTestimonials: Testimonial[] = [];
    currentTestimonialIndex: number = 0;
    testimonialInterval: any;
    testimonialIsTransitioning: boolean = false;

    constructor(private cdr: ChangeDetectorRef) {
        // Crear array infinito para carrusel de testimonios
        this.allTestimonials = [
            ...this.testimonials,
            ...this.testimonials.slice(0, 1) // Duplicamos el primer testimonial para loop continuo
        ];
    }

    ngOnInit(): void {
        this.startTestimonialAutoScroll();
    }

    ngOnDestroy(): void {
        if (this.testimonialInterval) {
            clearInterval(this.testimonialInterval);
        }
    }

    startTestimonialAutoScroll(): void {
        this.testimonialInterval = setInterval(() => {
            this.currentTestimonialIndex++;

            // Si llegamos al final, reseteamos sin transición
            if (this.currentTestimonialIndex > this.testimonials.length) {
                setTimeout(() => {
                    this.testimonialIsTransitioning = true;
                    this.currentTestimonialIndex = 0;
                    this.cdr.markForCheck();

                    setTimeout(() => {
                        this.testimonialIsTransitioning = false;
                        this.cdr.markForCheck();
                    }, 50);
                }, 500);
            } else {
                this.cdr.markForCheck();
            }
        }, 7000); // 5 segundos
    }

    nextTestimonial(): void {
        this.resetTestimonialAutoScroll();
        this.currentTestimonialIndex++;

        if (this.currentTestimonialIndex > this.testimonials.length) {
            setTimeout(() => {
                this.testimonialIsTransitioning = true;
                this.currentTestimonialIndex = 0;
                this.cdr.markForCheck();

                setTimeout(() => {
                    this.testimonialIsTransitioning = false;
                    this.cdr.markForCheck();
                }, 50);
            }, 500);
        }
    }

    prevTestimonial(): void {
        this.resetTestimonialAutoScroll();
        this.currentTestimonialIndex--;
        if (this.currentTestimonialIndex < 0) {
            this.currentTestimonialIndex = this.testimonials.length - 1;
        }
    }

    resetTestimonialAutoScroll(): void {
        if (this.testimonialInterval) {
            clearInterval(this.testimonialInterval);
        }
        this.startTestimonialAutoScroll();
    }

    getTestimonialTranslate(): number {
        return this.currentTestimonialIndex * 100;
    }

    getTestimonialTransitionClass(): string {
        return this.testimonialIsTransitioning ? 'no-transition' : '';
    }

    teamMembers = [
        {
            icon: 'admin_panel_settings',
            iconColor: 'text-red-600',
            bgColor: 'bg-red-100',
            title: 'Administrador',
            features: [
                'Gestionar todos los usuarios',
                'Revisar y aprobar planillas',
                'Cambiar status de aplicaciones',
                'Acceso completo al sistema'
            ]
        },
        {
            icon: 'support_agent',
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-100',
            title: 'Agente',
            features: [
                'Registrar nuevos clientes',
                'Crear planillas de aplicación',
                'Confirmar y subir documentos',
                'Gestionar sus propias planillas'
            ]
        },
        {
            icon: 'person',
            iconColor: 'text-green-600',
            bgColor: 'bg-green-100',
            title: 'Cliente',
            features: [
                'Ver su propia planilla',
                'Acceso de solo lectura',
                'Información personal segura',
                'Seguimiento de status'
            ]
        }
    ];
}
