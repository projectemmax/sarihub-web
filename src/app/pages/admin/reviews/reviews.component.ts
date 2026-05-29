import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminReviewsService } from '@app/services/admin/admin-reviews.service';
import { PendingReview } from '@app/models/dashboard.model';
import { SellerReviewsService } from '@app/services/seller/seller-reviews.service';
import { UserProfileService } from '@app/core/user/user-profile.service';
import { filter, take } from 'rxjs/operators';
import { getImageUrlCloudinary } from '@app/core/utils/image.util';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {

    reviews: PendingReview[] = [];
    loading = false;
    selectedReviews: string[] = [];

    isAdmin = false;
    isSeller = false;
    searchTerm = '';

    getImageUrlCloudinary = getImageUrlCloudinary;

    selectedReview: PendingReview | null = null;

    constructor(
        private reviewService: AdminReviewsService,
        private sellerReviewService: SellerReviewsService,
        private userProfileService: UserProfileService
    ) {}

    ngOnInit() {

    this.userProfileService.loadMyProfile();

    this.userProfileService
        .getProfile()
        .pipe(
            filter(profile => !!profile),
            take(1)
        )
        .subscribe(profile => {

            if (!profile) return;

            this.isAdmin = profile.role === 'ADMIN';
            this.isSeller = profile.role === 'SELLER';

            console.log("this.isSeller", this.isSeller);

            this.loadReviews();

        });

}

    // ===============================
    // LOAD REVIEWS
    // ===============================
    loadReviews() {

        console.log('IS SELLER', this.isSeller);
        console.log('SERVICE', this.isSeller ? 'SELLER' : 'ADMIN');

        console.log('sellerReviewService', this.sellerReviewService);

        this.loading = true;

        const request$ = this.isSeller
            ? this.sellerReviewService.getSellerReviews()
            : this.reviewService.getPendingReviews();

        request$
            .subscribe({
            next: (res: any) => {
                this.reviews = res;
                this.loading = false;

            },
            error: () => {

                this.reviews = [];
                this.loading = false;

            }
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

    // ============ MODAL ==============
    openImagesModal(review: PendingReview): void {
        this.selectedReview = review;
    }

    closeImagesModal(): void {
        this.selectedReview = null;
    }

    // ============ SEARCH ==============

    get filteredReviews(): PendingReview[] {
        if (!this.searchTerm.trim()) {
            return this.reviews;
        }

        const term = this.searchTerm.trim().toLowerCase();

        return this.reviews.filter(review =>
            review.product?.name?.toLowerCase().includes(term) ||
            review.comment?.toLowerCase().includes(term) ||
            `${review.user?.customer?.firstName ?? ''} ${review.user?.customer?.lastName ?? ''}`
                .toLowerCase()
                .includes(term)
        );
    }

    clearSearch(): void {
        this.searchTerm = '';
    }

}