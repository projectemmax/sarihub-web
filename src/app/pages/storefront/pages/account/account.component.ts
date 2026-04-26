import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from "../../components/breadcrumb/breadcrumb.component";
import { map, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AccountSidebarComponent } from "./components/account-sidebar/account-sidebar.component";
import { AccountService } from '@app/services/storefront/storefront-account.service';

@Component({
  selector: 'app-account',
  standalone: true,
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  imports: [BreadcrumbComponent, CommonModule, RouterLink, RouterOutlet, AccountSidebarComponent]
})
export class AccountComponent implements OnInit {


    breadcrumb$ = of([
        { label: 'Home', url: '/' },
        { label: 'My Account' }
    ]);

    title$ = this.breadcrumb$.pipe(
        map(items => items[items.length - 1]?.label ?? '')
    );

    ngOnInit() {
        this.accountService.loadProfile();
    }

    constructor(
        private accountService: AccountService
    ){}

    logout() {
        console.log('logout clicked');
    }

}