import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Cotizador {
    title: string;
    url: string;
    color: string;
    description: string;
}

@Component({
    selector: 'app-empty-placeholder',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './empty-placeholder.html',
    styleUrl: './empty-placeholder.scss'
})
export class EmptyPlaceholderComponent {

    cotizadores: Cotizador[] = [
        {
            title: 'Cotizador mercado de salud',
            url: 'https://www.healthsherpa.com/marketplace/zip_code?_agent_id=jose-colmenarez-manzano-hkpqoq',
            color: '#3b82f6', // Azul
            description: 'Accede a nuestro cotizador en línea para explorar planes de salud y obtener cotizaciones personalizadas.'
        },
        {
            title: 'Cotizador Georgia',
            url: 'https://enroll.georgiaaccess.gov/prescreener/',
            color: '#10b981', // Verde
            description: 'Explora planes de salud disponibles en Georgia y obtén cotizaciones personalizadas.'
        },
        {
            title: 'Cotizador Virginia',
            url: 'https://enroll.marketplace.virginia.gov/prescreener/',
            color: '#8b5cf6', // Morado
            description: 'Encuentra opciones de cobertura médica en Virginia y recibe cotizaciones adaptadas a tus necesidades.'
        },
        {
            title: 'Cotizador New Jersey',
            url: 'https://enroll.getcovered.nj.gov/prescreener/',
            color: '#f59e0b', // Naranja
            description: 'Descubre planes de seguro médico en New Jersey con cotizaciones instantáneas y personalizadas.'
        },
        {
            title: 'Cotizador Illinois',
            url: 'https://enroll.getcovered.illinois.gov/prescreener/',
            color: '#ef4444', // Rojo
            description: 'Accede a planes de salud en Illinois y obtén estimaciones de costos adaptadas a tu situación.'
        }
    ];

    goToCotizador(url: string): void {
        window.open(url, '_blank');
    }
}
