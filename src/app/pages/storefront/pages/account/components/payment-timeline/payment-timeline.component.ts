import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-payment-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-timeline.component.html',
  styleUrls: ['./payment-timeline.component.scss']
})
export class PaymentTimelineComponent {
    @Input() attempts: any[] = [];
    @Input() onRetry!: () => void;

    getStatusClass(status: string) {
        switch (status) {
        case 'PAID': return 'success';
        case 'FAILED': return 'failed';
        case 'EXPIRED': return 'expired';
        case 'PENDING': return 'pending';
        default: return '';
        }
    }

    isLatest(attempt: any) {
        return attempt === this.attempts[0]; // assuming sorted desc
    }
}