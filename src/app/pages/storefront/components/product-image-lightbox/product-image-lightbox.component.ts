import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  HostListener,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';

import { GalleryImage, GalleryImageType } from '@app/models/storefront/gallery-image.model';
import { getImageUrl as resolveImageUrl, getImageUrlCloudinary } from '@app/core/utils/image.util';
import { CloudinaryImageSize } from '@app/core/constants/cloudinary-image-size';

@Component({
  selector: 'app-product-image-lightbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-image-lightbox.component.html',
  styleUrl: './product-image-lightbox.component.scss',
})
export class ProductImageLightboxComponent implements OnChanges, OnDestroy {

    @Input()
    images: GalleryImage[] = [];

    @Input()
    activeIndex = 0;

    @Input()
    isOpen = false;

    @Output()
    closed = new EventEmitter<void>();

    @Output()
    activeIndexChange = new EventEmitter<number>();

    private readonly document = inject(DOCUMENT);

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen']) {
        this.toggleBodyScroll(this.isOpen);
        }
    }

    ngOnDestroy(): void {
        this.toggleBodyScroll(false);
    }

    close(): void {
        this.closed.emit();
    }

    onBackdropClick(): void {
        this.close();
    }

    onContentClick(event: MouseEvent): void {
        event.stopPropagation();
    }

    getImageUrl(image: GalleryImage): string {

        if (image.type === GalleryImageType.PRODUCT) {
            return resolveImageUrl(image.imageSource);
        }

        return getImageUrlCloudinary(
            image.imageSource,
            CloudinaryImageSize.ZOOM
        );
    }

    private toggleBodyScroll(lock: boolean): void {
        this.document.body.style.overflow = lock ? 'hidden' : '';
    }

    get currentImage(): GalleryImage | undefined {
        return this.images[this.activeIndex];
    }

    previous(): void {
        if (this.activeIndex === 0) {
            return;
        }

        this.activeIndexChange.emit(this.activeIndex - 1);
    }

    next(): void {
        if (this.activeIndex >= this.images.length - 1) {
            return;
        }

        this.activeIndexChange.emit(this.activeIndex + 1);
    }

    //KEYBOARD NAVIGATION

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {

        if (!this.isOpen) {
            return;
        }

        switch (event.key) {

            case 'Escape':
                event.preventDefault();
                this.close();
                break;

            case 'ArrowLeft':
                event.preventDefault();
                this.previous();
                break;

            case 'ArrowRight':
                event.preventDefault();
                this.next();
                break;
        }
    }

}