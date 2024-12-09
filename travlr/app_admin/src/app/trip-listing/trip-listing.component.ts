import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trips } from '../data/trips';
import { TripCardComponent } from '../trip-card/trip-card.component';
import { Trip } from '../models/trip';
import { TripDataService } from '../services/trip-data.service';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-trip-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, TripCardComponent, NgbPaginationModule, NgbModule],
  template: `
    <div class="container">
      <div class="search-container mb-4">
        <input
          type="text"
          class="form-control"
          [(ngModel)]="searchQuery"
          (input)="onSearchInput()"
          placeholder="Search trips...">
        <div *ngIf="suggestions.length" class="suggestions-dropdown">
          <div *ngFor="let suggestion of suggestions"
               class="suggestion-item"
               (click)="selectSuggestion(suggestion)">
            {{suggestion}}
          </div>
        </div>
      </div>

      <div class="row">
        <div *ngFor="let trip of trips" class="col-md-4 mb-4">
          <app-trip-card [trip]="trip"></app-trip-card>
        </div>
      </div>

      <ngb-pagination
        [collectionSize]="total"
        [(page)]="currentPage"
        [pageSize]="pageSize"
        (pageChange)="onPageChange($event)">
      </ngb-pagination>
    </div>
  `,
  styleUrl: './trip-listing.component.css',
  providers: [TripDataService],
  styles: [`
    .suggestions-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-top: none;
      max-height: 200px;
      overflow-y: auto;
      z-index: 1000;
    }
    .suggestion-item {
      padding: 8px 12px;
      cursor: pointer;
    }
    .suggestion-item:hover {
      background-color: #f8f9fa;
    }
  `]
})
export class TripListingComponent implements OnInit {
  trips: Trip[] = [];
  filteredTrips: Trip[] = [];
  total = 0;
  currentPage = 1;
  pageSize = 3; // Changed to 3 items per page
  searchQuery = '';
  suggestions: string[] = [];
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  columns = [
    { key: 'name', label: 'Name' },
    { key: 'resort', label: 'Resort' },
    { key: 'length', label: 'Length' },
    { key: 'price', label: 'Price' }
  ];

  get paginatedTrips(): Trip[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredTrips.slice(startIndex, startIndex + this.pageSize);
  }

  constructor(
    private tripDataService: TripDataService,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    console.log('trip-listing constructor');
  }

  ngOnInit() {
    this.loadTrips();
  }

  loadTrips() {
    console.log('Loading trips...');
    this.tripDataService.getTripsWithPagination({
      query: this.searchQuery,
      page: this.currentPage,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    }).subscribe({
      next: (result) => {
        // Filter trips based on search query
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase();
          this.filteredTrips = result.trips.filter(trip =>
            trip.name.toLowerCase().includes(query) ||
            trip.resort.toLowerCase().includes(query) ||
            trip.description.toLowerCase().includes(query)
          );
        } else {
          this.filteredTrips = result.trips;
        }
        this.total = this.filteredTrips.length;
        this.trips = this.paginatedTrips;
      },
      error: (error) => console.error('Error loading trips:', error)
    });
  }

  onSearchInput() {
    console.log('Search query:', this.searchQuery);
    this.currentPage = 1; // Reset to first page when searching
    if (this.searchQuery) {
      this.suggestions = this.trips
        .map(trip => trip.name)
        .filter(name =>
          name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      console.log('Suggestions:', this.suggestions);
    } else {
      this.suggestions = [];
    }
    this.loadTrips();
  }

  selectSuggestion(suggestion: string) {
    this.searchQuery = suggestion;
    this.suggestions = [];
    this.loadTrips();
  }

  sort(column: string) {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.loadTrips();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.trips = this.paginatedTrips;
  }

  public addTrip(): void {
    this.router.navigate(['add-trip']);
  }

  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }
}
