import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { NavbarComponent } from './navbar.component';
import { AuthenticationService } from '../services/authentication.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authService: jasmine.SpyObj<AuthenticationService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthenticationService', ['isLoggedIn', 'logout']);
    spy.isLoggedIn.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouterTestingModule],
      providers: [
        { provide: AuthenticationService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display logo in navbar brand', () => {
    const brandElement = fixture.debugElement.query(By.css('.navbar-brand img'));
    expect(brandElement).toBeTruthy();
    expect(brandElement.attributes['src']).toBe('/assets/images/logo.png');
  });

  it('should show trips link', () => {
    const tripsLink = fixture.debugElement.query(By.css('.nav-item.nav-link.active'));
    expect(tripsLink).toBeTruthy();
    expect(tripsLink.attributes['routerLink']).toBe('listtrips');
    expect(tripsLink.nativeElement.textContent).toContain('Trips');
  });

  it('should show login when not authenticated', () => {
    authService.isLoggedIn.and.returnValue(false);
    fixture.detectChanges();

    const loginLink = fixture.debugElement.query(By.css('.navbar-end .navbar-item'));
    expect(loginLink).toBeTruthy();
    expect(loginLink.attributes['routerLink']).toBe('login');
    expect(loginLink.query(By.css('.has-icon-left')).nativeElement.textContent).toBe('Log In');
  });

  it('should show logout when authenticated', () => {
    authService.isLoggedIn.and.returnValue(true);
    fixture.detectChanges();

    const logoutLink = fixture.debugElement.query(By.css('.navbar-end .navbar-item'));
    expect(logoutLink).toBeTruthy();
    expect(logoutLink.query(By.css('.has-icon-left')).nativeElement.textContent).toBe('Log Out');
  });

  it('should call logout when logout is clicked', () => {
    authService.isLoggedIn.and.returnValue(true);
    fixture.detectChanges();

    const logoutLink = fixture.debugElement.query(By.css('.navbar-end .navbar-item'));
    logoutLink.nativeElement.click();

    expect(authService.logout).toHaveBeenCalled();
  });

  it('should have navbar toggler', () => {
    const toggler = fixture.debugElement.query(By.css('.navbar-toggler'));
    expect(toggler).toBeTruthy();
    expect(toggler.query(By.css('.navbar-toggler-icon'))).toBeTruthy();
  });
});
