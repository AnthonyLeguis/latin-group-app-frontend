import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

// Import all section components
import { HeroComponent } from '../components/hero/hero';
import { AboutComponent } from '../components/about/about';
import { ObamacareComponent } from '../components/obamacare/obamacare';
import { ServicesComponent } from '../components/services/services';
import { OurTeamComponent } from '../components/our-team/our-team';
import { TestimonialsComponent } from '../components/testimonials/testimonials';
import { InsuranceCompanyComponent } from '../components/insurance-company/insurance-company';
import { ContactComponent } from '../components/contact/contact';
import { WhatsappButtonComponent } from '../components/whatsapp/whatsapp-button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    HeroComponent,
    AboutComponent,
    ObamacareComponent,
    ServicesComponent,
    OurTeamComponent,
    TestimonialsComponent,
    InsuranceCompanyComponent,
    ContactComponent,
    WhatsappButtonComponent,
    FontAwesomeModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {

  faWhatsapp = faWhatsapp;

  showMobileMenu = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/auth/register']);
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
    this.updateBodyScroll();
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
    this.updateBodyScroll();
  }

  private updateBodyScroll() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.showMobileMenu) {
        document.body.classList.add('mobile-menu-open');
      } else {
        document.body.classList.remove('mobile-menu-open');
      }
    }
  }
}
