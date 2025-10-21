import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-hero',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule],
    templateUrl: './hero.html',
    styleUrl: './hero.scss'
})
export class HeroComponent {
    @Output() navigateToRegister = new EventEmitter<void>();
    @Output() scrollToSection = new EventEmitter<string>();

    onBeginClick() {
        this.navigateToRegister.emit();
    }

    onLearnMoreClick() {
        this.scrollToSection.emit('about');
    }
}
