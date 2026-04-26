import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html'
})
export class PaginationComponent {

  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() maxPagesToShow = 5;

  @Output() pageChange = new EventEmitter<number>();

  get pages(): number[] {
    const half = Math.floor(this.maxPagesToShow / 2);

    let start = Math.max(this.currentPage - half, 1);
    let end = Math.min(start + this.maxPagesToShow - 1, this.totalPages);

    if (end - start + 1 < this.maxPagesToShow) {
      start = Math.max(end - this.maxPagesToShow + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  change(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pageChange.emit(page);
  }
}
