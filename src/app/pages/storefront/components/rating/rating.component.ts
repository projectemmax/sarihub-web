import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating.component.html',
})
export class RatingComponent {

  @Input() rating = 0;          // e.g. 4.3
  @Input() max = 5;
  @Input() showCount = false;
  @Input() count = 0;

  get fullStars(): number {
    return Math.floor(this.rating);
  }

  get hasHalfStar(): boolean {
    return this.rating % 1 >= 0.5;
  }

  get emptyStars(): number {
    return this.max - this.fullStars - (this.hasHalfStar ? 1 : 0);
  }
}