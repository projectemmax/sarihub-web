import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type SkeletonVariant =
  | 'default'
  | 'reviews'
  | 'orders'
  | 'products';

@Component({
  selector: 'app-table-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-skeleton.component.html',
  styleUrls: ['./table-skeleton.component.scss']
})
export class TableSkeletonComponent {
    @Input() rows = 5;

    @Input() columns = 5;

    @Input() showHeader = true;

    @Input() variant: SkeletonVariant = 'default';

    @Input() columnWidths: string[] = [];

    get columnArray(): number[] {
        return Array(this.columns).fill(0);
    }

    get rowArray(): number[] {
        return Array(this.rows).fill(0);
    }

}