import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Review } from '@app/models/storefront/review.model';
import { RatingComponent } from '../rating/rating.component';
import { StorefrontReviewService } from '@app/services/storefront/storefront-review.service';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule, RatingComponent],
  templateUrl: './review-list.component.html',
})
export class ReviewListComponent {
  @Input() reviews: Review[] = [];

  constructor(private storefrontReviewService: StorefrontReviewService) {}

  getReviewerName(review: any): string {
    const c = review?.user?.customer;
    if (!c) return 'Anonymous';

    return `${c.firstName} ${c.lastName.charAt(0)}.`;
  }

  voting = false;

  vote(review: Review) {
    this.storefrontReviewService.voteReview(review.id)
      .subscribe((res: any) => {
        review.helpfulCount = res.helpfulCount;
      });
  }

}

