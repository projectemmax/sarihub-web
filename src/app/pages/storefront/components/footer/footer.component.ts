import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { SiteConfigService } from '@app/core/services/site-config.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit {
    config$ = this.siteConfig.get();
    currentYear = new Date().getFullYear();
    showBackToTop = false;

    constructor(
        private router:  Router,
        private siteConfig: SiteConfigService
    ){}

    ngOnInit(): void {
        
    }

    @HostListener('window:scroll')
    onWindowScroll() {
        this.showBackToTop = window.scrollY > 300;
    }

    scrollToTop(event: Event) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    get config() {
        return this.siteConfig.snapshot;
    }
}
