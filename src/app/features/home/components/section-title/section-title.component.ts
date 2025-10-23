import { Component, Input, ElementRef, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-section-title',
  standalone: true,
  templateUrl: './section-title.component.html',
  styleUrl: './section-title.component.scss'
})
export class SectionTitleComponent implements AfterViewInit {
  @Input() title = '';
  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const wrapperEl = this.el.nativeElement.querySelector('.title-wrapper');
      if (wrapperEl) {
        wrapperEl.classList.remove('show');
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              wrapperEl.classList.add('show');
              observer.disconnect();
            }
          });
        }, { threshold: 0.2 });
        observer.observe(wrapperEl);
      }
    }
  }
}
