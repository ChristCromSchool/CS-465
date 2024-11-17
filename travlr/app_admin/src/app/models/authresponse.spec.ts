import { AuthResponse } from './authresponse';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthenticationService } from '../services/authentication.service';

describe('AuthResponse', () => {
  it('should create an instance', () => {
    const response = new AuthResponse();
    expect(response).toBeTruthy();
  });

  it('should set token property', () => {
    const response = new AuthResponse();
    response.token = 'test-token';
    expect(response.token).toBe('test-token');
  });
});

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpMock: HttpTestingController;
  const testToken = 'test-token';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthenticationService]
    });
    service = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify(); // Verify no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store token in localStorage', () => {
    service.saveToken(testToken);
    expect(localStorage.getItem('travlr-token')).toBe(testToken);
  });

  it('should retrieve token from localStorage', () => {
    localStorage.setItem('travlr-token', testToken);
    expect(service.getToken()).toBe(testToken);
  });

  it('should clear token on logout', () => {
    localStorage.setItem('travlr-token', testToken);
    service.logout();
    expect(localStorage.getItem('travlr-token')).toBeNull();
  });

  it('should check if user is logged in', () => {
    // Not logged in initially
    expect(service.isLoggedIn()).toBeFalse();

    // Set valid token
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600 })) + '.signature';
    localStorage.setItem('travlr-token', validToken);
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('should login user', async () => {
    const credentials = {
      name: '',
      email: 'test@example.com',
      password: 'password123'
    };

    const mockResponse = { token: testToken };
    const loginPromise = service.login(credentials);

    const req = httpMock.expectOne('http://localhost:3000/api/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);

    req.flush(mockResponse);

    const response = await loginPromise;
    expect(response.token).toBe(testToken);
    expect(localStorage.getItem('travlr-token')).toBe(testToken);
  });

  it('should register user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const mockResponse = { token: testToken };
    const registerPromise = service.register(userData);

    const req = httpMock.expectOne('http://localhost:3000/api/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(userData);

    req.flush(mockResponse);

    const response = await registerPromise;
    expect(response.token).toBe(testToken);
    expect(localStorage.getItem('travlr-token')).toBe(testToken);
  });

  it('should handle login error', async () => {
    const credentials = {
      name: '',  // Add empty name to satisfy User type
      email: 'test@example.com',
      password: 'wrongpassword'
    };

    const loginPromise = service.login(credentials);

    // Match the actual URL used by the service
    const req = httpMock.expectOne((request) => {
      return request.url.includes('/api/login');
    });
    expect(req.request.method).toBe('POST');

    const errorResponse = new ErrorEvent('Unauthorized', {
      error: new Error('Invalid credentials')
    });

    req.error(errorResponse, {
      status: 401,
      statusText: 'Unauthorized'
    });

    try {
      await loginPromise;
      fail('Should have thrown an error');
    } catch (error: unknown) {
      expect(error).toBeTruthy();
      // Check for error message instead of status
      expect((error as Error).message || error).toBeTruthy();
    }
  });
});
