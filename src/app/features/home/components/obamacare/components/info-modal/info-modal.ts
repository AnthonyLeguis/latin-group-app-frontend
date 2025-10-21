import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface CardInfo {
    title: string;
    content: string;
    image: string;
}

export interface RequirementItem {
    title: string;
    content: string;
}

@Component({
    selector: 'app-info-modal',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
    templateUrl: './info-modal.html',
    styleUrl: './info-modal.scss'
})
export class InfoModalComponent {
    expandedItems: Set<number> = new Set();

    requirements: RequirementItem[] = [
        {
            title: 'Tener un estatus migratorio Legal es requisito para Obamacare',
            content: 'La Ley de Obama establece entre los requisitos para calificar para Obamacare que las personas tengan estatus legal en el país. Ciudadanos, residentes permanentes o personas con un número de seguro social, califican.\n\nEn otras palabras, si usted no tiene un Social Security, no califica para seguro médico del Mercado. Si este es su caso, sepa que existen opciones de cobertura de salud para indocumentados.\n\nLos beneficios del plan de salud de obama se extienden a millones de personas. Entre ellas las que tienen ingresos bajos o moderados, personas con enfermedades preexistentes, embarazadas. Todas las aseguradoras que ofrezcan seguro médico Obamacare, tienen que garantizar los 10 beneficios esenciales de salud.'
        },
        {
            title: 'Mínimo de ingresos para calificar para seguro de Obamacare',
            content: 'Otro de los requisitos para calificar para Obamacare es tener un mínimo de ingresos anuales. Los individuos y las familias pueden ser elegibles para Obamacare si el ingreso anual del hogar está entre el 100 y 400 por ciento de la línea de pobreza federal. Estos parámetros son establecidos cada año por el Gobierno Federal según el tamaño de la familia.\n\nEl tamaño de la familia, se trata de todas las personas que estan incluidas en su declaración de impuestos. Por lo general es usted, su cónyuge y sus hijos menores de 26 años.\n\nPara el año 2022 estas son las cifras:\n\n• $13,590 (100%) hasta $54,360 (400%) para un individuo solo\n• $18,310 (100%) hasta $73,240 (400%) para una familia de dos\n• $27,750 (100%) hasta $111,000 (400%) para una familia de cuatro\n\nPara más información puede revisar nuestra Tabla de Ingresos de Obamacare.'
        },
        {
            title: 'Aplicar para seguro Obamacare en los Períodos establecidos para calificar',
            content: 'Aplicar durante el Período de Inscripción Abierta, del 1 de noviembre al 15 de diciembre es otro de los requisitos para calificar para Obamacare. De lo contrario no podrá calificar para seguros de salud del gobierno, ni obtener subsidios. A no ser que califique para un Período Especial. Si este es el caso, hágalo en los límites establecidos 60 días antes o 60 después de ocurrido el evento especial.\n\nGeneralmente debe comprar seguro médico durante los 45 días del Período de Inscripción. Tanto para seguros privados, como para un plan médico a través del Mercado de Seguros Médicos.'
        },
        {
            title: 'Soy casada/o y no he hecho la Declaración de Impuestos en conjunto con mi esposo/a ¿Califico para Obamacare?',
            content: 'Para calificar para Obamacare, uno de los requisitos es que un matrimonio tiene que hacer los Taxes juntos. Pero no se angustie, la solución es hacer la siguiente declaración en conjunto con su esposo/a.'
        },
        {
            title: '¿Soy elegible para Obamacare si tengo cobertura de salud a través de mi empleador?',
            content: 'Si su empleador patrocina su seguro médico, usted no seria elegible para cobertura del Mercado. Los seguros médicos ofrecidos por un empleador se consideran cobertura esencial mínima. En otras palabras, tendrá que inscribirse en el plan del empleador y no cumple los requisitos para calificar para Obamacare.'
        }
    ];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: CardInfo,
        public sanitizer: DomSanitizer
    ) { }

    toggleItem(index: number): void {
        if (this.expandedItems.has(index)) {
            this.expandedItems.delete(index);
        } else {
            this.expandedItems.add(index);
        }
    }

    isItemExpanded(index: number): boolean {
        return this.expandedItems.has(index);
    }
}