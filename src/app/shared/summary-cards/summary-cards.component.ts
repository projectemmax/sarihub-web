import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-summary-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary-cards.component.html',
  styleUrls: ['./summary-cards.component.css']
})
export class SummaryCardsComponent {

  @Input() total = 0;
  @Input() completed = 0;
  @Input() canceled = 0;
  @Input() revenue = 0;
  @Input() discount = 0;

}
