import { Component, EventEmitter, Output, AfterViewInit, ViewChildren, QueryList, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { InfoModalComponent, CardInfo } from './components/info-modal/info-modal';
import { SectionTitleComponent } from '../section-title/section-title.component';


@Component({
    selector: 'app-obamacare',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatDialogModule, SectionTitleComponent],
    templateUrl: './obamacare.html',
    styleUrl: './obamacare.scss'
})
export class ObamacareComponent implements AfterViewInit {
    @Output()
    scrollToSection = new EventEmitter<string>();

    @ViewChildren('obamacareCard') cards!: QueryList<ElementRef>;

    constructor(private dialog: MatDialog, @Inject(PLATFORM_ID) private platformId: Object) { }

    ngAfterViewInit() {
        if (isPlatformBrowser(this.platformId)) {
            // Pequeño delay para asegurar que Angular ha renderizado todo
            setTimeout(() => {
                if (this.cards && this.cards.length > 0) {
                    const observer = new (window as any).IntersectionObserver((entries: any) => {
                        entries.forEach((entry: any) => {
                            if (entry.isIntersecting) {
                                entry.target.classList.add('fade-in-up');
                                observer.unobserve(entry.target);
                            }
                        });
                    }, { threshold: 0.2 });

                    this.cards.forEach(card => {
                        observer.observe(card.nativeElement);
                    });
                } else {
                    console.warn('Obamacare cards not found');
                }
            }, 100);
        }
    } openInfoModal(cardType: string) {
        const data = this.getCardData(cardType);
        this.dialog.open(InfoModalComponent, {
            data,
            width: '600px',
            maxWidth: '90vw'
        });
    }

