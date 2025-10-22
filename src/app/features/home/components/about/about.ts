import { Component, ElementRef, EventEmitter, Output, AfterViewInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './about.html',
    styleUrl: './about.scss'
})
export class AboutComponent implements AfterViewInit {
    @Output()
    scrollToSection = new EventEmitter<string>();

    @ViewChild('aboutText', { static: false }) aboutText!: ElementRef;
    @ViewChild('aboutImg', { static: false }) aboutImg!: ElementRef;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

    ngAfterViewInit() {
        if (isPlatformBrowser(this.platformId) && this.aboutText && this.aboutImg) {
            const textEl = this.aboutText.nativeElement;
            const imgEl = this.aboutImg.nativeElement;
            const observer = new (window as any).IntersectionObserver((entries: any) => {
                entries.forEach((entry: any) => {
                    if (entry.isIntersecting) {
                        if (entry.target === textEl) {
                            textEl.classList.add('fade-in-right');
                            setTimeout(() => {
                                imgEl.classList.add('fade-in-left');
                            }, 800);
                        }
                    }
                });
            }, { threshold: 0.2 });
            observer.observe(textEl);
            observer.observe(imgEl);
        }
    }
}
