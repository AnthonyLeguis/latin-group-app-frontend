import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ContactModalService } from '../../../../core/services/contact-modal.service';

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

    constructor(private contactModalService: ContactModalService) { }

    onBeginClick() {
        this.contactModalService.openModal();
    }

    onLearnMoreClick() {
        this.scrollToSection.emit('about');
    }
}
