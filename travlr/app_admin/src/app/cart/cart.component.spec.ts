import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CartComponent } from './cart.component';
import { CartService } from '../services/cart.service';
import { AuthenticationService } from '../services/authentication.service';
import { of } from 'rxjs';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let cartServiceSpy: jasmine.SpyObj<CartService>;

  const mockCart = {
    items: [
      {
        code: 'TEST1',
        name: 'Test Trip',
        price: 999,
        quantity: 1,
        image: 'test.jpg'
      }
    ],
    total: 999
  };

  beforeEach(async () => {
    // Create CartService spy
    cartServiceSpy = jasmine.createSpyObj('CartService',
      ['loadCart', 'addToCart', 'removeFromCart'],
      { cart$: of(mockCart) }
    );

    // Create AuthService spy
    const authServiceSpy = jasmine.createSpyObj('AuthenticationService',
      ['isLoggedIn', 'getToken'],
      { user$: of(null) }
    );

    await TestBed.configureTestingModule({
      imports: [
        CartComponent,
        HttpClientTestingModule
      ],
      providers: [
        { provide: CartService, useValue: cartServiceSpy },
        { provide: AuthenticationService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display cart items', () => {
    expect(fixture.nativeElement.textContent).toContain('Test Trip');
    expect(fixture.nativeElement.textContent).toContain('999');
  });

  it('should remove item from cart', () => {
    component.removeFromCart('TEST1');
    expect(cartServiceSpy.removeFromCart).toHaveBeenCalledWith('TEST1');
  });
});
