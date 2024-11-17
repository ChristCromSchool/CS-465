import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripCardComponent } from './trip-card.component';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthenticationService } from '../services/authentication.service';
import { TripDataService } from '../services/trip-data.service';

describe('TripCardComponent', () => {
  let component: TripCardComponent;
  let fixture: ComponentFixture<TripCardComponent>;

  const mockTrip = {
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
    const authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['isLoggedIn']);
    const tripDataServiceSpy = jasmine.createSpyObj('TripDataService', ['getTrips']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, HttpClientTestingModule, TripCardComponent], // Import standalone component and HttpClientTestingModule
      providers: [
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: TripDataService, useValue: tripDataServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripCardComponent);
    component = fixture.componentInstance;
    component.trip = mockTrip; // Set input property
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display trip details', () => {
    fixture.detectChanges();

    // Test card header with trip name
    const nameElement = fixture.debugElement.query(By.css('.card-header'));
    expect(nameElement).toBeTruthy('Expected trip name in card header to be present');
    expect(nameElement.nativeElement.textContent).toContain(mockTrip.name);

    // Test resort name in subtitle
    const resortElement = fixture.debugElement.query(By.css('.card-subtitle'));
    expect(resortElement).toBeTruthy('Expected resort subtitle to be present');
    expect(resortElement.nativeElement.textContent).toContain(mockTrip.resort);

    // Test trip image
    const imageElement = fixture.debugElement.query(By.css('.card-img-top'));
    expect(imageElement).toBeTruthy('Expected trip image to be present');
    expect(imageElement.properties['src']).toContain(mockTrip.image);
    expect(imageElement.properties['alt']).toBe('trip thumbnail');

    // Test trip description
    const descriptionElement = fixture.debugElement.query(By.css('.card-text'));
    expect(descriptionElement).toBeTruthy('Expected trip description to be present');
    expect(descriptionElement.properties['innerHTML']).toBe(mockTrip.description);

    // Test price and length info
    const priceElement = fixture.debugElement.query(By.css('.card-subtitle.mt-3'));
    expect(priceElement).toBeTruthy('Expected price info to be present');
    expect(priceElement.nativeElement.textContent).toContain(mockTrip.length);
    expect(priceElement.nativeElement.textContent).toContain(mockTrip.perPerson);
  });
});
