import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="range-filter">
      <span
        *ngFor="let r of ranges"
        (click)="select(r)"
        [class.active]="selected === r"
      >
        {{ r }}
      </span>
    </div>
  `,
  styles: [`
    .range-filter {
      display: flex;
      gap: 16px;
      cursor: pointer;
      font-weight: 500;
    }

    .range-filter span {
      position: relative;
      color: #6b7280;
      transition: all 0.2s ease;
    }

    .range-filter span:hover {
      color: #111827;
    }

    .range-filter span.active {
      color: #2563eb;
      font-weight: 600;
    }

    .range-filter span.active::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 100%;
      height: 2px;
      background: #2563eb;
      border-radius: 2px;
    }
  `]
})
export class FiltersComponent {
  @Output() change = new EventEmitter<'1D' | '7D' | '1M' | '1Y'>();

  ranges: ('1D' | '7D' | '1M' | '1Y')[] = ['1D', '7D', '1M', '1Y'];

  selected: '1D' | '7D' | '1M' | '1Y' = '7D';

  select(r: '1D' | '7D' | '1M' | '1Y') {
    this.selected = r;
    this.change.emit(r);
  }
}