import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-info-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-info-sidebar.component.html',
})
export class ProductInfoSidebarComponent {
  @Input() category?: string;
  @Input() sku?: string;
  @Input() stock?: number;
  @Input() deliveryInfo: string[] = [];
  @Input() trustBadges: string[] = [];
}