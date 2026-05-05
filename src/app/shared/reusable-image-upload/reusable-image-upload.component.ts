import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { CommonModule } from '@angular/common';

export interface UploadImage {
  file?: File | null;
  preview: string;
  isPrimary?: boolean;
}

@Component({
  selector: 'app-reusable-image-upload',
  standalone: true,
  imports: [CommonModule, NgxDropzoneModule],
  templateUrl: './reusable-image-upload.component.html',
  styleUrl: './reusable-image-upload.component.css'
})
export class ReusableImageUploadComponent {
    @Input() images: UploadImage[] = [];
    @Input() multiple = true;

    @Output() imagesChange = new EventEmitter<UploadImage[]>();

    onSelect(event: any) {
        event.addedFiles.forEach((file: File) => {
        const reader = new FileReader();

        reader.onload = () => {
            this.images.push({
                file,
                preview: reader.result as string,
                isPrimary: this.images.length === 0
            });

            this.emit();
        };

        reader.readAsDataURL(file);
        });
    }

    removeImage(index: number) {
        this.images.splice(index, 1);
        this.imagesChange.emit(this.images);
    }

    setPrimary(index: number) {
        this.images = this.images.map((img, i) => ({
            ...img,
            isPrimary: i === index
        }));

        this.emit();
    }

    moveImage(index: number, dir: 'left' | 'right') {
        const newIndex = dir === 'left' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= this.images.length) return;

        const temp = this.images[index];
        this.images[index] = this.images[newIndex];
        this.images[newIndex] = temp;

        this.emit();
    }

    emit() {
        this.imagesChange.emit(this.images);
    }
}
