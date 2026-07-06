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

    readonly DEFAULT_ZOOM = 1;
    readonly DOUBLE_CLICK_ZOOM = 2;
    readonly MIN_ZOOM = 1;
    readonly MAX_ZOOM = 4;
    readonly ZOOM_STEP = 0.25;
    zoomLevel = this.DEFAULT_ZOOM;

    translateX = 0;
    translateY = 0;

    isDragging = false;

    private dragStartX = 0;
    private dragStartY = 0;

    private startTranslateX = 0;
    private startTranslateY = 0;

    private readonly document = inject(DOCUMENT);

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen']) {
        this.toggleBodyScroll(this.isOpen);
        }
    }

    ngOnDestroy(): void {
        this.toggleBodyScroll(false);
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

    close(): void {
        this.resetZoom();
        this.closed.emit();
    }

    previous(): void {
        if (this.activeIndex === 0) {
            return;
        }

        this.resetZoom();

        this.activeIndexChange.emit(this.activeIndex - 1);
    }

    next(): void {
        if (this.activeIndex >= this.images.length - 1) {
            return;
        }

        this.resetZoom();

        this.activeIndexChange.emit(this.activeIndex + 1);
    }

    // KEYBOARD NAVIGATION

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

    // ZOOM FEATURES

    toggleZoom(): void {
        if (this.zoomLevel === this.DEFAULT_ZOOM) {
            this.zoomLevel = this.DOUBLE_CLICK_ZOOM;
            return;
        }
        this.resetZoom();
    }

    onWheel(event: WheelEvent): void {
        event.preventDefault();

        if (event.deltaY < 0) {

            this.zoomLevel = Math.min(
                this.zoomLevel + this.ZOOM_STEP,
                this.MAX_ZOOM
            );

        } else {

            this.zoomLevel = Math.max(
                this.zoomLevel - this.ZOOM_STEP,
                this.MIN_ZOOM
            );

            if (this.zoomLevel === this.DEFAULT_ZOOM) {
                this.resetZoom();
            }   
        }
    }

    get imageTransform(): string {
        return `
            translate(${this.translateX}px, ${this.translateY}px)
            scale(${this.zoomLevel})
        `;
    }

    onPointerDown(event: PointerEvent): void {
        if (this.zoomLevel === this.DEFAULT_ZOOM) {
            return;
        }

        this.isDragging = true;

        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;

        this.startTranslateX = this.translateX;
        this.startTranslateY = this.translateY;

        (event.target as HTMLElement).setPointerCapture(event.pointerId);
    }

    onPointerMove(event: PointerEvent): void {

        if (!this.isDragging) {
            return;
        }

        this.translateX =
            this.startTranslateX +
            (event.clientX - this.dragStartX);

        this.translateY =
            this.startTranslateY +
            (event.clientY - this.dragStartY);
    }

    onPointerUp(event: PointerEvent): void {
        this.isDragging = false;
        (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    }

    private resetZoom(): void {
        this.zoomLevel = this.DEFAULT_ZOOM;
        this.translateX = 0;
        this.translateY = 0;
        this.isDragging = false;
    }

    get isImmersiveMode(): boolean {
        return this.zoomLevel > this.DEFAULT_ZOOM && this.isDragging;
    }

}