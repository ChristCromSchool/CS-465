import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { StripeService } from '../services/stripe.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  providers: [StripeService],
  template: `
    <div class="container mt-4">
      <h2>Shopping Cart</h2>
      <div *ngIf="(cart$ | async)?.items?.length ?? 0 === 0" class="alert alert-info">
        Your cart is empty
      </div>
      <div *ngIf="(cart$ | async)?.items?.length ?? 0 > 0">
        <div class="card mb-3" *ngFor="let item of (cart$ | async)?.items">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-2">
                <img [src]="'assets/images/' + item.image" class="img-fluid" [alt]="item.name">
              </div>
              <div class="col">
                <h5 class="card-title">{{item.name}}</h5>
                <p class="card-text">Quantity: {{item.quantity}}</p>
                <p class="card-text">Price: {{item.price | currency}}</p>
              </div>
              <div class="col-2">
                <button class="btn btn-danger" (click)="removeFromCart(item.code)">Remove</button>
              </div>
            </div>
          </div>
        </div>
        <div class="text-end mb-3">
          <h4>Total: {{(cart$ | async)?.total | currency}}</h4>
          <button class="btn btn-primary" (click)="checkout()">Proceed to Checkout</button>
        </div>
      </div>
    </div>
  `
})
export class CartComponent implements OnInit {
  cart$;

  constructor(
    private cartService: CartService,
    private stripeService: StripeService
  ) {
    this.cart$ = this.cartService.cart$;
  }

  ngOnInit() {
    this.cartService.loadCart();
  }

  removeFromCart(tripId: string) {
    this.cartService.removeFromCart(tripId);
  }

  async checkout(): Promise<void> {
    try {
      const cartItems = this.cartService.getCartItems();
      await this.stripeService.createCheckoutSession(cartItems);
    } catch (error) {
      console.error('Checkout failed:', error);
      // Show error to user
    }
  }
}
