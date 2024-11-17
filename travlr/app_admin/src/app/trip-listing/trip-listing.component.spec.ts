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

describe('TripListingComponent', () => {
  let component: TripListingComponent;
  let fixture: ComponentFixture<TripListingComponent>;
  let tripDataService: jasmine.SpyObj<TripDataService>;
  let authService: jasmine.SpyObj<AuthenticationService>;
  let router: jasmine.SpyObj<Router>;

  const mockTrips = [
    {
      _id: '1',
      code: 'TEST1',
      name: 'Test Trip 1',
      length: '7 days',
      description: 'Test Description 1',
      start: new Date('2024-03-15'),
      resort: 'Test Resort 1',
      perPerson: '999',
      image: 'test1.jpg'
    },
    {
      _id: '2',
      code: 'TEST2',
      name: 'Test Trip 2',
      length: '10 days',
      description: 'Test Description 2',
      start: new Date('2024-04-15'),
      resort: 'Test Resort 2',
      perPerson: '1299',
      image: 'test2.jpg'
    }
  ];

  beforeEach(async () => {
    const tripDataServiceSpy = jasmine.createSpyObj('TripDataService', ['getTrips']);
    const authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['isLoggedIn']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
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

    // Setup default spy return values
    tripDataService.getTrips.and.returnValue(of(mockTrips));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TripListingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  
  it('should show add button when authenticated', fakeAsync(() => {
    // Setup
    authService.isLoggedIn.and.returnValue(true);

    // Initial detection for ngOnInit
    fixture.detectChanges();

    // Wait for async operations
    tick();

    // Detect changes after data load
    fixture.detectChanges();

    const addButton = fixture.debugElement.query(By.css('.btn-info'));
    expect(addButton).toBeTruthy();
    expect(addButton.nativeElement.textContent.trim()).toBe('Add Trip');
  }));

  it('should hide add button when not authenticated', fakeAsync(() => {
    // Setup
    authService.isLoggedIn.and.returnValue(false);

    // Initial detection for ngOnInit
    fixture.detectChanges();

    // Wait for async operations
    tick();

    // Detect changes after data load
    fixture.detectChanges();

    const addButton = fixture.debugElement.query(By.css('.btn-info'));
    expect(addButton).toBeFalsy();
  }));

  it('should navigate to add-trip when button clicked', fakeAsync(() => {
    // Setup
    authService.isLoggedIn.and.returnValue(true);

    // Initial detection for ngOnInit
    fixture.detectChanges();

    // Wait for async operations
    tick();

    // Detect changes after data load
    fixture.detectChanges();

    const addButton = fixture.debugElement.query(By.css('.btn-info'));
    addButton.triggerEventHandler('click', null);

    tick();

    expect(router.navigate).toHaveBeenCalledWith(['add-trip']);
  }));
});
