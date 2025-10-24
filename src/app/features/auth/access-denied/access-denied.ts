import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-access-denied',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule
    ],
    templateUrl: './access-denied.html',
    styleUrl: './access-denied.scss'
})
export class AccessDeniedComponent implements OnInit {
    errorMessage = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            if (params['message']) {
                this.errorMessage = params['message'];
                console.error('❌ Error de acceso:', this.errorMessage);
            } else {
                this.errorMessage = 'Acceso denegado. No tienes permisos para acceder a esta página.';
            }
        });
    }

    goToLogin(): void {
        this.router.navigate(['/auth/login']);
    }

    goToHome(): void {
        this.router.navigate(['/home']);
    }
}
