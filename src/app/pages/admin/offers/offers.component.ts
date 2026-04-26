import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  BehaviorSubject,
  combineLatest,
  map,
  shareReplay,
  switchMap
} from 'rxjs';

import { OfferService } from '@app/services/offer/offer.service';
import { Offer } from '@app/models/offer.model';
import { ApiResponse } from '@app/models/api-response.model';

import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { OfferPayload } from '@app/models/offer-payload.model';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './offers.component.html'
})
export class OffersComponent implements OnInit {

  readonly pageSize = 8;

  // UI
  isLoading = false;
  private readonly STORAGE_KEY = 'offers_ui_edits';


  // Modal State
  isOfferModalVisible = false;

  offerObj: OfferPayload = {
    offerName: '',
    offerImageUrl: '',
    offerPercentDiscount: 0,
    isActive: true
  };

  // Edit State
  isEditMode = false;
  editingOfferId: number | null = null;

  onEditOffer(offer: Offer): void {
    this.isEditMode = true;
    this.editingOfferId = offer.offerId;

    this.offerObj = {
      offerName: offer.offerName,
      offerImageUrl: offer.offerImageUrl,
      offerPercentDiscount: offer.offerPercentDiscount,
      isActive: offer.isActive
    };

    this.isOfferModalVisible = true;
  }


  // Modal Helpers
  openOfferModal(): void {
    this.isEditMode = false;
    this.editingOfferId = null;
    this.resetOfferForm();
    this.isOfferModalVisible = true;
  }

  closeOfferModal() {
    this.isOfferModalVisible = false;
  }

  resetOfferForm() {
    this.offerObj = {
      offerName: '',
      offerImageUrl: '',
      offerPercentDiscount: 0,
      isActive: true
    };
  }

  // Create Offer
  onSaveOffer(): void {
    if (!this.offerObj.offerName) {
      alert('Offer name is required');
      return;
    }

    this.isLoading = true;

    if (this.isEditMode && this.editingOfferId !== null) {
      const updatedOffers = this.offersSource.value.map(o =>
        o.offerId === this.editingOfferId
          ? { ...o, ...this.offerObj }
          : o
      );

      this.offersSource.next(updatedOffers);

      // ✅ Persist changes
      this.saveStoredEdit(this.editingOfferId, this.offerObj);

      this.closeOfferModal();
      this.isLoading = false;
      return;
    }

    // CREATE MODE
    this.offerSrv.addOffer(this.offerObj).subscribe({
      next: res => {
        if (res.result) {
          this.reload$.next();
          this.closeOfferModal();
        } else {
          alert(res.message || 'Failed to create offer');
        }
        this.isLoading = false;
      },
      error: () => {
        alert('Failed to create offer');
        this.isLoading = false;
      }
    });
  }

  // Helpers Read/Write Local Storage
  private getStoredEdits(): Record<number, Partial<Offer>> {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  }

  private saveStoredEdit(offerId: number, data: Partial<Offer>) {
    const current = this.getStoredEdits();
    current[offerId] = {
      ...(current[offerId] || {}),
      ...data
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
  }



  // Pagination
  currentPage = 1;
  private currentPageSubject = new BehaviorSubject<number>(1);
  currentPage$ = this.currentPageSubject.asObservable();

  // Reload trigger
  private reload$ = new BehaviorSubject<void>(undefined);

  // Data streams
  allOffers$ = this.reload$.pipe(
    switchMap(() =>
      this.offerSrv.getOffers().pipe(
        map((res: ApiResponse<Offer[]>) => {
          const edits = this.getStoredEdits();

          return (res.data ?? []).map(o =>
            edits[o.offerId]
              ? { ...o, ...edits[o.offerId] }
              : o
          );
        })
      )
    ),
    shareReplay(1)
  );


  private offersSource = new BehaviorSubject<Offer[]>([]);
  offers$ = this.offersSource.asObservable();

  pagedOffers$ = combineLatest([
    this.offers$,
    this.currentPage$
  ]).pipe(
    map(([offers, page]) => {
      const start = (page - 1) * this.pageSize;
      return offers.slice(start, start + this.pageSize);
    })
  );

  totalPages$ = this.offers$.pipe(
    map(list => Math.max(1, Math.ceil(list.length / this.pageSize)))
  );

  constructor(private offerSrv: OfferService) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.isLoading = true;

    this.allOffers$.subscribe(list => {
      this.offersSource.next(list);
      this.setPage(1);
      this.isLoading = false;
    });
  }

  changePage(page: number): void {
    if (page < 1) return;
    this.setPage(page);
  }

  private setPage(page: number): void {
    this.currentPage = page;
    this.currentPageSubject.next(page);
  }

  // ----------------
  // DELETE
  // ----------------
  onDelete(offer: Offer): void {
    if (!confirm('Delete this offer?')) return;

    this.offerSrv.deleteOffer(offer.offerId).subscribe(res => {
      if (res.result) {
        alert('Offer deleted');
        this.reload$.next();
      }
    });
  }

  // Toggle HAndler
  onToggleActive(offer: Offer): void {
    const updated = {
      ...offer,
      isActive: !offer.isActive
    };

    // UI update
    const next = this.offersSource.value.map(o =>
      o.offerId === offer.offerId ? updated : o
    );
    this.offersSource.next(next);

    // Persist edit
    this.saveStoredEdit(offer.offerId, { isActive: updated.isActive });
  }

  clearLocalOfferEdits() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.reload$.next();
  }

  // Method to clear local edits and reload from server
  resetUiEdits(): void {
    if (!confirm('Reset all local offer edits?')) return;

    localStorage.removeItem(this.STORAGE_KEY);

    // 🔁 reload fresh API data
    this.reload$.next();
  }

  hasUiEdits(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }

  isEdited(offerId: number): boolean {
    const edits = this.getStoredEdits();
    return !!edits[offerId];
  }




}
