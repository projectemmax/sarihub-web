import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AdminOrder } from '@app/models/order.model';

@Component({
  selector: 'app-ship-order-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './ship-order-dialog.component.html',
  styleUrl: './ship-order-dialog.component.css',
})
export class ShipOrderDialogComponent {
    readonly form = this.fb.group({
        courierName: ['J&T Express', Validators.required],
        courierCode: ['jnt', Validators.required],
        trackingNumber: ['', Validators.required],
        shippingMethod: ['drop_off'],
        shippingFee: [this.data.shippingFee ?? 0, [Validators.min(0)]],
        remarks: [''],
    });

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<ShipOrderDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: AdminOrder,
    ) {}

    submit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.dialogRef.close(this.form.getRawValue());
    }
}
