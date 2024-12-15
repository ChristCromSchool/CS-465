import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TripDataService } from './trip-data.service';
import { Trip } from '../models/trip';
import { BROWSER_STORAGE } from '../storage';

describe('TripDataService', () => {
  let service: TripDataService;
  let httpMock: HttpTestingController;

  const mockTrip: Trip = {
    _id: '1',
    code: 'TEST1',
    name: 'Test Trip',
    length: '7',
    description: 'Test Description',
    start: new Date('2024-03-15'),
    resort: 'Test Resort',
    perPerson: '999',
    image: 'test.jpg'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TripDataService,
        { provide: BROWSER_STORAGE, useValue: window.localStorage }
      ]
    });
    service = TestBed.inject(TripDataService);
    httpMock = TestBed.inject(HttpTestingController);

    // Override isTestEnvironment to return false for tests
    spyOn(service as any, 'isTestEnvironment').and.returnValue(false);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get trip by code', () => {
    service.getTrip('TEST1').subscribe((trips: Trip[]) => {
      expect(trips).toBeTruthy();
      expect(trips.length).toBe(1);
      expect(trips[0]).toEqual(mockTrip);
    });

    const req = httpMock.expectOne(`${service['apiBaseUrl']}/TEST1`);
    expect(req.request.method).toBe('GET');
    req.flush([mockTrip]);
  });

  // Additional tests for trip-data.service.spec.ts

  it('should get all trips', () => {
    const mockTrips = [mockTrip, {...mockTrip, _id: '2', code: 'TEST2'}];

    service.getTrips().subscribe(trips => {
      expect(trips).toBeTruthy();
      expect(trips.length).toBe(2);
    });

    const req = httpMock.expectOne(`${service['apiBaseUrl']}/trips`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTrips);
  });

  it('should add new trip', () => {
    // Omit _id when creating new trip
    const { _id, ...newTripData } = mockTrip;

    service.addTrip(newTripData as Trip).subscribe(trip => {
      expect(trip).toEqual(mockTrip);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/trips');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newTripData);
    req.flush(mockTrip);
  });

  it('should update existing trip', () => {
    const updatedTrip: Trip = { ...mockTrip, name: 'Updated Trip' };

    service.updateTrip(updatedTrip).subscribe(trip => {
      expect(trip).toEqual(updatedTrip);
    });

    const req = httpMock.expectOne(`${service['apiBaseUrl']}/${updatedTrip.code}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedTrip);
    req.flush(updatedTrip);
  });

  it('should handle error when getting trip', () => {
    const tripCode = 'INVALID';
    service.getTrip(tripCode).subscribe({
      error: (error) => {
        expect(error.status).toBe(404);
      }
    });

    const req = httpMock.expectOne(`${service['apiBaseUrl']}/${tripCode}`);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  it('should get trips with pagination', () => {
    const mockTrips = [mockTrip];

    service.getTripsWithPagination({ page: 1, pageSize: 10 }).subscribe(response => {
      expect(response.trips).toEqual(mockTrips);
      expect(response.total).toBe(1);
      expect(response.page).toBe(1);
      expect(response.pageSize).toBe(10);
    });

    const req = httpMock.expectOne(
      `${service['apiBaseUrl']}/trips?page=1&pageSize=10&query=`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockTrips);
  });

  // Remove searchTrips test if method doesn't exist in service
});
