import { Component, Input, Output, EventEmitter, HostListener, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JwtPayload } from '@app/models/auth.model';
import { RouterLink } from "@angular/router";
import { SiteConfigAdminService } from '@app/services/admin/admin-site-config.service';
import { AdminProfileService } from '@app/services/admin/admin-profile.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  host: {
    class: 'navbar fixed-top'
  },
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

    @Input() payload!: JwtPayload | null;
    @Output() logoutClick = new EventEmitter<void>();

    companyName = 'MediSupply';
    currentUser: any = null;
    
    private siteConfigService = inject(SiteConfigAdminService)
    private profileService = inject(AdminProfileService);

    isDropdownOpen = false;

    ngOnInit(): void {

        this.profileService.currentUser$.subscribe(user => {
            this.currentUser = user;
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

    toggleDropdown() {
        this.isDropdownOpen = !this.isDropdownOpen;
    }

    logout() {
        this.logoutClick.emit();
    }

    @HostListener('document:click', ['$event'])
    closeDropdown(event: Event) {
        const target = event.target as HTMLElement;

        if (!target.closest('.user-dropdown')) {
        this.isDropdownOpen = false;
        }
    }

}