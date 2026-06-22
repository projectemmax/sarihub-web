import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output
} from '@angular/core';

import {
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { MediaPickerComponent } from "@app/shared/media-picker/media-picker.component";
import { ToastService } from "@app/core/services/toast.service";
import { MediaService } from '@app/core/services/media.service';

@Component({
  selector: 'app-brand-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MediaPickerComponent,
],
  templateUrl: './brand-form-modal.component.html',
  styleUrls: ['./brand-form-modal.component.scss']
})
export class BrandFormModalComponent {

    toast = inject(ToastService);
    mediaService = inject(MediaService);
    showLogoPicker = false;

    @Input() visible = false;

    @Input() title = 'Create Brand';

    @Input() form!: FormGroup;

    @Input() submitting = false;

    @Output() save = new EventEmitter<void>();

    @Output() close = new EventEmitter<void>();

    uploadingLogo = false;

    toggleLogoPicker() {
        this.showLogoPicker = !this.showLogoPicker;
    }

    onImageError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/images/image-placeholder.png';
    }

    onLogoSelected(url: string) {
    console.log('SELECTED URL', url);

    this.form.patchValue({
        logoUrl: url
    });

    console.log('FORM AFTER PATCH', this.form.value);

    this.showLogoPicker = false;

    this.toast.success('Logo selected');
}

    


}