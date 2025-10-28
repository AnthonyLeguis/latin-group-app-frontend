import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader';

@Component({
    selector: 'app-form-skeleton',
    standalone: true,
    imports: [CommonModule, SkeletonLoaderComponent],
    templateUrl: './form-skeleton.html',
    styleUrls: ['./form-skeleton.scss']
})
export class FormSkeletonComponent {
}
