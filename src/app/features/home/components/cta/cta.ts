import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-cta',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule],
    templateUrl: './cta.html',
    styleUrl: './cta.scss'
})
export class CTAComponent {
    @Output() navigateToLogin = new EventEmitter<void>();

    onLoginClick() {
        this.navigateToLogin.emit();
    }
}
