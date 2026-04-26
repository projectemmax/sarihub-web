import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StorefrontCartService } from '@app/services/storefront/storefront-cart.service';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

    title = 'ecommerce-frontend';

    private cartService = inject(StorefrontCartService);
    private authService = inject(AuthService)

    ngOnInit(): void {
        if (this.authService.isLoggedIn()) {
            this.cartService.loadCart().subscribe();
        }   
    }
}
