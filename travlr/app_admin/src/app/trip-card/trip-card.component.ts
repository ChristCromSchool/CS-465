import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Trip } from '../models/trip';
import { AuthenticationService } from '../services/authentication.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-card.component.html',  // Changed from template to templateUrl
  styleUrl: './trip-card.component.css',
})
export class TripCardComponent implements OnInit {
  @Input() trip: any;

  constructor(
    private cartService: CartService,
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  public isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  public addToCart(): void {
    console.log('Adding to cart:', this.trip);
    this.cartService.addToCart(this.trip);
  }

  public editTrip(trip: Trip): void {
    localStorage.setItem('tripCode', trip.code);
    this.router.navigate(['edit-trip']);
  }
}
