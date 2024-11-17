import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { AuthenticationService } from '../services/authentication.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthenticationService>;

  const mockCredentials = {
    name: '',
    email: 'test@example.com',
    password: 'test123'
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthenticationService', ['login']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        RouterTestingModule,
        LoginComponent
      ],
      providers: [
        { provide: AuthenticationService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty credentials', () => {
    expect(component.credentials).toEqual({
      name: '',
      email: '',
      password: ''
    });
    expect(component.formError).toBe('');
  });

  it('should show error for empty required fields', () => {
    component.onLoginSubmit();
    expect(component.formError).toBe('All fields are required, please try again');
  });

  it('should call authentication service on valid submit', () => {
    authService.login.and.returnValue(Promise.resolve());

    component.credentials = mockCredentials;
    component.onLoginSubmit();

    expect(authService.login).toHaveBeenCalledWith(mockCredentials);
    expect(component.formError).toBe('');
  });

  it('should handle login error', (done) => {
    const errorMessage = 'Invalid credentials';
    authService.login.and.returnValue(Promise.reject(errorMessage));

    component.credentials = mockCredentials;
    component.onLoginSubmit();

    // Wait for async operations to complete
    setTimeout(() => {
      expect(component.formError).toBe(errorMessage);
      done();
    });
  });

  it('should navigate after successful login', async () => {
    authService.login.and.returnValue(Promise.resolve());
    const routerSpy = spyOn(component['router'], 'navigateByUrl');

    component.credentials = mockCredentials;
    await component.onLoginSubmit();

    expect(routerSpy).toHaveBeenCalledWith('#');
  });
});
