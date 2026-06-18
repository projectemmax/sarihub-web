import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-brand-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './brand-form-modal.component.html',
  styleUrls: ['./brand-form-modal.component.scss']
})
export class BrandFormModalComponent {

  @Input() visible = false;

  @Input() title = 'Create Brand';

  @Input() form!: FormGroup;

  @Input() submitting = false;

  @Output() save = new EventEmitter<void>();

  @Output() close = new EventEmitter<void>();

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/image-placeholder.png';
  }

}