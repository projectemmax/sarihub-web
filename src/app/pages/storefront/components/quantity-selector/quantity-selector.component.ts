import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quantity-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quantity-selector.component.html',
  styleUrls: ['./quantity-selector.component.scss']
})
export class QuantitySelectorComponent {
    @Input() quantity = 1;
    @Input() min = 1;
    @Input() max = 999;
    @Input() disabled = false;
    @Input() size: 'sm' | 'md' = 'md';

    @Output() quantityChange = new EventEmitter<number>();

    tempQuantity = 1;

    ngOnChanges(): void {
        this.tempQuantity = this.quantity;
    }

    decrease(): void {
        if (this.disabled) return;

        const next = Math.max(this.min, this.quantity - 1);
        this.emitQuantity(next);
    }

    increase(): void {
        if (this.disabled) return;

        const next = Math.min(this.max, this.quantity + 1);
        this.emitQuantity(next);
    }

    onInputChange(): void {
        if (this.tempQuantity == null || isNaN(Number(this.tempQuantity))) {
        this.tempQuantity = this.min;
        }
    }

    applyInput(): void {
        let value = Number(this.tempQuantity);

        if (isNaN(value)) {
        value = this.min;
        }

        value = Math.max(this.min, value);
        value = Math.min(this.max, value);

        this.tempQuantity = value;
        this.emitQuantity(value);
    }

    private emitQuantity(value: number): void {
        this.quantity = value;
        this.tempQuantity = value;
        this.quantityChange.emit(value);
    }
}