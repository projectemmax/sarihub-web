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
    delay,
  Subject,
} from 'rxjs';

import { CategoryService } from '@app/services/category/category.service';
import { ApiResponse } from '@app/models/api-response.model';
import { Category } from '@app/models/category.model';

import { SearchComponent } from '@app/shared/search/search.component';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { AdminCategoryNode, CategoryTreeRow, CategoryOption } from '@app/models/category-tree.model';
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';

import { TableSkeletonComponent } from '@app/shared/table-skeleton/table-skeleton.component';

@Component({
    selector: 'app-categories',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SearchComponent,
        PaginationComponent,
        TableSkeletonComponent,
        FormsModule
    ],
    templateUrl: './categories.component.html',
    styleUrls: ['./categories.component.css'],
    animations: [
        trigger('expandCollapse', [
            transition(':enter', [
            style({
                opacity: 0,
                transform: 'translateY(-8px)'
            }),
            animate(
                '200ms ease-out',
                style({
                opacity: 1,
                transform: 'translateY(0)'
                })
            )
            ]),
            transition(':leave', [
            animate(
                '150ms ease-in',
                style({
                opacity: 0,
                transform: 'translateY(-8px)'
                })
            )
            ])
        ])
    ]
})
export class CategoriesComponent implements OnInit, OnDestroy {
    readonly pageSize = 10;
    private readonly TREE_STATE_KEY = 'admin-category-tree-expanded';

    private destroy$ = new Subject<void>();

    categoryTree: AdminCategoryNode[] = [];
    expandedNodes = new Set<string>();
    displayRows: CategoryTreeRow[] = [];
    searchTerm = '';

    // ------------------
    // UI STATE
    // ------------------
    isLoading = false;
    isSidePanelVisible = false;
    isEditMode = false;
    variantTemplate: string[] = [];
    selectedStatusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';
    showDeactivateModal = false;
    editingCategory: Category | null = null;

    private pendingPayload: any = null;
    private pendingCategoryId: string | null = null;

    
    private categoryMap =
    new Map<string, AdminCategoryNode>();

    selectedCategoryHasChildren = false;
    selectedCategoryType = '';

    selectedDescendantCount = 0;

    parentCategories: Category[] = [];
    categories: AdminCategoryNode[] = [];
    parentOptions: CategoryOption[] = [];
    filteredParentOptions: CategoryOption[] = [];


    // ------------------
    // FORM (DECLARATION ONLY)
    // ------------------
    categoryForm!: FormGroup;

    trackByIndex(index: number) {
        return index;
    }

    onStatusFilterChange(
        status: 'ALL' | 'ACTIVE' | 'INACTIVE'
    ): void {

        this.selectedStatusFilter = status;

        this.buildDisplayRows();
    }
    
