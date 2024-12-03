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

@Component({
  selector: 'app-trip-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, TripCardComponent, NgbPaginationModule],
  template: `
    <div class="container">
      <div class="search-container mb-4">
        <input
          type="text"
          class="form-control"
          [(ngModel)]="searchQuery"
          (input)="onSearchInput()"
          placeholder="Search trips...">
        <ul *ngIf="suggestions.length" class="suggestions-list">
          <li *ngFor="let suggestion of suggestions"
              (click)="selectSuggestion(suggestion)">
            {{suggestion}}
          </li>
        </ul>
      </div>

      <div class="table-responsive">
        <table class="table">
          <!-- Table headers with sort controls -->
          <thead>
            <tr>
              <th *ngFor="let col of columns"
                  (click)="sort(col.key)"
                  [class.sorted]="sortBy === col.key">
                {{col.label}}
                <i class="fas"
                   [class.fa-sort-up]="sortBy === col.key && sortDirection === 'asc'"
                   [class.fa-sort-down]="sortBy === col.key && sortDirection === 'desc'">
                </i>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let trip of trips">
              <!-- Trip data cells -->
            </tr>
          </tbody>
        </table>

        <ngb-pagination
          [collectionSize]="total"
          [(page)]="currentPage"
          [pageSize]="pageSize"
          (pageChange)="onPageChange($event)">
        </ngb-pagination>
      </div>
    </div>
  `,
  styleUrl: './trip-listing.component.css',
  providers: [TripDataService],
})
export class TripListingComponent implements OnInit {
  trips: Trip[] = [];
  total = 0;
  currentPage = 1;
  pageSize = 10;
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
    this.tripDataService.getTripsWithPagination({
      query: this.searchQuery,
      page: this.currentPage,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    }).subscribe(result => {
      this.trips = result.trips;
      this.total = result.total;
    });
  }

  onSearchInput() {
    this.suggestions = this.tripDataService.getSuggestions(this.searchQuery);
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
    this.loadTrips();
  }

  public addTrip(): void {
    this.router.navigate(['add-trip']);
  }

  public isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }
}
