import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart-item';
import { Cart } from '../models/cart'; // Adjust the path as necessary
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:3000/api';
  private defaultCart: Cart = { items: [], total: 0 };
  private cartSubject = new BehaviorSubject<Cart>(this.defaultCart);
  cart$ = this.cartSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthenticationService
  ) {
    this.loadCart();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  public async loadCart() {
    if (this.authService.isLoggedIn()) {
      try {
        const cart = await this.http.get<Cart>(`${this.apiUrl}/cart`, {
          headers: this.getAuthHeaders()
        }).toPromise();
        this.cartSubject.next(cart || this.defaultCart);
      } catch (error) {
        console.error('Error loading cart:', error);
        this.cartSubject.next(this.defaultCart);
      }
    }
  }

  getCartItems(): CartItem[] {
    return this.cartSubject.value.items;
  }

  async addToCart(trip: any) {
    if (!this.authService.isLoggedIn()) {
      console.error('User not authenticated');
      return;
    }

    try {
      // Validate trip data
      if (!trip.code) {
        throw new Error('Trip code is required');
      }

      // Create cart item data
      const cartData = {
        items: [{
          code: trip.code,
          name: trip.name,
          price: Number(trip.perPerson || trip.price),
          quantity: 1,
          image: trip.image || ''
        }]
      };

      console.log('Sending cart data:', cartData);

      // Make request to backend
      const response = await this.http.post<Cart>(
        `${this.apiUrl}/cart`,
        cartData,
        { headers: this.getAuthHeaders() }
      ).toPromise();

      // Update cart state
      if (response) {
        this.cartSubject.next(response);
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      this.cartSubject.next(this.defaultCart);
    }
  }

  async removeFromCart(code: string) {
    if (!this.authService.isLoggedIn()) return;

    try {
      console.log('Removing item with code:', code);

      const response = await this.http.delete<Cart>(
        `${this.apiUrl}/cart/item/${code}`,
        { headers: this.getAuthHeaders() }
      ).toPromise();

      if (response) {
        this.cartSubject.next(response);
      }
    } catch (error) {
      console.error('Remove from cart error:', error);
      this.cartSubject.next(this.defaultCart);
    }
  }

  clearCart() {
    const emptyCart: Cart = { items: [], total: 0 };
    this.cartSubject.next(emptyCart);
    this.saveCart(emptyCart);
  }

  private calculateTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  private async saveCart(cart: Cart) {
    if (!this.authService.isLoggedIn()) return;

    try {
      // Debug current cart state
      console.log('Full cart object:', JSON.stringify(cart, null, 2));

      const cartData = {
        items: cart.items.map(item => ({
          code: item.code,
          name: item.name,
          price: Number(item.price),
          quantity: item.quantity,
          image: item.image || ''
        })),
        total: this.calculateTotal(cart.items)
      };

      // Log complete request details
      console.log('Request URL:', `${this.apiUrl}/cart`);
      console.log('Request Headers:', this.getAuthHeaders());
      console.log('Request Payload:', JSON.stringify(cartData, null, 2));

      const updatedCart = await this.http.post<Cart>(
        `${this.apiUrl}/cart`,
        cartData,
        { headers: this.getAuthHeaders() }
      ).toPromise();

      console.log('Server Response:', updatedCart);
      this.cartSubject.next(updatedCart || this.defaultCart);
    } catch (error) {
      console.error('Cart save error:', error);
      console.log('Failed payload:', cart);
      this.cartSubject.next(this.defaultCart);
    }
  }

  // Add checkout method to CartService
  async checkout(cartItems: CartItem[]): Promise<void> {
    try {
      const stripe = await loadStripe(environment.stripePublishableKey);
      if (!stripe) throw new Error('Stripe failed to initialize');

      // Create session
      const response = await firstValueFrom(
        this.http.post<{id: string}>(
          `${this.apiUrl}/create-checkout-session`,
          { items: cartItems }
        )
      );

      if (!response.id) throw new Error('No session ID returned');

      // Redirect to Stripe checkout
      const result = await stripe.redirectToCheckout({
        sessionId: response.id
      });

      if (result.error) throw result.error;

    } catch (error) {
      console.error('Stripe checkout failed:', error);
      throw error;
    }
  }

  async createCheckoutSession(items: CartItem[]) {
    try {
      // 1. Load Stripe instance
      const stripe = await loadStripe(environment.stripePublishableKey);
      if (!stripe) throw new Error('Stripe failed to initialize');

      // 2. Create session with explicit response type
      const response = await this.http.post<{id: string}>(
        `${this.apiUrl}/create-checkout-session`,
        { items }
      ).toPromise(); // Convert Observable to Promise

      if (!response || !response.id) {
        throw new Error('Invalid session response');
      }

      // 3. Immediate redirect
      window.location.href = `https://checkout.stripe.com/pay/${response.id}`;

    } catch (error) {
      console.error('Stripe checkout failed:', error);
      throw error;
    }
  }

  // Add method to update cart item quantity
  async updateCartItemQuantity(code: string, increment: boolean = true) {
    if (!this.authService.isLoggedIn()) return;

    try {
      const currentCart = this.cartSubject.value;
      const existingItem = currentCart.items.find(item => item.code === code);

      if (existingItem) {
        existingItem.quantity = increment ?
          existingItem.quantity + 1 :
          Math.max(1, existingItem.quantity - 1);

        const response = await this.http.post<Cart>(
          `${this.apiUrl}/cart`,
          currentCart,
          { headers: this.getAuthHeaders() }
        ).toPromise();

        if (response) {
          this.cartSubject.next(response);
        }
      }
    } catch (error) {
      console.error('Update quantity error:', error);
    }
  }
}
