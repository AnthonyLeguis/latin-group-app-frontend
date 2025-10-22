import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

@Component({
    selector: 'app-whatsapp-button',
    standalone: true,
    imports: [FontAwesomeModule],
    templateUrl: './whatsapp-button.component.html',
    styleUrls: ['./whatsapp-button.component.scss']
})
export class WhatsappButtonComponent {
    whatsappUrl = 'https://wa.me/19729149213';
    faWhatsapp = faWhatsapp;

    openWhatsapp() {
        window.open(this.whatsappUrl, '_blank');
    }
}