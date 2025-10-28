import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-skeleton-loader',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './skeleton-loader.html',
    styleUrls: ['./skeleton-loader.scss']
})
export class SkeletonLoaderComponent {
    @Input() type: 'text' | 'circle' | 'rectangle' | 'form-field' | 'card' = 'text';
    @Input() width: string = '100%';
    @Input() height: string = '20px';
    @Input() count: number = 1;
    @Input() spacing: string = '1rem';
}
