import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features.component.html'
})
export class FeaturesComponent {
  features = [
    { icon: 'fa-truck-medical', title: 'Fast Delivery', desc: 'Medical-grade shipping' },
    { icon: 'fa-shield-heart', title: 'Certified', desc: 'FDA & ISO compliant' },
    { icon: 'fa-file-medical', title: 'Easy Returns', desc: 'Unused items only' },
    { icon: 'fa-headset', title: '24/7 Support', desc: 'Healthcare assistance' }
  ];
}

