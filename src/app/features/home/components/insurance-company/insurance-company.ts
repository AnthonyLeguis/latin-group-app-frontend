import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface InsuranceCompany {
    image: string;
}

@Component({
    selector: 'app-insurance-company',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './insurance-company.html',
    styleUrl: './insurance-company.scss'
})
export class InsuranceCompanyComponent {
    // Insurance companies logos
    companies: InsuranceCompany[] = [
        { image: '/images/insurance/01.png' },
        { image: '/images/insurance/02.png' },
        { image: '/images/insurance/03.png' },
        { image: '/images/insurance/04.png' },
        { image: '/images/insurance/05.png' },
        { image: '/images/insurance/06.png' },
        { image: '/images/insurance/07.png' },
        { image: '/images/insurance/08.png' },
        { image: '/images/insurance/09.png' }
    ];
}
