import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

import { CartService } from '@app/services/cart/cart.service';
import { SearchComponent } from "@app/shared/search/search.component";

@Component({
  selector: 'app-admin-cart',
  standalone: true,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  imports: [CommonModule, SearchComponent],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '200ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
    ]),
  ],
})
export class CartComponent implements OnInit {

  // ======================
  // STATE
  // ======================
  carts: any[] = [];
  selectedCart: any | null = null;

  searchTerm = '';

  isLoading = false;
  isSidePanelVisible = false;

  constructor(private cartService: CartService) {}

  // ======================
  // LIFECYCLE
  // ======================
  ngOnInit(): void {
    this.loadCarts();
  }

  // ======================
  // DATA
  // ======================
  loadCarts(): void {
    this.isLoading = true;

    this.cartService.getCarts().subscribe({
      next: (carts) => {
        console.log('Loaded carts:', carts);
        this.carts = carts;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  // ======================
  // SIDE PANEL
  // ======================
  openSidePanel(cart: any): void {
    this.selectedCart = cart;
    this.isSidePanelVisible = true;
  }

  closeSidePanel(): void {
    this.selectedCart = null;
    this.isSidePanelVisible = false;
  }

  // ======================
  // ACTIONS
  // ======================
  clearCart(cart: any): void {
    if (!cart) return;

    const confirmed = confirm(
      `Clear cart for ${cart.user?.email || 'this user'}?`
    );

    if (!confirmed) return;

    this.cartService.clearCart(cart.id).subscribe(() => {
      // If the cleared cart is open, close panel
      if (this.selectedCart?.id === cart.id) {
        this.closeSidePanel();
      }

      this.loadCarts();
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term.trim().toLowerCase();
  }
  
  get filteredCarts(): any[] {
    if (!this.searchTerm) return this.carts;

    return this.carts.filter(cart =>
      cart.user?.email
        ?.toLowerCase()
        .includes(this.searchTerm)
    );
  }

}