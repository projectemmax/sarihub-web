import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Category } from '@app/models/category.model';

@Component({
  selector: 'app-category-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-sidebar.component.html',
  styleUrl: './category-sidebar.component.css',
})
export class CategorySidebarComponent {
  @Input() categories: Category[] = [];
  @Input() activeCategoryId: string | null = null;
  @Input() totalProducts = 0;
  @Input() categoryCounts: Record<string, number> = {};

  @Output() categorySelect = new EventEmitter<string | null>();

  selectCategory(categoryId: string | null) {
    this.categorySelect.emit(categoryId);
  }

  trackById(_: number, c: Category) {
    return c.id;
  }
}