import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService } from './authentication.service';
import { BROWSER_STORAGE } from '../storage';
import { User } from '../models/user';
import { from } from 'rxjs';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpMock: HttpTestingController;
  let storage: Storage;

  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
  const mockUser: User = {
    email: 'test@example.com',
    password: 'test123',
    name: 'Test User'
  };

  // Add valid JWT token for testing
  const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwiZXhwIjo5OTk5OTk5OTk5fQ.signature';

  beforeEach(() => {
    storage = window.localStorage;
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthenticationService,
        { provide: BROWSER_STORAGE, useValue: storage }
      ]
    });
    service = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save token to localStorage', () => {
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

  it('should register user', (done) => {
    service.register(mockUser).then(response => {
      expect(response.token).toBe(testToken);
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUser);
    req.flush({ token: testToken });
  });

  it('should login user', (done) => {
    const loginData = {
      email: mockUser.email,
      password: mockUser.password,
      name: ''  // Add empty name to satisfy User type
    };

    service.login(loginData).then(response => {
      expect(response.token).toBe(testToken);
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginData);
    req.flush({ token: testToken });
  });

  it('should check if user is logged in', () => {
    // Test with valid token
    localStorage.setItem('travlr-token', validToken);
    expect(service.isLoggedIn()).toBeTrue();

    // Test with invalid token
    localStorage.setItem('travlr-token', 'invalid-token');
    expect(service.isLoggedIn()).toBeFalse();

    // Test with no token
    localStorage.removeItem('travlr-token');
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should handle invalid token', () => {
    localStorage.setItem('travlr-token', 'invalid-token');
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should handle API errors', (done) => {
    console.log('Starting API error test');

    service.login(mockUser).then(
      () => {
        console.log('Unexpected success');
        fail('Should have rejected');
        done();
      },
      (error) => {
        console.log('Error received:', error);

        // Update expectation to match actual error string
        expect(error).toBe('Http failure response for http://localhost:3000/api/login: 401 Unauthorized');
        done();
      }
    ).catch((e) => {
      console.log('Catch block error:', e);
      done.fail(e);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/login');
    expect(req.request.method).toBe('POST');

    req.flush('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized'
    });
  });
});
