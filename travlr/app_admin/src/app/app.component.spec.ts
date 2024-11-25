import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { By } from '@angular/platform-browser';
import { AuthenticationService } from './services/authentication.service';
import { TripDataService } from './services/trip-data.service';
import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';

import { FormsModule } from '@angular/forms';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authService: jasmine.SpyObj<AuthenticationService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthenticationService', ['isLoggedIn']);
    authSpy.isLoggedIn.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        AppComponent,
        NavbarComponent
      ],
      providers: [
        { provide: AuthenticationService, useValue: authSpy },
        TripDataService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct title', () => {
    expect(component.title).toBe('Travlr Getaways Admin');
  });

  it('should render navbar', () => {
    const navbar = fixture.debugElement.query(By.css('app-navbar'));
    expect(navbar).toBeTruthy('Navbar should be present');
  });

  it('should contain router outlet', () => {
    const routerOutlet = fixture.debugElement.query(By.css('router-outlet'));
    expect(routerOutlet).toBeTruthy('Router outlet should be present');
  });

  it('should have main container with proper classes', () => {
    const mainContainer = fixture.debugElement.query(By.css('.container'));
    expect(mainContainer).toBeTruthy('Main container should be present');
    expect(mainContainer.classes['container']).toBeTruthy('Should have container class');
  });

  it('should apply proper styling', () => {
    const compiled = fixture.debugElement.nativeElement;
    const styles = window.getComputedStyle(compiled);
    expect(styles.display).toBe('block');
  });
});
