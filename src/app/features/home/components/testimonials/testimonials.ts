import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SectionTitleComponent } from '../section-title/section-title.component';

interface Testimonial {
    text: string;
    name: string;
    state: string;
    image: string;
}

@Component({
    selector: 'app-testimonials',
    standalone: true,
    imports: [CommonModule, MatIconModule, SectionTitleComponent],
    templateUrl: './testimonials.html',
    styleUrl: './testimonials.scss'
})
export class TestimonialsComponent implements OnInit, OnDestroy {
    // Testimonials array
    testimonials: Testimonial[] = [
        {
            text: 'Han sido muy considerados por atenderme, pues me han tenido paciencia en mis peticiones y me han aclarado mis dudas, muy buen grupo de trabajo...',
            name: 'Maria Rodriguez',
            state: 'Dallas, TX',
            image: 'images/testimonials/maria-profile.jpg'
        },
        {
            text: 'Excelente servicio y atención personalizada. El equipo se preocupa genuinamente por resolver nuestros problemas y siempre está disponible para ayudar.',
            name: 'José Ramírez',
            state: 'Miami, FL',
            image: 'images/testimonials/jose-profile.jpg'
        },
        {
            text: 'LatinGroup App ha revolucionado la forma en que gestionamos nuestras aplicaciones. El sistema es intuitivo y nos permite procesar formularios complejos en minutos.',
            name: 'Camilo Fuentes',
            state: 'Houston, TX',
            image: 'images/testimonials/camilo-profile.jpg'
        },
        {
            text: 'El proceso de aplicación nunca había sido tan sencillo. Puedo ver el estado de mi solicitud en tiempo real y la comunicación es clara y directa.',
            name: 'Sofia Cardenales',
            state: 'Phoenix, AZ',
            image: 'images/testimonials/sofia-profile.jpg'
        }
    ];

    // Carousel properties
    allTestimonials: Testimonial[] = [];
    currentTestimonialIndex: number = 0;
    testimonialInterval: any;
    testimonialIsTransitioning: boolean = false;

    constructor(private cdr: ChangeDetectorRef) {
        // Crear array infinito para carrusel de testimonios
        // Duplicamos los primeros 3 items para loop continuo en vista lg (que muestra 3 a la vez)
        this.allTestimonials = [
            ...this.testimonials,
            ...this.testimonials.slice(0, 3)
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

            // Si llegamos al índice 4 (después del cuarto original), reseteamos a 0 sin transición para loop infinito
            if (this.currentTestimonialIndex >= this.testimonials.length) {
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
        }, 5000); // 5 segundos
    }

    nextTestimonial(): void {
        this.resetTestimonialAutoScroll();
        this.currentTestimonialIndex++;

        if (this.currentTestimonialIndex >= this.testimonials.length) {
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

    getTestimonialTranslateLg(): number {
        // Para lg+: cada slide ocupa 33.33% (3 items por fila)
        return this.currentTestimonialIndex * 33.333;
    }

    getDisplayIndexLg(): number {
        // Retorna cuál es el índice de paginación actual (0, 1 o 2)
        return this.currentTestimonialIndex % this.testimonials.length;
    }

    goToTestimonialLg(index: number): void {
        this.resetTestimonialAutoScroll();
        this.currentTestimonialIndex = index;
    }

    getTestimonialTransitionClass(): string {
        return this.testimonialIsTransitioning ? 'no-transition' : '';
    }
}
