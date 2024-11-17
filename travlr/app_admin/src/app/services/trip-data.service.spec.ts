import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TripDataService } from './trip-data.service';

describe('TripDataService', () => {
  let service: TripDataService;
  let httpMock: HttpTestingController;

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TripDataService]
    });
    service = TestBed.inject(TripDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get trips', () => {
    const mockTrips = [mockTrip];

    service.getTrips().subscribe(trips => {
      expect(trips).toEqual(mockTrips);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/trips');
    expect(req.request.method).toBe('GET');
    req.flush(mockTrips);
  });

  it('should get trip by code', () => {
    service.getTrip('TEST1').subscribe(trip => {
      expect(trip).toEqual([mockTrip]);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/trips/TEST1');
    expect(req.request.method).toBe('GET');
    req.flush([mockTrip]);
  });

  it('should add new trip', () => {
    service.addTrip(mockTrip).subscribe(trip => {
      expect(trip).toEqual(mockTrip);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/trips');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockTrip);
    req.flush(mockTrip);
  });

  it('should update existing trip', () => {
    const updatedTrip = { ...mockTrip, name: 'Updated Trip' };

    service.updateTrip(updatedTrip).subscribe(trip => {
      expect(trip).toEqual(updatedTrip);
    });

    const req = httpMock.expectOne(`http://localhost:3000/api/trips/${mockTrip.code}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedTrip);
    req.flush(updatedTrip);
  });

  it('should handle errors', () => {
    service.getTrips().subscribe({
      error: (error) => {
        expect(error.status).toBe(404);
      }
    });

    const req = httpMock.expectOne('http://localhost:3000/api/trips');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });
});
