import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-route-loading',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './route-loading.html',
    styleUrl: './route-loading.scss'
})
export class RouteLoadingComponent {
    @Input() isHiding: boolean | null = false;
}
