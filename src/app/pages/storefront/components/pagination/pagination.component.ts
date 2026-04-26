import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() totalPages = 1;

  @Output() pageChange = new EventEmitter<number>();

  get pages(): number[] {
    const visible = 5; // how many page numbers to show
    const start = Math.max(1, this.page - Math.floor(visible / 2));
    const end = Math.min(this.totalPages, start + visible - 1);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goTo(page: number) {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.pageChange.emit(page);
  }
}