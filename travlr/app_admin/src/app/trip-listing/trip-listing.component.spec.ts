import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TripListingComponent } from './trip-listing.component';
import { TripCardComponent } from '../trip-card/trip-card.component';
import { TripDataService } from '../services/trip-data.service';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

describe('TripListingComponent', () => {
  let component: TripListingComponent;
  let fixture: ComponentFixture<TripListingComponent>;
  let tripDataService: jasmine.SpyObj<TripDataService>;
  let authService: jasmine.SpyObj<AuthenticationService>;
  let router: jasmine.SpyObj<Router>;

  const mockTrips = {
    trips: [{
      _id: '1',
      code: 'TEST1',
      name: 'Test Trip 1',
      length: '7 days',
      description: 'Test Description 1',
      start: new Date('2024-03-15'),
      resort: 'Test Resort 1',
      perPerson: '999',
      image: 'test1.jpg'
    }],
    total: 1,
    page: 1,
    pageSize: 3
  };

  beforeEach(async () => {
    const tripDataServiceSpy = jasmine.createSpyObj('TripDataService', ['getTripsWithPagination']);
    const authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['isLoggedIn']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    tripDataServiceSpy.getTripsWithPagination.and.returnValue(of(mockTrips));
    authServiceSpy.isLoggedIn.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        NgbModule,
        TripListingComponent,
        TripCardComponent
      ],
      providers: [
        { provide: TripDataService, useValue: tripDataServiceSpy },
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    tripDataService = TestBed.inject(TripDataService) as jasmine.SpyObj<TripDataService>;
    authService = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(TripListingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load trips on init', fakeAsync(() => {
    // Setup spy
    tripDataService.getTripsWithPagination.and.returnValue(of(mockTrips));

    // Initialize component
    fixture.detectChanges();

    // Trigger ngOnInit
    component.ngOnInit();
    tick();

    // Let component process response
    fixture.detectChanges();

    // Verify service call
    expect(tripDataService.getTripsWithPagination).toHaveBeenCalledWith({
      query: '',
      page: 1,
      pageSize: 3,
      sortBy: 'name',
      sortDirection: 'asc'
    });

    // Verify component state
    expect(component.filteredTrips.length).toBe(1);
    expect(component.filteredTrips[0].name).toBe('Test Trip 1');
  }));

  it('should handle search input', fakeAsync(() => {
    // Setup spy
    tripDataService.getTripsWithPagination.and.returnValue(of(mockTrips));

    // Initialize component
    fixture.detectChanges();

    // Set search query
    component.searchQuery = 'Test';

    // Trigger search
    component.onSearchInput();
    tick();

    // Verify service call
    expect(tripDataService.getTripsWithPagination).toHaveBeenCalledWith({
      query: 'Test',
      page: 1,
      pageSize: 3,
      sortBy: 'name',
      sortDirection: 'asc'
    });
  }));

  it('should change page', fakeAsync(() => {
    // Setup spy
    tripDataService.getTripsWithPagination.and.returnValue(of(mockTrips));

    // Initialize component
    fixture.detectChanges();
    tick();

    // Change page
    component.onPageChange(2);
    tick();

    // Verify page change
    expect(component.currentPage).toBe(2);

    // Clear all pending timers
    tick(1000);
  }));

  it('should show add button when authenticated', fakeAsync(() => {
    authService.isLoggedIn.and.returnValue(true);
    fixture.detectChanges();
    tick();

    const addButton = fixture.debugElement.query(By.css('[data-testid="add-trip-button"]'));
    expect(addButton).toBeTruthy('Add Trip button should be visible when authenticated');
    expect(addButton?.nativeElement.textContent.trim()).toBe('Add Trip');
  }));
});
