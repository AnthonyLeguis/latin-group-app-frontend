import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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

    goToCotizador(): void {
        const cotizadorUrl = 'https://www.healthsherpa.com/marketplace/zip_code?_agent_id=jose-colmenarez-manzano-hkpqoq';
        window.open(cotizadorUrl, '_blank');
    }
}
