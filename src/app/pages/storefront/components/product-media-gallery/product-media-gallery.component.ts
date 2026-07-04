import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { getImageUrl as resolveImageUrl, getImageUrlCloudinary, getProductImageUrl } from '@app/core/utils/image.util';
import { ProductVariant } from '@app/models/product-variant.model';
import { Product } from '@app/models/product.model';

export const CloudinaryImageSize = {
    THUMBNAIL: 120,
    PREVIEW: 800,
    ZOOM: 1400
} as const;

@Component({
  selector: 'app-product-media-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-media-gallery.component.html',
  styleUrl: './product-media-gallery.component.css'
})
export class ProductMediaGalleryComponent implements AfterViewInit {
    @Input({ required: true })
    product!: Product;

    @ViewChild('thumbnailContainer')
    thumbnailContainer!: ElementRef<HTMLDivElement>;

    @Input()
    selectedVariant: ProductVariant | null = null;

    displayImageUrl: string | null = null;
    canScrollLeft = false;
    canScrollRight = false;

    getProductImageUrl = getProductImageUrl;

    ngOnChanges(changes: SimpleChanges) {
        if (changes['selectedVariant']) {
            this.updateDisplayedImage();
        }
    }

    ngAfterViewInit(): void {
        this.updateScrollButtons();
    }

    getImageUrl(path?: string): string {
        if (!path) {
        return 'assets/no-image.png';
        }

        return resolveImageUrl(path);
    }

     getMainImageUrl(product: Product): string {
        return this.displayImageUrl || this.getProductImageUrl(product);
    }

    getProductThumbnails(product: Product): string[] {
        if (product.images?.length) {
            return [...product.images]
                .sort((a, b) => {
                    if (a.isPrimary) return -1;
                    if (b.isPrimary) return 1;

                    return (a.order ?? 0) - (b.order ?? 0);
                })
                .map(image => this.getImageUrl(image.url));
        }

        return [this.getProductImageUrl(product)];
    }

    selectProductImage(imageUrl: string) {
        this.displayImageUrl = imageUrl;
    }

    // Media Gallery Scroll Controls
    scrollLeft(): void {
        const distance = this.getThumbnailScrollDistance();

        this.thumbnailContainer.nativeElement.scrollBy({
            left: -distance,
            behavior: 'smooth'
        });
    }

    scrollRight(): void {
        const container = this.thumbnailContainer.nativeElement;
        const distance = this.getThumbnailScrollDistance();

        container.scrollBy({
            left: distance,
            behavior: 'smooth'
        });
    }

    private getThumbnailScrollDistance(): number {
        if (!this.thumbnailContainer) {
            return 0;
        }

        const container = this.thumbnailContainer.nativeElement;

        const thumbnail = container.querySelector<HTMLElement>('.product-thumbnail');

        if (!thumbnail) {
            return 0;
        }

        const containerStyle = window.getComputedStyle(container);

        const gap = parseFloat(containerStyle.columnGap) || parseFloat(containerStyle.gap) || 0;

        return thumbnail.offsetWidth + gap;
    }

    private updateDisplayedImage(): void {
        if (this.selectedVariant?.image) {
            this.displayImageUrl =
                getImageUrlCloudinary(this.selectedVariant.image, CloudinaryImageSize.PREVIEW);
            return;
        }

        this.displayImageUrl = this.getProductImageUrl(this.product);
    }

    public updateScrollButtons(): void {
        if (!this.thumbnailContainer) {
            return;
        }

        const container = this.thumbnailContainer.nativeElement;

        this.canScrollLeft = container.scrollLeft > 0;

        this.canScrollRight =
            container.scrollLeft + container.clientWidth < container.scrollWidth - 1;
    }

    onThumbnailScroll(): void {
        this.updateScrollButtons();
    }

    

}
