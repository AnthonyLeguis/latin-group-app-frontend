import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './about.html',
    styleUrl: './about.scss'
})
export class AboutComponent {
    @Output()
    scrollToSection = new EventEmitter<string>();
}
