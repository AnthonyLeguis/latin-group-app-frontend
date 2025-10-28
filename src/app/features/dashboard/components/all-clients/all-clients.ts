import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormSkeletonComponent } from '../../../../shared/components/form-skeleton/form-skeleton';

@Component({
    selector: 'app-all-clients',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        FormSkeletonComponent
    ],
    templateUrl: './all-clients.html',
    styleUrls: ['./all-clients.scss']
})
export class AllClientsComponent implements OnInit {
    isLoading = true;

    ngOnInit(): void {
        // Simular carga
        setTimeout(() => {
            this.isLoading = false;
        }, 500);
    }
}
