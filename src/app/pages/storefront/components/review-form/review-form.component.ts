import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { StarInputComponent } from
  '../star-input/star-input.component';
import { StorefrontReviewService } from '@app/services/storefront/storefront-review.service';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StarInputComponent, // 🔥 REQUIRED
  ],
  templateUrl: './review-form.component.html',
})
export class ReviewFormComponent {

  @Output() submitReview = new EventEmitter<{
    rating: number;
    comment?: string;
    files: File[];
  }>();

  @Input() uploading = false;
  @Input() uploadProgress = 0;

  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  form = this.fb.group({
    comment: ['', Validators.required],
    rating: [0, Validators.min(1)],
  });

  constructor(
    private fb: FormBuilder,
    private storefrontReviewService: StorefrontReviewService
  ) {}

  onFilesSelected(event: any) {
    const files = Array.from(event.target.files) as File[];

    if (this.selectedFiles.length + files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    files.forEach(file => {
      this.selectedFiles.push(file);
      this.previewUrls.push(URL.createObjectURL(file));
    });

    // reset input so same file can be re-selected
    event.target.value = '';
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    URL.revokeObjectURL(this.previewUrls[index]);
    this.previewUrls.splice(index, 1);
  }

  uploadImages(reviewId: string) {

    const formData = new FormData();

    this.selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    this.uploading = true;
    this.uploadProgress = 0;

    this.storefrontReviewService.uploadReviewImages(reviewId, formData)
      .subscribe(event => {

        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round(
            (100 * event.loaded) / event.total
          );
        }

        if (event.type === HttpEventType.Response) {
          this.uploading = false;
        }

      });
  }

  submit() {
    if (this.form.invalid) return;

    this.submitReview.emit({
      ...this.form.value,
      files: this.selectedFiles
    } as any);

    this.form.reset({ rating: 0 });

    this.selectedFiles = [];
    this.previewUrls = [];

  }
}