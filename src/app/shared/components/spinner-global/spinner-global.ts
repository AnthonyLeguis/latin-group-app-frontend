import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-spinner-global',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './spinner-global.html',
    styleUrl: './spinner-global.scss'
})
export class SpinnerGlobalComponent {
    @Input() size: 'xsmall' | 'small' | 'medium' | 'large' = 'medium';
    @Input() color: 'primary' | 'white' | 'red' | 'light' = 'primary';
}
