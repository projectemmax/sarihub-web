import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-input.component.html',
})
export class StarInputComponent {
  @Input() value = 0;
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<number>();

  setRating(rating: number) {
    if (this.disabled) return;
    this.valueChange.emit(rating);
  }

  stars = [1, 2, 3, 4, 5];
}