import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SectionTitleComponent } from '../section-title/section-title.component';
import { ContactModalService } from '../../../../core/services/contact-modal.service';

interface ServiceCard {
    id: number;
    image: string;
    title: string;
}

@Component({
    selector: 'app-services',
    standalone: true,
    imports: [CommonModule, MatIconModule, SectionTitleComponent],
    templateUrl: './services.html',
    styleUrl: './services.scss'
})
export class ServicesComponent implements OnInit, AfterViewInit, OnDestroy {
    autoZoom = false;
    @ViewChild('ctaSection', { static: false }) ctaSection!: ElementRef<HTMLDivElement>;
    private ctaObserver?: IntersectionObserver;
    isBrowser: boolean;
    serviceCards: ServiceCard[] = [
        { id: 1, image: '/images/services/01.jpg', title: 'Atención preventiva' },
        { id: 2, image: '/images/services/02.jpg', title: 'Chequeos generales' },
        { id: 3, image: '/images/services/03.jpg', title: 'Tratamiento de enfermedades crónicas' },
        { id: 4, image: '/images/services/04.jpg', title: 'Hospitalización y atención de emergencia' },
        { id: 5, image: '/images/services/05.jpg', title: 'Servicios de rehabilitación y habilitación' },
        { id: 6, image: '/images/services/06.jpg', title: 'Medicamentos recetados' },
        { id: 7, image: '/images/services/07.jpg', title: 'Servicios de laboratorio' },
        { id: 8, image: '/images/services/08.jpg', title: 'Cuidados pediátricos' },
        { id: 9, image: '/images/services/09.jpg', title: 'Exámenes médicos' },
        { id: 10, image: '/images/services/10.jpg', title: 'Atención dental' },
        { id: 11, image: '/images/services/11.jpg', title: 'Planes de visión' }
    ];

    // Array extendido para carrusel infinito (duplicamos algunas tarjetas)
    allCards: ServiceCard[] = [];
    currentIndex: number = 0;
    carouselInterval: any;
    isTransitioning: boolean = false;

    constructor(
        private cdr: ChangeDetectorRef,
        private contactModalService: ContactModalService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        // Crear array infinito: agregamos las primeras 3 al final para loop continuo
        this.allCards = [
            ...this.serviceCards,
            ...this.serviceCards.slice(0, 3) // Duplicamos las primeras 3
        ];
        this.isBrowser = isPlatformBrowser(this.platformId);
    }
    ngAfterViewInit(): void {
        if (this.isBrowser && this.ctaSection) {
            // Inicialmente oculto
            this.ctaSection.nativeElement.classList.remove('show');
            this.ctaSection.nativeElement.classList.add('fade-in-down');
            this.ctaObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.ctaSection.nativeElement.classList.add('show');
                        // Zoom automático 1s después de la animación de entrada
                        setTimeout(() => {
                            this.autoZoom = true;
                            this.cdr.markForCheck();
                            setTimeout(() => {
                                this.autoZoom = false;
                                this.cdr.markForCheck();
                            }, 800); // Duración del zoom automático
                        }, 1000);
                        this.ctaObserver?.disconnect();
                    }
                });
            }, { threshold: 0.2 });
            this.ctaObserver.observe(this.ctaSection.nativeElement);
        }
    }

    ngOnInit(): void {
        this.startAutoScroll();
    }

    ngOnDestroy(): void {
        if (this.carouselInterval) {
            clearInterval(this.carouselInterval);
        }
        if (this.ctaObserver) {
            this.ctaObserver.disconnect();
        }
    }

    startAutoScroll(): void {
        this.carouselInterval = setInterval(() => {
            this.currentIndex++;

            // Si llegamos al final (después de la card 11), reseteamos sin transición
            if (this.currentIndex > this.serviceCards.length) {
                setTimeout(() => {
                    this.isTransitioning = true;
                    this.currentIndex = 0;
                    this.cdr.markForCheck();

                    // Removemos la transición brevemente para el "salto" invisible
                    setTimeout(() => {
                        this.isTransitioning = false;
                        this.cdr.markForCheck();
                    }, 50);
                }, 500);
            } else {
                this.cdr.markForCheck();
            }
        }, 5000); // 5 segundos
    }

    nextSlide(): void {
        this.resetAutoScroll();
        this.currentIndex++;

        if (this.currentIndex > this.serviceCards.length) {
            setTimeout(() => {
                this.isTransitioning = true;
                this.currentIndex = 0;
                this.cdr.markForCheck();

                setTimeout(() => {
                    this.isTransitioning = false;
                    this.cdr.markForCheck();
                }, 50);
            }, 500);
        }
    }

    prevSlide(): void {
        this.resetAutoScroll();
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.serviceCards.length - 1;
        }
    }

    resetAutoScroll(): void {
        if (this.carouselInterval) {
            clearInterval(this.carouselInterval);
        }
        this.startAutoScroll();
    }

    // Método para calcular el ancho de desplazamiento por tarjeta según el tamaño de pantalla
    getCardWidth(): number {
        if (typeof window !== 'undefined') {
            const width = window.innerWidth;
            if (width < 768) {
                return 100; // En móvil: 1 tarjeta visible, se mueve 100% por slide
            } else if (width < 1024) {
                return 50; // En tablet: 2 tarjetas visibles, se mueve 50% por slide
            }
        }
        return 33.333; // En desktop: 3 tarjetas visibles, se mueve 33.333% por slide
    }

    // Método para obtener el índice visible (siempre entre 1 y 11)
    getDisplayIndex(): number {
        const index = this.currentIndex % this.serviceCards.length;
        return index + 1;
    }

    // Método para obtener las 3 tarjetas visibles (ya no se usa pero lo dejo por compatibilidad)
    getVisibleCards(): ServiceCard[] {
        const cards: ServiceCard[] = [];
        for (let i = 0; i < 3; i++) {
            const index = (this.currentIndex + i) % this.serviceCards.length;
            cards.push(this.serviceCards[index]);
        }
        return cards;
    }

    openContactModal(): void {
        this.contactModalService.openModal();
    }
}
