import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthenticationService } from './authentication.service';
import { TripDataService } from './trip-data.service';
import { TrieService } from './trie.service';
import { AuthResponse } from '../models/authresponse';
import { User } from '../models/user';
import { of } from 'rxjs';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpMock: HttpTestingController;

  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
  const mockUser: User = {
    email: 'test@example.com',
    password: 'test123',
    name: 'Test User'
  };

  // Create comprehensive mock services
  const mockTrieService = {
    insert: jasmine.createSpy('insert'),
    search: jasmine.createSpy('search').and.returnValue([])
  };

  const tripDataServiceSpy = {
    getTrips: () => of([]), // Returns an empty observable that completes immediately
    initializeSearchIndex: () => {}, // Stub out initialization method
    login: jasmine.createSpy('login').and.returnValue(Promise.resolve({ token: testToken })),
    register: jasmine.createSpy('register').and.returnValue(Promise.resolve({ token: testToken })),
    addTrip: () => of({}),
    updateTrip: () => of({}),
    getTripsWithPagination: () => of({ trips: [], total: 0, page: 1, pageSize: 10 }),
    getSuggestions: () => [],
    makeAuthApiCall: jasmine.createSpy('makeAuthApiCall').and.returnValue(Promise.resolve({ token: testToken }))
  };

  beforeEach(() => {
    // Spy on localStorage methods
    spyOn(localStorage, 'setItem').and.callThrough();
    spyOn(localStorage, 'getItem').and.callThrough();
    spyOn(localStorage, 'removeItem').and.callThrough();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthenticationService,
        {
          provide: TripDataService,
          useValue: tripDataServiceSpy
        },
        {
          provide: TrieService,
          useValue: mockTrieService
        }
      ]
    });

    service = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save token to localStorage', () => {
    service.saveToken(testToken);
    expect(localStorage.setItem).toHaveBeenCalledWith('travlr-token', testToken);
  });

  it('should retrieve token from localStorage', () => {
    localStorage.setItem('travlr-token', testToken);
    expect(service.getToken()).toBe(testToken);
  });

  it('should clear token on logout', () => {
    localStorage.setItem('travlr-token', testToken);
    service.logout();
    expect(localStorage.removeItem).toHaveBeenCalledWith('travlr-token');
  });

  it('should register user', async () => {
    const response = await service.register(mockUser);
    expect(response.token).toBe(testToken);
  });

  it('should login user', async () => {
    const response = await service.login(mockUser);
    expect(response.token).toBe(testToken);
  });

  it('should check if user is logged in', fakeAsync(() => {
    localStorage.setItem('travlr-token', testToken);
    expect(service.isLoggedIn()).toBeTrue();
    tick(); // Handle async operations
  }));

  it('should handle login error', async () => {
    // Mock the login method to throw an error
    tripDataServiceSpy.login.and.returnValue(Promise.reject({
      status: 401,
      message: 'Unauthorized'
    }));

    try {
      await service.login(mockUser);
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.status).toBe(401);
    }
  });
});
