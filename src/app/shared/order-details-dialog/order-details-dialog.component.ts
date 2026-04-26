import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AdminOrdersService } from '@app/services/admin/admin-orders.service';
import { getItemImage, getProductImageUrl } from '@app/core/utils/image.util';

@Component({
  selector: 'app-order-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './order-details-dialog.component.html',
  styleUrls: ['./order-details-dialog.component.css']

})
export class OrderDetailsDialogComponent implements OnInit {
    order: any;
    getItemImage = getItemImage;

    constructor(
        @Inject(MAT_DIALOG_DATA) private orderId: string,
        private ordersService: AdminOrdersService,
    ) {}

    ngOnInit(): void {
        this.ordersService.getOrder(this.orderId).subscribe((res: any) => {
        this.order = res.data;
        });
    }
}