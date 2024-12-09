import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { CartItem } from '../models/cart-item';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  async createCheckoutSession(cartItems: CartItem[]) {
    try {
      const response = await this.http.post<{id: string}>(
        `${this.apiUrl}/create-checkout-session`,
        { items: cartItems }
      ).toPromise();

      if (!response || !response.id) {
        throw new Error('Invalid session response');
      }

      const stripe = await loadStripe(environment.stripePublishableKey);
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const result = await stripe.redirectToCheckout({
        sessionId: response.id
      });

      if (result.error) {
        throw result.error;
      }

    } catch (error) {
      console.error('Checkout failed:', error);
      throw error;
    }
  }
}
