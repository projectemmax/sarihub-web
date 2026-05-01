import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Constant } from '@app/services/constant/constant';
import { StorefrontProductService } from '@app/services/storefront/storefront-product.service';
import { map, shareReplay, tap } from 'rxjs';
import { getItemImage, getProductImageUrl } from '@app/core/utils/image.util';
import { RatingComponent } from '../rating/rating.component';

@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [CommonModule, RouterModule, RatingComponent],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.css'
})
export class FeaturedProductsComponent {
  private storefrontProductService = inject(StorefrontProductService);

  getProductImageUrl = getProductImageUrl

  products$ = this.storefrontProductService
    .getProducts({
      page: 1,
      limit: 3,  // ✅ LIMIT TO 3
      isFeatured: true,
    })
    .pipe(
      tap(res => res.data),
      map(res => res.data),
      shareReplay(1)
    );

  stars = [1, 2, 3, 4, 5];
  rating = 4;


}
