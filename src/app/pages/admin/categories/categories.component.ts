import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  BehaviorSubject,
  combineLatest,
  map,
  shareReplay,
  switchMap,
  Subject,
  tap,
} from 'rxjs';

import { CategoryService } from '@app/services/category/category.service';
import { ApiResponse } from '@app/models/api-response.model';
import { Category } from '@app/models/category.model';

import { SearchComponent } from '@app/shared/search/search.component';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SearchComponent,
    PaginationComponent,
    FormsModule
  ],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
})
export class CategoriesComponent implements OnInit, OnDestroy {
    readonly pageSize = 10;
    private readonly STORAGE_KEY = 'category_state';

    private destroy$ = new Subject<void>();
    private refresh$ = new BehaviorSubject<void>(undefined);


    // ------------------
    // UI STATE
    // ------------------
    isLoading = false;
    isSidePanelVisible = false;
    isEditMode = false;
    variantTemplate: string[] = [];

    private searchTerm$ = new BehaviorSubject<string>('');
    private statusFilter$ =
        new BehaviorSubject<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');



    // ------------------
    // FORM (DECLARATION ONLY)
    // ------------------
    categoryForm!: FormGroup;

    // ------------------
    // PAGINATION
    // ------------------
    currentPage = 1;
    private currentPage$ = new BehaviorSubject<number>(1);

    // ------------------
    // DATA
    // ------------------
    private allCategories$ = this.refresh$.pipe(
        switchMap(() => this.categorySrv.getCategories()),
        tap(categories => console.log('categories:', categories)),
        shareReplay(1)
    );

    filteredCategories$ = combineLatest([
        this.allCategories$,
        this.searchTerm$,
        this.statusFilter$
    ]).pipe(
        map(([list, searchTerm, status]) => {
        let result = list;

        // Status filter
        if (status === 'ACTIVE') {
            result = result.filter(c => c.isActive);
        }

        if (status === 'INACTIVE') {
            result = result.filter(c => !c.isActive);
        }

        // Search filter
        if (searchTerm) {
            result = result.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return result;
        })
    );

        trackByIndex(index: number) {
            return index;
        }


    pagedCategories$ = combineLatest([
        this.filteredCategories$,
        this.currentPage$,
    ]).pipe(
        map(([list, page]) => {
        const start = (page - 1) * this.pageSize;
        return list.slice(start, start + this.pageSize);
        })
    );

    totalPages$ = this.filteredCategories$.pipe(
        map(list => Math.max(1, Math.ceil(list.length / this.pageSize)))
    );

    onStatusFilterChange(status: 'ALL' | 'ACTIVE' | 'INACTIVE'): void {
        this.statusFilter$.next(status); // ✅ emit new value
        this.setPage(1);
    }



    constructor(
        private fb: FormBuilder,
        private categorySrv: CategoryService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    // ------------------
    // INIT
    // ------------------
    ngOnInit(): void {
        this.initForm();

        const pageParam = Number(this.route.snapshot.queryParamMap.get('page'));
        const qParam = this.route.snapshot.queryParamMap.get('q');

        if (pageParam) this.setPage(pageParam);
        if (qParam) this.searchTerm$.next(qParam);

        this.refresh$.next();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ------------------
    // FORM INIT
    // ------------------
    private initForm(): void {
        this.categoryForm = this.fb.group({
        id: [''],
        name: ['', Validators.required],
        isActive: [true],
        });
    }

    // ------------------
    // SEARCH
    // ------------------
    onSearch(term: string): void {
        this.searchTerm$.next(term);
        this.setPage(1);
        this.updateUrl();
    }


    // ------------------
    // PAGINATION
    // ------------------
    changePage(page: number): void {
        if (page < 1) return;
        this.setPage(page);
        this.updateUrl();
    }

    private setPage(page: number): void {
        this.currentPage = page;
        this.currentPage$.next(page);
    }

    // ------------------
    // URL SYNC
    // ------------------
    updateUrl(): void {
        this.router.navigate([], {
        queryParams: {
            page: this.currentPage,
            q: this.searchTerm$.value || null, // ✅ FIX
        },
        queryParamsHandling: 'merge',
        });
    }


    // ------------------
    // SIDE_PANEL / CREATE
    // ------------------
    onAddCategory(): void {
        this.isEditMode = false;
        this.categoryForm.reset({
        isActive: true
        });
        this.variantTemplate = [];
        this.isSidePanelVisible = true;
    }

    onUpdateCategory(): void {
        if (this.categoryForm.invalid) {
        this.categoryForm.markAllAsTouched();
        return;
        }

        const { id, ...payload } = this.categoryForm.value;

        this.categorySrv.updateCategory(id, payload).subscribe(() => {
        this.closeSidePanel();
        this.refresh$.next(); // or reload logic you already use
        });
    }


    openSidePanel(): void {
        this.isEditMode = false;
        this.categoryForm.reset({ isActive: true });
        this.isSidePanelVisible = true;
    }

    closeSidePanel(): void {
        this.isSidePanelVisible = false;
    }

    onEdit(cat: Category): void {
        this.isEditMode = true;
        this.categoryForm.patchValue(cat);
        this.variantTemplate = cat.variantTemplate?.attributes ?? [];
        this.isSidePanelVisible = true;
    }

        onSaveCategory(): void {
            if (this.categoryForm.invalid) return;

            const { id, ...formPayload } = this.categoryForm.value;

            const payload = {
                ...formPayload,
                variantTemplate: {
                    attributes: this.variantTemplate
                }
            };

            if (this.isEditMode) {
                this.categorySrv.updateCategory(id, payload).subscribe(() => {
                    this.closeSidePanel();
                    this.refresh$.next();
                });
            } else {
                this.categorySrv.createCategory(payload).subscribe({
                    next: () => {
                        this.closeSidePanel();
                        this.refresh$.next();
                    },
                    error: err => {
                        if (err.status === 409) {
                            alert(err.error?.message || 'Category already exists');
                        }
                    }
                });
            }
        }

    // ------------------
    // DEACTIVATE
    // ------------------
    onDeactivate(cat: Category): void {
        if (!confirm('Deactivate this category?')) return;

        this.categorySrv.updateCategory(cat.id, {
        isActive: false
        }).subscribe(() => {
        this.refresh$.next();
        });
    }

    addTemplateField(): void {
    this.variantTemplate.push('');
    }

    removeTemplateField(index: number): void {
        this.variantTemplate.splice(index, 1);
    }

}
