import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { getImageUrl as resolveImageUrl, getImageUrlCloudinary, getProductImageUrl } from '@app/core/utils/image.util';
import { ProductVariant } from '@app/models/product-variant.model';
import { Product } from '@app/models/product.model';
import { GalleryImage, GalleryImageType } from '@app/models/storefront/gallery-image.model';

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
    galleryImages: GalleryImage[] = [];
    activeGalleryImage?: GalleryImage;

    canScrollLeft = false;
    canScrollRight = false;

    getProductImageUrl = getProductImageUrl;

    ngOnChanges(changes: SimpleChanges) {
        if (changes['product']) {
            this.buildGalleryImages();
        }

        if (changes['selectedVariant']) {
            this.syncGallerySelection();
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

    private buildGalleryImages(): void {

        this.galleryImages = [];

        if (!this.product?.images?.length) {
            return;
        }

        const sortedImages = [...this.product.images].sort((a, b) => {

            if (a.isPrimary) return -1;
            if (b.isPrimary) return 1;

            return (a.order ?? 0) - (b.order ?? 0);

        });

        this.galleryImages = sortedImages.map(image => ({
            id: image.id ?? image.url,
            imageUrl: this.getImageUrl(image.url),
            type: GalleryImageType.PRODUCT,
            isPrimary: image.isPrimary
        }));

        for (const variant of this.product.variants ?? []) {

            if (!variant.image) {
                continue;
            }

            this.galleryImages.push({
                id: variant.id,
                imageUrl: getImageUrlCloudinary(
                    variant.image,
                    CloudinaryImageSize.THUMBNAIL
                ),
                type: GalleryImageType.VARIANT,
                isPrimary: false,

                variantId: variant.id,
                variantName: variant.attributes.join(' / ')
            });

        }

        if (this.galleryImages.length > 0) {
            this.activeGalleryImage = this.getDefaultGalleryImage();

            if (this.activeGalleryImage) {
                this.displayImageUrl = this.activeGalleryImage.imageUrl;
            }
        }

        console.table(this.galleryImages);
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

    selectProductImage(image: GalleryImage): void {
        this.activeGalleryImage = image;
        this.displayImageUrl = image.imageUrl;
    }

    trackByGalleryImage(index: number, image: GalleryImage): string {
        return image.id;
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

    private syncGallerySelection(): void {

        if (this.selectedVariant?.image) {

            const galleryImage =
                this.findGalleryImageForVariant(this.selectedVariant);

            if (galleryImage) {
                this.activeGalleryImage = galleryImage;
            }

            this.displayImageUrl = getImageUrlCloudinary(
                this.selectedVariant.image,
                CloudinaryImageSize.PREVIEW
            );

            return;
        }

        this.activeGalleryImage = this.getDefaultGalleryImage();

        this.displayImageUrl =
            this.getProductImageUrl(this.product);

    }

    private findGalleryImageForVariant(
        variant: ProductVariant
    ): GalleryImage | undefined {

        return this.galleryImages.find(image =>
            image.type === GalleryImageType.VARIANT &&
            image.variantId === variant.id
        );

    }

    private getDefaultGalleryImage(): GalleryImage | undefined {

        return this.galleryImages.find(image => image.isPrimary)
            ?? this.galleryImages[0];

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
