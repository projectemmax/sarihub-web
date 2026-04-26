import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { AuthService } from '@app/core/auth/auth.service';
import { JwtPayload } from '@app/models/auth.model';

import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    FooterComponent
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {

    payload: JwtPayload | null = null;
    isLoggedIn = false;

    constructor(private authService: AuthService) {}

    ngOnInit(): void {
        this.clearTemplateCss();

        this.loadCss('assets/admin/css/shared/style.css');
        this.loadCss('assets/admin/css/demo_1/style.css');

        this.loadCss('assets/admin/vendors/iconfonts/ionicons/dist/css/ionicons.css');
        this.loadCss('assets/admin/vendors/iconfonts/mdi/css/materialdesignicons.min.css');

        this.isLoggedIn = this.authService.isLoggedIn();
        this.payload = this.authService.getJwtPayload();
    }

    loadCss(path: string) {

        const link = document.createElement('link');

        link.rel = 'stylesheet';
        link.href = path;
        link.classList.add('template-css');

        document.head.appendChild(link);
    }

    clearTemplateCss() {
        document.querySelectorAll('.template-css')
        .forEach(el => el.remove());
    }

    logout() {
        this.authService.logout();
    }

}