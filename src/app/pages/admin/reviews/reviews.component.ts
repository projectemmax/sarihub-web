import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminReviewsService } from '@app/services/admin/admin-reviews.service';
import { PendingReview } from '@app/models/dashboard.model';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {

  reviews: PendingReview[] = [];

  loading = false;

  selectedReviews: string[] = [];

  constructor(private reviewService: AdminReviewsService) {}

  ngOnInit() {
    this.loadReviews();
  }

  // ===============================
  // LOAD REVIEWS
  // ===============================
  loadReviews() {

    this.loading = true;

    this.reviewService.getPendingReviews()
      .subscribe((res: any) => {

        this.reviews = res;
        this.loading = false;

      });
  }

  // ===============================
  // CHECKBOX SELECTION
  // ===============================
  toggleReview(id: string, event: any) {

    if (event.target.checked) {
      this.selectedReviews.push(id);
    } else {
      this.selectedReviews =
        this.selectedReviews.filter(r => r !== id);
    }

  }

  isSelected(id: string) {
    return this.selectedReviews.includes(id);
  }

  // ===============================
  // SELECT ALL
  // ===============================
  toggleSelectAll(event: any) {

    if (event.target.checked) {
      this.selectedReviews = this.reviews.map(r => r.id);
    } else {
      this.selectedReviews = [];
    }

  }

  // ===============================
  // SINGLE ACTIONS
  // ===============================
  approveReview(id: string) {

    this.reviewService.approveReview(id)
      .subscribe(() => {
        this.loadReviews();
      });

  }

  rejectReview(id: string) {

    this.reviewService.rejectReview(id)
      .subscribe(() => {
        this.loadReviews();
      });

  }

  // ===============================
  // BULK ACTIONS
  // ===============================
  bulkApprove() {

    if (!this.selectedReviews.length) return;

    this.reviewService.bulkApprove(this.selectedReviews)
      .subscribe(() => {

        this.selectedReviews = [];
        this.loadReviews();

      });

  }

  bulkReject() {

    if (!this.selectedReviews.length) return;

    this.reviewService.bulkReject(this.selectedReviews)
      .subscribe(() => {

        this.selectedReviews = [];
        this.loadReviews();

      });

  }

}