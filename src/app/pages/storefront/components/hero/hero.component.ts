import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hero',
  imports: [FormsModule],
  standalone: true,
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent {

    searchTerm = '';

    constructor(private router: Router) {}

    onSearch() {
        const value = this.searchTerm?.trim();

        if (!value) return;

        this.router.navigate(['/storefront/shop'], {
            queryParams: {
                search: value,
                page: 1
            }
        });
    }
}