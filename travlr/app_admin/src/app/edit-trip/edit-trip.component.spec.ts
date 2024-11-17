import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { EditTripComponent } from './edit-trip.component';
import { TripDataService } from '../services/trip-data.service';
import { AuthenticationService } from '../services/authentication.service';
import { of, throwError } from 'rxjs';
import { Trip } from '../models/trip';

describe('EditTripComponent', () => {
  let component: EditTripComponent;
  let fixture: ComponentFixture<EditTripComponent>;
  let tripDataService: jasmine.SpyObj<TripDataService>;
  let authService: jasmine.SpyObj<AuthenticationService>;
  let router: Router;

  const mockTrip: Trip = {
    _id: '1',
    code: 'TEST1',
    name: 'Test Trip',
    length: '7 days',
    description: 'Test Description',
    start: new Date('2024-03-15'),
    resort: 'Test Resort',
    perPerson: '999',
    image: 'test.jpg'
  };

  beforeEach(async () => {
    const tripSpy = jasmine.createSpyObj('TripDataService', ['getTrip', 'updateTrip']);
    const authSpy = jasmine.createSpyObj('AuthenticationService', ['isLoggedIn']);

    // Setup default return values for spies
    tripSpy.getTrip.and.returnValue(of([mockTrip]));
    authSpy.isLoggedIn.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        EditTripComponent
      ],
      providers: [
        { provide: TripDataService, useValue: tripSpy },
        { provide: AuthenticationService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditTripComponent);
    component = fixture.componentInstance;
    tripDataService = TestBed.inject(TripDataService) as jasmine.SpyObj<TripDataService>;
    authService = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
    router = TestBed.inject(Router);

    // Setup localStorage mock
    localStorage.setItem('tripCode', 'TEST1');
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to login if not authenticated', () => {
    authService.isLoggedIn.and.returnValue(false);
    const routerSpy = spyOn(router, 'navigate');

    component.ngOnInit();

    expect(routerSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should load trip data on init', () => {
    // Setup spy return value before ngOnInit
    tripDataService.getTrip.and.returnValue(of([mockTrip]));

    // Create form before init
    component.editForm = component.formBuilder.group({
      _id: [''],
      code: ['TEST1'],
      name: [''],
      length: [''],
      description: [''],
      start: [''],
      resort: [''],
      perPerson: [''],
      image: ['']
    });

    // Call ngOnInit after setup
    component.ngOnInit();

    // Wait for async operations
    fixture.detectChanges();

    // Verify expectations
    expect(tripDataService.getTrip).toHaveBeenCalledWith('TEST1');
    expect(component.editForm.get('code')?.value).toBe(mockTrip.code);
    expect(component.message).toBe('Trip: TEST1 retrieved');
  });

  it('should handle trip not found', () => {
    tripDataService.getTrip.and.returnValue(of([]));

    component.ngOnInit();

    expect(component.message).toBe('No Trip Retrieved!');
  });

  it('should handle load error', () => {
    const routerSpy = spyOn(router, 'navigate');
    tripDataService.getTrip.and.returnValue(throwError(() => ({ status: 404 })));

    component.ngOnInit();

    expect(component.message).toBe('Trip not found');
    expect(routerSpy).toHaveBeenCalledWith(['/trips']);
  });

  it('should submit updated trip when form valid', () => {
    // Setup trip data service mock
    tripDataService.updateTrip.and.returnValue(of(mockTrip));
    const routerSpy = spyOn(router, 'navigate');

    // Initialize component and form
    component.ngOnInit();

    // Update form values using patchValue
    component.editForm.patchValue({
      _id: mockTrip._id,
      code: mockTrip.code,
      name: mockTrip.name,
      length: mockTrip.length,
      description: mockTrip.description,
      start: mockTrip.start,
      resort: mockTrip.resort,
      perPerson: mockTrip.perPerson,
      image: mockTrip.image
    });

    // Submit form
    component.onSubmit();

    // Verify expectations
    expect(tripDataService.updateTrip).toHaveBeenCalledWith(mockTrip);
    expect(routerSpy).toHaveBeenCalledWith(['/trips']);
  });

  it('should handle update error', () => {
    // Setup error response
    tripDataService.updateTrip.and.returnValue(throwError(() => ({ status: 401 })));
    const routerSpy = spyOn(router, 'navigate');

    // Initialize component and form
    component.ngOnInit();

    // Update form values using patchValue
    component.editForm.patchValue({
      _id: mockTrip._id,
      code: mockTrip.code,
      name: mockTrip.name,
      length: mockTrip.length,
      description: mockTrip.description,
      start: mockTrip.start,
      resort: mockTrip.resort,
      perPerson: mockTrip.perPerson,
      image: mockTrip.image
    });

    // Submit form
    component.onSubmit();

    // Verify error handling
    expect(component.message).toBe('Error updating trip');
    expect(routerSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should validate required fields', () => {
    // Set up the form with empty values
    component.editForm.setValue({
      _id: '',
      code: '',
      name: '',
      length: '',
      description: '',
      start: '',
      resort: '',
      perPerson: '',
      image: ''
    });

    // Trigger form submission
    component.onSubmit();

    // Check that the form is invalid
    expect(component.editForm.valid).toBeFalsy();

    // Check that each required field has the appropriate validation error

    expect(component.editForm.get('code')?.hasError('required')).toBeTruthy();
    expect(component.editForm.get('name')?.hasError('required')).toBeTruthy();
    expect(component.editForm.get('length')?.hasError('required')).toBeTruthy();
    expect(component.editForm.get('description')?.hasError('required')).toBeTruthy();
    expect(component.editForm.get('start')?.hasError('required')).toBeTruthy();
    expect(component.editForm.get('resort')?.hasError('required')).toBeTruthy();
    expect(component.editForm.get('perPerson')?.hasError('required')).toBeTruthy();
    expect(component.editForm.get('image')?.hasError('required')).toBeTruthy();
  });
});
