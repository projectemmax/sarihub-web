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
  ViewChild,
  ElementRef,
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

    @ViewChild('lightboxImage')
    private imageRef!: ElementRef<HTMLImageElement>;

    @ViewChild('lightboxBackdrop')
    private backdropRef?: ElementRef<HTMLDivElement>;

    // ZOOM STATE
    readonly DEFAULT_ZOOM = 1;
    readonly DOUBLE_CLICK_ZOOM = 2;
    readonly MIN_ZOOM = 1;
    readonly MAX_ZOOM = 4;
    readonly ZOOM_STEP = 0.25;
    zoomLevel = this.DEFAULT_ZOOM;

    // DRAGGING STATE
    translateX = 0;
    translateY = 0;

    isDragging = false;

    private dragStartX = 0;
    private dragStartY = 0;

    private startTranslateX = 0;
    private startTranslateY = 0;

    // SWIPE STATE
    private touchStartX = 0;
    private touchStartY = 0;
    private touchCurrentX = 0;
    private touchCurrentY = 0;
    private isTouchSwipe = false;

    // DOUBLE TAP STATE
    private readonly SWIPE_THRESHOLD = 60;
    // private readonly DOUBLE_TAP_DELAY = 300;
    // private readonly DOUBLE_TAP_DISTANCE = 20;

    // PINCH STATE
    private activePointers = new Map<number, PointerEvent>();
    private initialPinchDistance = 0;
    private currentPinchDistance = 0;
    private initialPinchZoom = 1;

    // OTHERS STATE

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

    // NAVIGATION

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
        if (this.isDefaultZoom) {
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

            this.clampPan();

        } else {

            this.zoomLevel = Math.max(
                this.zoomLevel - this.ZOOM_STEP,
                this.MIN_ZOOM
            );

            if (this.isDefaultZoom) {
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
        if (event.pointerType === 'touch') {
            this.handleTouchPointerDown(event);
            return;
        }

        this.handleMousePointerDown(event);
    }

    onPointerMove(event: PointerEvent): void {
        if (event.pointerType === 'touch') {
            this.handleTouchPointerMove(event);
            return;
        }

        this.handleMousePointerMove(event);
    }

    onPointerUp(event: PointerEvent): void {
        if (event.pointerType === 'touch') {
            this.handleTouchPointerUp(event);
            return;
        }

        this.handleMousePointerUp(event);
    }

    onPointerCancel(event: PointerEvent): void {

        if (event.pointerType === 'touch') {
            this.handleTouchPointerCancel(event);
            return;
        }

        this.isDragging = false;
    }

    //MOUSE POINTER HANDLERS

    private handleMousePointerMove(event: PointerEvent): void {

        if (!this.isDragging) {
            return;
        }

        this.translateX =
            this.startTranslateX +
            (event.clientX - this.dragStartX);

        this.translateY =
            this.startTranslateY +
            (event.clientY - this.dragStartY);
        
        this.clampPan();
    }

    private handleMousePointerDown(event: PointerEvent): void {
        if (this.isDefaultZoom) {
            return;
        }

        this.isDragging = true;

        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;

        this.startTranslateX = this.translateX;
        this.startTranslateY = this.translateY;

        (event.target as HTMLElement).setPointerCapture(event.pointerId);
    }

    private handleMousePointerUp(event: PointerEvent): void {
        this.isDragging = false;
        (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    }

    // TOUCH POINTER HANDLERS

    private handleTouchPointerMove(event: PointerEvent): void {
        // Update tracked pointer
        if (this.activePointers.has(event.pointerId)) {
            this.activePointers.set(event.pointerId, event);
        }

        // Swipe tracking
        if (
            this.activePointers.size === 1 &&
            this.isDefaultZoom
        ) {
            this.touchCurrentX = event.clientX;
            this.touchCurrentY = event.clientY;

            this.isTouchSwipe =
                Math.abs(this.touchCurrentX - this.touchStartX) >
                this.SWIPE_THRESHOLD;

            return;
        }

        if (
            this.activePointers.size === 1 &&
            !this.isDefaultZoom &&
            this.isDragging
        ) {
            this.translateX =
                this.startTranslateX +
                (event.clientX - this.dragStartX);

            this.translateY =
                this.startTranslateY +
                (event.clientY - this.dragStartY);
            
            this.clampPan();

            return;
        }

        // Two fingers = pinch
        if (this.activePointers.size === 2) {
            const pointers = Array.from(this.activePointers.values());

            this.currentPinchDistance = this.getPointerDistance(
                pointers[0],
                pointers[1]
            );

            if (this.initialPinchDistance === 0) {
                return;
            }

            const scale = this.currentPinchDistance / this.initialPinchDistance;

            const newZoom = this.initialPinchZoom * scale;

            this.zoomLevel = Math.min(
                this.MAX_ZOOM,
                Math.max(this.MIN_ZOOM, newZoom)
            );

            this.clampPan();
        }
    }

    private handleTouchPointerDown(event: PointerEvent): void {

        // Register the new touch pointer
        this.activePointers.set(event.pointerId, event);

        if (
            !this.isDefaultZoom &&
            this.activePointers.size === 1
        ) {
            this.isDragging = true;

            this.dragStartX = event.clientX;
            this.dragStartY = event.clientY;

            this.startTranslateX = this.translateX;
            this.startTranslateY = this.translateY;

            return;
        }

        // First finger → start swipe tracking
        if (this.activePointers.size === 1) {
            this.touchStartX = event.clientX;
            this.touchStartY = event.clientY;

            this.touchCurrentX = event.clientX;
            this.touchCurrentY = event.clientY;

            this.isTouchSwipe = false;
        }

        // Second finger → initialize pinch
        if (this.activePointers.size === 2) {

            const pointers = Array.from(this.activePointers.values());

            this.initialPinchDistance = this.getPointerDistance(
                pointers[0],
                pointers[1]
            );

            this.currentPinchDistance = this.initialPinchDistance;
            this.initialPinchZoom = this.zoomLevel;

            this.isDragging = false;
        }
    }

    private handleTouchPointerUp(event: PointerEvent): void {
        
        this.isDragging = false;

        this.activePointers.delete(event.pointerId);

        if (
            this.isDefaultZoom &&
            this.isTouchSwipe
        ) {
            const deltaX = this.touchCurrentX - this.touchStartX;
            const deltaY = this.touchCurrentY - this.touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX < 0) {
                    this.next();
                } else {
                    this.previous();
                }
            }
        }

        if (this.activePointers.size < 2) {
            this.initialPinchDistance = 0;
            this.currentPinchDistance = 0;
        }

        this.isTouchSwipe = false;
    }

    private handleTouchPointerCancel(event: PointerEvent): void {

        this.activePointers.delete(event.pointerId);

        this.isDragging = false;
        this.isTouchSwipe = false;

        this.initialPinchDistance = 0;
        this.currentPinchDistance = 0;
    }

    // UTILITY METHODS

    private resetZoom(): void {
        this.zoomLevel = this.DEFAULT_ZOOM;
        this.translateX = 0;
        this.translateY = 0;
        this.isDragging = false;
    }

    get isImmersiveMode(): boolean {
        return !this.isDefaultZoom && this.isDragging;
    }

    private getPointerDistance(
        first: PointerEvent,
        second: PointerEvent
    ): number {
        return Math.hypot(
            second.clientX - first.clientX,
            second.clientY - first.clientY
        );
    }

    private get isDefaultZoom(): boolean {
        return Math.abs(
            this.zoomLevel - this.DEFAULT_ZOOM
        ) < 0.01;
    }

    private clampPan(): void {

        if (!this.imageRef || !this.backdropRef) {
            return;
        }

        const image = this.imageRef.nativeElement;
        const backdrop = this.backdropRef?.nativeElement;

        if (!backdrop) {
            return;
        }

        const scaledWidth =
            image.clientWidth * this.zoomLevel;

        const scaledHeight =
            image.clientHeight * this.zoomLevel;

        // Temporary values matching the CSS padding.
        // We'll refactor these into constants later.
        const viewportWidth = backdrop.clientWidth - 64;
        const viewportHeight = backdrop.clientHeight - 96;

        const maxX = Math.max(
            0,
            (scaledWidth - viewportWidth) / 2
        );

        const maxY = Math.max(
            0,
            (scaledHeight - viewportHeight) / 2
        );

        this.translateX = Math.max(
            -maxX,
            Math.min(maxX, this.translateX)
        );

        this.translateY = Math.max(
            -maxY,
            Math.min(maxY, this.translateY)
        );

    }
    

}