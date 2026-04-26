import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface OrderStatusHistory {
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-order-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-timeline.component.html',
  styleUrl: './order-timeline.component.css'
})
export class OrderTimelineComponent {
  @Input() history: OrderStatusHistory[] = [];

  timeline = [
    'PLACED',
    'PAID',
    'SHIPPED',
    'DELIVERED',
  ];

  isCompleted(status: string): boolean {
    return this.history.some(h => h.status === status);
  }

  getTimestamp(status: string): string | null {
    const item = this.history.find(h => h.status === status);
    return item ? item.createdAt : null;
  }
}