    onSearch(term: string): void {

        this.searchTerm = term.trim().toLowerCase();

        this.buildDisplayRows();
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
        this.restoreExpandedNodes();
        this.loadCategoryTree();
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
            parentId: [null],
            sortOrder: [0],
            isActive: [true]
        });
    }

    // ------------------
    // SIDE_PANEL / CREATE
    // ------------------
    onAddCategory(): void {
        this.isEditMode = false;
        this.filteredParentOptions = this.parentOptions;

        this.categoryForm.reset({
            parentId: null,
            sortOrder: 0,
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
            this.loadCategoryTree();
        });
    }


    openSidePanel(): void {
        this.isEditMode = false;
        this.categoryForm.reset({ isActive: true });
        this.isSidePanelVisible = true;
    }

    closeSidePanel(): void {
        this.isSidePanelVisible = false;
        this.editingCategory = null;
        this.selectedCategoryHasChildren = false;
        this.selectedDescendantCount = 0;
        this.categoryForm.reset();
    }

    onEdit(cat: Category): void {
        this.isEditMode = true;
        this.editingCategory = cat;
        this.categoryForm.patchValue(cat);
        this.filteredParentOptions =
            this.getAvailableParentOptions(
                cat.id
            );
        this.variantTemplate = cat.variantTemplate?.attributes ?? [];

        const treeNode = this.findNodeById(
            this.categoryTree,
            cat.id
        );

        this.selectedCategoryHasChildren = !!treeNode?.children?.length;

        this.selectedCategoryType =
            cat.parentId
                ? 'Child Category'
                : 'Parent Category';

        this.isSidePanelVisible = true;
    }

    private findNodeById(
        nodes: AdminCategoryNode[],
        id: string
    ): AdminCategoryNode | null {

        for (const node of nodes) {

            if (node.id === id) {
                return node;
            }

            if (node.children?.length) {

                const found =
                    this.findNodeById(
                        node.children,
                        id
                    );

                if (found) {
                    return found;
                }
            }
        }

        return null;
    }

    onSaveCategory(): void {
        if (this.categoryForm.invalid) {
            return;
        }

        const { id, ...formPayload } = this.categoryForm.value;
        const payload = formPayload;

        console.log('editingCategory', this.editingCategory);
        console.log('original isActive', this.editingCategory?.isActive);
        console.log('new isActive', payload.isActive);
        console.log('hasChildren', this.selectedCategoryHasChildren);

        if (this.isEditMode) {

            const currentCategory = this.editingCategory;

            const becomingInactive =
                currentCategory?.isActive === true &&
                payload.isActive === false;

            console.log('becomingInactive', becomingInactive);

            if (
                becomingInactive &&
                this.selectedCategoryHasChildren
            ) {

                console.log('SHOW MODAL');

                this.pendingCategoryId = id;
                this.pendingPayload = payload;

                this.showDeactivateModal = true;
                return;
            }

            this.updateCategory(id, payload);
            return;
        }

        // create logic...
    }

    private updateCategory(
        id: string,
        payload: any
    ): void {

        this.categorySrv.updateCategory(id, payload)
            .subscribe(() => {

                this.closeSidePanel();
                this.reloadData();

                this.pendingCategoryId = null;
                this.pendingPayload = null;
            });
    }

    private reloadData(): void {
        this.loadCategoryTree();
    }

    // ------------------
    // DEACTIVATE
    // ------------------
    onDeactivate(cat: Category): void {
        if (!confirm('Deactivate this category?')) return;

        this.categorySrv.updateCategory(cat.id, {
            isActive: false
        }).subscribe(() => {
            this.reloadData();
        });
    }

    addTemplateField(): void {
    this.variantTemplate.push('');
    }

    removeTemplateField(index: number): void {
        this.variantTemplate.splice(index, 1);
    }

    //================== Category Tree (for future use) ==================

    loadCategoryTree(): void {

        this.isLoading = true;

        this.categorySrv
            .getAdminCategoryTree()
            .subscribe({
                next: (tree: AdminCategoryNode[]) => {
                    this.categoryTree = tree;
                    this.categoryMap.clear();
                    this.buildCategoryMap(tree);

                    // Build Parent Category dropdown options
                    this.parentOptions = this.buildParentOptions(tree);
                    this.filteredParentOptions = [...this.parentOptions];
                    this.buildDisplayRows();

                    this.isLoading = false;
                },
                error: (err) => {
                    console.error(err);
                }
            });
    }

    private restoreExpandedNodes(): void {

        const saved =
            localStorage.getItem(
                this.TREE_STATE_KEY
            );

        if (!saved) {
            return;
        }

        try {
            this.expandedNodes =
                new Set<string>(
                    JSON.parse(saved)
                );

        } catch {
            this.expandedNodes.clear();
        }
    }

    private persistExpandedNodes(): void {
        localStorage.setItem(
            this.TREE_STATE_KEY,
            JSON.stringify(
                [...this.expandedNodes]
            )
        );
    }

    private buildParentOptions(
        nodes: AdminCategoryNode[],
        level = 0
    ): CategoryOption[] {

        const options: CategoryOption[] = [];

        nodes.forEach(node => {

            options.push({
                id: node.id,
                label: `${'— '.repeat(level)}${node.name}`
            });

            if (node.children?.length) {
                options.push(
                    ...this.buildParentOptions(
                        node.children,
                        level + 1
                    )
                );
            }
        });

        return options;
    }

    private buildCategoryMap(
        nodes: AdminCategoryNode[]
    ): void {

        nodes.forEach(node => {

            this.categoryMap.set(
                node.id,
                node
            );

            if (node.children?.length) {
                this.buildCategoryMap(
                    node.children
                );
            }
        });
    }

    toggleNode(row: CategoryTreeRow): void {
        if (!row.hasChildren) {
            return;
        }

        if (
            this.expandedNodes.has(row.id)
        ) {
            this.expandedNodes.delete(row.id);
        } else {
            this.expandedNodes.add(row.id);
        }

        this.persistExpandedNodes();
        this.buildDisplayRows();
    }

    isExpanded(id: string): boolean {
        return this.expandedNodes.has(id);
    }

    private buildDisplayRows(): void {

        const rows: CategoryTreeRow[] = [];

        const traverse = (
            nodes: AdminCategoryNode[],
            level = 0,
            parentName?: string,
            path: string[] = []
        ) => {

            nodes.forEach(node => {

                const currentPath = [
                    ...path,
                    node.name
                ];

                const fullPath = currentPath.join(' > ');

                const searchTerm =
                    this.searchTerm?.trim().toLowerCase() ?? '';

                const matchesSearch =
                    !searchTerm ||
                    node.name
                        .toLowerCase()
                        .includes(searchTerm) ||
                    fullPath
                        .toLowerCase()
                        .includes(searchTerm);

                const matchesStatus =
                    this.selectedStatusFilter === 'ALL' ||
                    (
                        this.selectedStatusFilter === 'ACTIVE'
                            ? node.isActive
                            : !node.isActive
                    );

                if (matchesSearch && matchesStatus) {

                    rows.push({
                        id: node.id,
                        name: node.name,
                        isActive: node.isActive,
                        level,
                        expanded: this.expandedNodes.has(node.id),
                        hasChildren: node.children?.length > 0,
                        childCount: node.children?.length ?? 0,
                        descendantCount: node.descendantCount ?? 0,
                        parentName,
                        fullPath
                    });
                }

                // Always continue traversing children
                if (
                    node.children?.length &&
                    this.expandedNodes.has(node.id)
                ) {

                    traverse(
                        node.children,
                        level + 1,
                        node.name,
                        currentPath
                    );
                }
            });
        };

        traverse(this.categoryTree);

        this.displayRows = rows;
    }

    get showHierarchyContext(): boolean {
        return !!this.searchTerm?.trim()
            || this.selectedStatusFilter !== 'ALL';
    }

    //============ ACTIONS ROW =============

    onEditById(categoryId: string): void {

        const node =
            this.findNodeById(
                this.categoryTree,
                categoryId
            );

        if (!node) {
            return;
        }

        this.isEditMode = true;

        this.editingCategory = {
            id: node.id,
            name: node.name,
            parentId: node.parentId,
            isActive: node.isActive
        } as Category;

        this.categoryForm.patchValue({
            id: node.id,
            name: node.name,
            parentId: node.parentId,
            sortOrder: node.sortOrder,
            isActive: node.isActive
        });

        this.filteredParentOptions =
            this.getAvailableParentOptions(
                node.id
            );

        this.selectedCategoryHasChildren = !!node.children?.length;

        this.selectedDescendantCount = node.descendantCount ?? 0;

        this.selectedCategoryType =
            node.parentId
                ? 'Child Category'
                : 'Parent Category';

        this.isSidePanelVisible = true;
    }

    addChild(row: CategoryTreeRow): void {

        this.isEditMode = false;

        this.categoryForm.reset({
            parentId: row.id,
            sortOrder: 0,
            isActive: true
        });

        this.filteredParentOptions =
            this.parentOptions;

        this.variantTemplate = [];

        this.isSidePanelVisible = true;
    }

    deleteCategory(categoryId: string): void {

        const category =
            this.categoryMap.get(categoryId);

        if (!category) {
            return;
        }

        const confirmed = confirm(
            `Are you sure you want to delete "${category.name}"?`
        );

        if (!confirmed) {
            return;
        }

        this.categorySrv
            .deleteCategory(categoryId)
            .subscribe({
                next: () => {

                    alert('Category deleted successfully.');

                    this.reloadData();
                },

                error: (err) => {

                    const message =
                        err?.error?.message ||
                        'Failed to delete category';

                    alert(message);
                }
            });
    }

    private getDescendantIds(
        categoryId: string,
        tree: AdminCategoryNode[]
    ): string[] {

        const descendants: string[] = [];

        const findNode = (
            nodes: AdminCategoryNode[]
        ): AdminCategoryNode | null => {

            for (const node of nodes) {

            if (node.id === categoryId) {
                return node;
            }

            if (node.children?.length) {

                const found = findNode(node.children);

                if (found) {
                return found;
                }
            }
            }

            return null;
        };

        const collect = (
            node: AdminCategoryNode
        ): void => {

            node.children?.forEach(child => {

            descendants.push(child.id);

            collect(child);
            });
        };

        const node = findNode(tree);

        if (node) {
            collect(node);
        }

        return descendants;
    }

    getAvailableParentOptions(
        categoryId?: string
    ): CategoryOption[] {

        if (!categoryId) {
            return this.parentOptions;
        }

        const currentNode =
            this.findNodeById(
                this.categoryTree,
                categoryId
            );

        if (!currentNode) {
            return this.parentOptions;
        }

        const excludedIds = new Set(
            this.getDescendantIds(
                categoryId,
                this.categoryTree
            )
        );

        excludedIds.add(categoryId);

        return this.parentOptions.filter(
            option => !excludedIds.has(option.id)
        );
    }

    //============= MODAL ACTIONS =============

    closeDeactivateModal(): void {
        this.showDeactivateModal = false;

        this.pendingCategoryId = null;
        this.pendingPayload = null;
    }

    confirmDeactivate(): void {
        this.showDeactivateModal = false;

        if (
            this.pendingCategoryId &&
            this.pendingPayload
        ) {
            this.updateCategory(
                this.pendingCategoryId,
                this.pendingPayload
            );
        }
    }

}
