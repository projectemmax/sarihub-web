import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Constant } from '@app/services/constant/constant';
import { AccountService } from '@app/services/storefront/storefront-account.service';

@Component({
  selector: 'app-account-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './account-sidebar.component.html',
  styleUrls: ['./account-sidebar.component.scss']
})
export class AccountSidebarComponent implements OnInit {

  user$ = this.accountService.user$;

  constructor(
    public route: ActivatedRoute,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
      this.user$.subscribe(user => {
          console.log('User in sidebar:', user);
      });
  }

  logout() {
    console.log('logout clicked');
  }

  avatarUrl(avatar?: string) {
    if (!avatar) {
      return 'assets/img/avatar-placeholder.png';
    }
    return Constant.UPLOADS_BASE_URL + avatar;
  }

}