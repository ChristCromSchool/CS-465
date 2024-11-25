import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-3">
      <div *ngIf="message" class="alert" [ngClass]="{'alert-success': isLoggedIn, 'alert-warning': !isLoggedIn}" role="alert">
        {{ message }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" (click)="clearMessage()"></button>
      </div>
      <div class="row">
        <div class="col-12">
          <h1>Welcome to Travlr Admin</h1>
          <p *ngIf="isLoggedIn">You are logged in!</p>
          <p *ngIf="!isLoggedIn">Please log in to access admin features.</p>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  message: string = '';
  isLoggedIn: boolean = false;
  private authSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private authService: AuthenticationService
  ) {
    // Check for state in current navigation
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.message = navigation.extras.state['message'];
    }

    // Subscribe to navigation events
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const state = window.history.state;
      if (state?.message) {
        this.message = state.message;
      }
    });
  }

  ngOnInit() {
    // Check initial login status
    this.isLoggedIn = this.authService.isLoggedIn();

    // Subscribe to auth state changes
    this.authSubscription = this.authService.authState$.subscribe(
      (loggedIn: boolean) => {
        this.isLoggedIn = loggedIn;
        if (!loggedIn) {
          this.message = 'You have been logged out.';
        }
      }
    );

    // Check history state on load
    const state = window.history.state;
    if (state?.message) {
      this.message = state.message;
    }
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  clearMessage() {
    this.message = '';
  }
}
