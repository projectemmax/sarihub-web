import { CommonModule } from '@angular/common';
import { Component, Input, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { Product } from '@app/models/product.model';
import { ProductCardComponent } from "../product-card/product-card.component";

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './product-carousel.component.html',
  styleUrl: './product-carousel.component.css',
})
export class ProductCarouselComponent {
  @Input() title?: string;
  @Input() items: Product[] = [];
}
