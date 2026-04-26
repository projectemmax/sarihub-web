import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AdditionalFilter =
  | 'featured'
  | 'bestSeller'
  | 'inStock'
  | 'new'
  | null;

@Component({
  selector: 'app-additional-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './additional-filter.component.html',
  styleUrl: './additional-filter.component.css'
})
export class AdditionalFilterComponent {
  @Input() value: AdditionalFilter = null;
  @Input() disabled = false;

  @Output() filterChange = new EventEmitter<AdditionalFilter>();

  select(value: AdditionalFilter) {
    this.filterChange.emit(value);
  }

  isActive(val: AdditionalFilter) {
    return this.value === val;
  }
}
