import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-testimonials',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './testimonials.html',
    styleUrl: './testimonials.scss'
})
export class TestimonialsComponent {
    testimonials = [
        {
            name: 'María González',
            role: 'Agente Senior',
            icon: 'person',
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-100',
            message: 'LatinGroup App ha revolucionado la forma en que gestionamos nuestras aplicaciones. El sistema es intuitivo y nos permite procesar formularios complejos en minutos.',
            rating: 5
        },
        {
            name: 'Carlos Rodríguez',
            role: 'Administrador',
            icon: 'business',
            iconColor: 'text-green-600',
            bgColor: 'bg-green-100',
            message: 'Como administrador, aprecio el control total que tenemos sobre el sistema. La aprobación de aplicaciones es eficiente y el seguimiento es excelente.',
            rating: 5
        },
        {
            name: 'Ana López',
            role: 'Cliente',
            icon: 'account_circle',
            iconColor: 'text-purple-600',
            bgColor: 'bg-purple-100',
            message: 'El proceso de aplicación nunca había sido tan sencillo. Puedo ver el estado de mi solicitud en tiempo real y la comunicación es clara y directa.',
            rating: 5
        }
    ];
}
