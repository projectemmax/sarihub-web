import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';

export interface PriceRangeValue {
  min: number;
  max: number;
}

@Component({
  selector: 'app-price-range',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './price-range.component.html',
  styleUrl: './price-range.component.css'
})
export class PriceRangeComponent {
  @Input() min = 0;
  @Input() max = 5000;

  @Input() value!: PriceRangeValue;

  @Output() priceChange = new EventEmitter<PriceRangeValue>();
  @Output() clear = new EventEmitter<void>();

  private change$ = new Subject<PriceRangeValue>();

  constructor() {
    this.change$
      .pipe(debounceTime(300))
      .subscribe(value => this.priceChange.emit(value));
  }

  ngOnDestroy() {
    this.change$.complete();
  }

  onMinInput(value: number) {
    this.change$.next({
      min: Math.min(value, this.value.max),
      max: this.value.max,
    });
  }

  onMaxInput(value: number) {
    this.change$.next({
      min: this.value.min,
      max: Math.max(value, this.value.min),
    });
  }

  onClear() {
    this.clear.emit();
  }
}
