import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

// 👇 IMPORT FOOTER
import { FooterComponent } from '@app/pages/storefront/components/footer/footer.component';
import { NavbarComponent } from
  '@app/pages/storefront/components/navbar/navbar.component';


@Component({
  selector: 'app-storefront-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FooterComponent,
    NavbarComponent
  ],
  templateUrl: './layout.component.html',
})
export class StorefrontLayoutComponent implements OnInit {

    ngOnInit() {
        this.clearTemplateCss();
        this.loadCss('assets/storefront/css/medical-theme.css');
    }

    loadCss(path: string) {
        if (document.querySelector(`link[href="${path}"]`)) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = path;

        document.head.appendChild(link);
    }
    
    clearTemplateCss() {
        document.querySelectorAll('.template-css')
            .forEach(el => el.remove());
    }

}
