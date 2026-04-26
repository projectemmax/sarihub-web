import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SiteConfigAdminService } from '@app/services/admin/admin-site-config.service';
import { UserProfileService } from '@app/core/user/user-profile.service';
import { AdminProfileService } from '@app/services/admin/admin-profile.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  host: {
    class: 'sidebar sidebar-offcanvas',
    id: 'sidebar'
  },
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

    uiOpen = false;
    companyName = 'MediSupply';
    currentUser: any;

    constructor(
      private router: Router,
      private profileService: AdminProfileService,
      private siteConfigService: SiteConfigAdminService
    ) {}

    async ngOnInit(): Promise<void> {
        this.profileService.currentUser$.subscribe(user => {
            this.currentUser = user;
            console.log('Sidebar current user:', user);
        });

        if (!this.profileService.currentUser) {
            this.profileService.loadCurrentUser().subscribe();
        }

        this.siteConfigService.getAll().subscribe((res: any) => {
            const configs = res.data ?? [];

            const siteName = configs.find((c: any) => c.key === 'siteName');

            if (siteName?.value) {
                this.companyName = siteName.value;
            }
        });
    }

    isSettingsOpen(): boolean {
        return this.router.url.includes('/admin/settings');
    }

    toggleUiMenu() {
        this.uiOpen = !this.uiOpen;
    }

}