    private getCardData(type: string): CardInfo {
        const cardData: { [key: string]: CardInfo } = {
            'card1': {
                title: '¿Qué es Obamacare?',
                image: 'images/oba-1.png',
                content: `
                    <p>Además, la ACA amplía Medicaid, un programa estatal-federal que proporciona atención médica a personas con bajos ingresos. Se espera que estos cambios aumenten significativamente el número de estadounidenses asegurados.</p>
                    <p>Sin embargo, el Obamacare ha sido objeto de controversia política desde su promulgación. Muchos republicanos lo han criticado y han tratado de revocarlo, argumentando que es caro e ineficaz. La administración actual ha eliminado algunos aspectos clave del Obamacare y ha intentado desmantelarla completamente.</p>
                `
            },
            'card2': {
                title: 'Ventajas Del Obamacare',
                image: 'images/oba-2.png',
                content: `
                    <div class="advantages-grid">
                        <div class="advantage-card">
                            <span class="check-icon">✓</span>
                            <p>Las compañías aseguradoras no pueden aumentar las primas después de que el paciente se enferme</p>
                        </div>
                        <div class="advantage-card">
                            <span class="check-icon">✓</span>
                            <p>Se eliminan los límites anuales sobre la cobertura médica</p>
                        </div>
                        <div class="advantage-card">
                            <span class="check-icon">✓</span>
                            <p>Los hijos pueden ser agregados a los planes médicos de sus padres hasta los 26 años</p>
                        </div>
                        <div class="advantage-card">
                            <span class="check-icon">✓</span>
                            <p>Se prohíbe negar cobertura por condiciones pre-existentes</p>
                        </div>
                    </div>
                    <h3 class="disadvantages-title">Desventajas del Obamacare</h3>
                    <div class="disadvantages-list">
                        <p>• Aproximadamente 30 millones de usuarios compran seguro de salud privado actualmente</p>
                        <p>• El incumplimiento con los 10 beneficios de salud ha llevado a cancelar muchos planes</p>
                        <p>• Servicios innecesarios como maternidad encarecen los costos de reemplazo</p>
                        <p>• 3-5 millones de personas podrían perder planes patrocinados por empresas</p>
                        <p>• Muchas empresas prefieren pagar multas en lugar de mantener cobertura</p>
                        <p>• El aumento de cobertura puede incrementar costos generales de salud</p>
                        <p>• Quienes no pagan seguro deben pagar un impuesto (con excepciones)</p>
                        <p>• Cerca de 4 millones de personas pagan el impuesto en lugar de comprar seguro</p>
                    </div>
                `
            },
            'card3': {
                title: 'Requisitos para Obamacare 2023',
                image: 'images/oba-3.png',
                content: `
                    <div class="requirements-content">
                        <div class="requirement-item">
                            <h4 class="requirement-heading">Tener un estatus migratorio Legal es requisito para Obamacare</h4>
                            <p>La Ley de Obama establece entre los requisitos para calificar para Obamacare que las personas tengan estatus legal en el país. Ciudadanos, residentes permanentes o personas con un número de seguro social, califican.</p>
                            <p>En otras palabras, si usted no tiene un Social Security, no califica para seguro médico del Mercado. Si este es su caso, sepa que existen opciones de cobertura de salud para indocumentados.</p>
                            <p>Los beneficios del plan de salud de obama se extienden a millones de personas. Entre ellas las que tienen ingresos bajos o moderados, personas con enfermedades preexistentes, embarazadas. Todas las aseguradoras que ofrezcan seguro médico Obamacare, tienen que garantizar los 10 beneficios esenciales de salud.</p>
                        </div>

                        <div class="requirement-item">
                            <h4 class="requirement-heading">Mínimo de ingresos para calificar para seguro de Obamacare</h4>
                            <p>Otro de los requisitos para calificar para Obamacare es tener un mínimo de ingresos anuales. Los individuos y las familias pueden ser elegibles para Obamacare si el ingreso anual del hogar está entre el 100 y 400 por ciento de la línea de pobreza federal. Estos parámetros son establecidos cada año por el Gobierno Federal según el tamaño de la familia.</p>
                            <p>El tamaño de la familia, se trata de todas las personas que estan incluidas en su declaración de impuestos. Por lo general es usted, su cónyuge y sus hijos menores de 26 años.</p>
                            <p><strong>Para el año 2022 estas son las cifras:</strong></p>
                            <ul class="income-list">
                                <li>$13,590 (100%) hasta $54,360 (400%) para un individuo solo</li>
                                <li>$18,310 (100%) hasta $73,240 (400%) para una familia de dos</li>
                                <li>$27,750 (100%) hasta $111,000 (400%) para una familia de cuatro</li>
                            </ul>
                            <p>Para más información puede revisar nuestra Tabla de Ingresos de Obamacare.</p>
                        </div>

                        <div class="requirement-item">
                            <h4 class="requirement-heading">Aplicar para seguro Obamacare en los Períodos establecidos para calificar</h4>
                            <p>Aplicar durante el Período de Inscripción Abierta, del 1 de noviembre al 15 de diciembre es otro de los requisitos para calificar para Obamacare. De lo contrario no podrá calificar para seguros de salud del gobierno, ni obtener subsidios. A no ser que califique para un Período Especial. Si este es el caso, hágalo en los límites establecidos 60 días antes o 60 después de ocurrido el evento especial.</p>
                            <p>Generalmente debe comprar seguro médico durante los 45 días del Período de Inscripción. Tanto para seguros privados, como para un plan médico a través del Mercado de Seguros Médicos.</p>
                        </div>

                        <div class="requirement-item">
                            <h4 class="requirement-heading">Soy casada/o y no he hecho la Declaración de Impuestos en conjunto con mi esposo/a ¿Califico para Obamacare?</h4>
                            <p>Para calificar para Obamacare, uno de los requisitos es que un matrimonio tiene que hacer los Taxes juntos. Pero no se angustie, la solución es hacer la siguiente declaración en conjunto con su esposo/a.</p>
                        </div>

                        <div class="requirement-item">
                            <h4 class="requirement-heading">¿Soy elegible para Obamacare si tengo cobertura de salud a través de mi empleador?</h4>
                            <p>Si su empleador patrocina su seguro médico, usted no seria elegible para cobertura del Mercado. Los seguros médicos ofrecidos por un empleador se consideran cobertura esencial mínima. En otras palabras, tendrá que inscribirse en el plan del empleador y no cumple los requisitos para calificar para Obamacare.</p>
                        </div>
                    </div>
                `
            }
        };
        return cardData[type] || cardData['card1'];
    }
}