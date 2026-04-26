import { Component, EventEmitter, Input, Output } from '@angular/core';

export type SortOption =
  | ''
  | 'price_asc'
  | 'price_desc'
  | 'rating'
  | 'latest';

@Component({
  selector: 'app-sort-dropdown',
  standalone: true,
  templateUrl: './sort-dropdown.component.html',
})
export class SortDropdownComponent {
  @Input() value: SortOption = '';
  @Output() sortChange = new EventEmitter<SortOption>();

  onChange(value: string) {
    this.sortChange.emit(value as SortOption);
  }
}