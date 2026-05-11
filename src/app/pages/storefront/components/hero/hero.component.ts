import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SiteConfigService } from '@app/core/services/site-config.service';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, map, of, Subject, switchMap } from 'rxjs';
import { StorefrontProductService } from '@app/services/storefront/storefront-product.service';

@Component({
  selector: 'app-hero',
  imports: [FormsModule, CommonModule],
  standalone: true,
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent implements OnInit {

    searchTerm = '';
    config: any = {};
    hero: any = {};
    search$ = new Subject<string>();
    suggestions: any[] = [];
    showDropdown = false;

    constructor(
        private router: Router,
        private siteConfigService: SiteConfigService,
        private storefrontProductService: StorefrontProductService
    ) {}

    ngOnInit() {
        this.siteConfigService.get().subscribe(config => {
            console.log('CONFIG:', config);
            this.config = config || {}; // ✅ IMPORTANT
            const banner = config?.homepageBanner || {}; // ✅ USE config (not this.config)

            this.hero = {
                title: banner.title,
                subtitle: banner.subtitle,
                tagline: banner.tagline,
                background: banner.backgroundImage
            };
        });

        this.search$
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(query => {
                    const value = query.trim();

                    if (value.length < 2) {
                        return of({
                            query: value,
                            suggestions: [],
                        });
                    }

                    return this.storefrontProductService
                        .searchAutocomplete(value)
                        .pipe(
                            map((res: any) => ({
                                query: value,
                                suggestions: res?.data || res || [],
                            }))
                        );
                }
                )
            )
            .subscribe(({ query, suggestions }) => {
                this.suggestions = suggestions;
                this.showDropdown = query.length >= 2;
            });

    }

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

    selectSuggestion(item: any) {
        this.showDropdown = false;

        // Optional: fill input with selected name
        this.searchTerm = item.name;

        // Navigate to product page
        this.router.navigate(['/storefront/product', item.slug]);
    }

    onInputChange(value: string) {
        this.searchTerm = value;
        this.search$.next(value);

        if (!value.trim() || value.length < 2) {
            this.suggestions = [];
            this.showDropdown = false;
            return;
        }
    }

    clearSearch() {
        this.searchTerm = '';
        this.suggestions = [];
        this.showDropdown = false;
        this.search$.next('');

        this.router.navigate([], {
            queryParams: {
                search: null,
                page: null,
            },
            queryParamsHandling: 'merge',
        });
    }

}
