import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { getImageUrl as resolveImageUrl, getImageUrlCloudinary, getProductImageUrl } from '@app/core/utils/image.util';
import { Product } from '@app/models/product.model';

@Component({
  selector: 'app-product-media-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-media-gallery.component.html',
  styleUrl: './product-media-gallery.component.css'
})
export class ProductMediaGalleryComponent {
    @Input({ required: true })
    product!: Product;

    @ViewChild('thumbnailContainer')
    thumbnailContainer!: ElementRef<HTMLDivElement>;

    displayImageUrl: string | null = null;

    getProductImageUrl = getProductImageUrl;

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
    scrollLeft() {
        this.thumbnailContainer.nativeElement.scrollBy({
            left:-200,
            behavior:'smooth'
        });
    }

    scrollRight() {
        this.thumbnailContainer.nativeElement.scrollBy({
            left:200,
            behavior:'smooth'
        });
    }

}
