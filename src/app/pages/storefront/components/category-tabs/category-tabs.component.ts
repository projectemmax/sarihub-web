import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '@app/models/category.model';

@Component({
  standalone: true,
  selector: 'app-category-tabs',
  imports: [CommonModule],
  templateUrl: './category-tabs.component.html',
  styleUrls: ['./category-tabs.component.scss']
})
export class CategoryTabsComponent {

  @Input() categories: Category[] = [];
  @Output() select = new EventEmitter<string | null>();

  activeCategoryId: string | null = null;

  selectCategory(categoryId: string | null): void {
    this.activeCategoryId = categoryId;
    this.select.emit(categoryId);
  }

  trackById(_: number, c: Category): string {
    return c.id;
  }
}