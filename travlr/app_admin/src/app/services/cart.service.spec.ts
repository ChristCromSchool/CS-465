import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { AuthenticationService } from './authentication.service';
import { CartItem } from '../models/cart-item';
import { of } from 'rxjs';
import { first } from 'rxjs/operators';

// Define Cart interface locally if not exported
interface Cart {
  items: CartItem[];
  total: number;
}

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthenticationService>;

  // Increase Jasmine timeout
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

  // Mock data
  const mockCart: Cart = {
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

  // Auth service spy setup
  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthenticationService',
      ['isLoggedIn', 'getToken'], {
        // Properties
        user$: of(null)
      }
    );
    authSpy.isLoggedIn.and.returnValue(true);
    authSpy.getToken.and.returnValue('fake-token');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CartService,
        { provide: AuthenticationService, useValue: authSpy }
      ]
    });

    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', fakeAsync(() => {
    // Service should be created
    expect(service).toBeTruthy();

    // Handle initial loadCart request that happens in constructor
    const req = httpMock.expectOne('http://localhost:3000/api/cart');
    expect(req.request.method).toBe('GET');
    req.flush(mockCart);
    tick();

    // Verify no pending requests
    httpMock.verify();
  }));

  // Load cart test
  it('should load cart', fakeAsync(() => {
    // Handle initial loadCart from constructor
    const initialReq = httpMock.expectOne('http://localhost:3000/api/cart');
    expect(initialReq.request.method).toBe('GET');
    initialReq.flush(mockCart);
    tick();

    // Trigger explicit loadCart
    service.loadCart();
    tick();

    // Handle second loadCart request
    const loadCartReq = httpMock.expectOne('http://localhost:3000/api/cart');
    expect(loadCartReq.request.method).toBe('GET');
    expect(loadCartReq.request.headers.has('Authorization')).toBeTrue();
    loadCartReq.flush(mockCart);
    tick();

    // Verify cart state
    service.cart$.pipe(first()).subscribe(cart => {
      expect(cart).toEqual(mockCart);
    });

    // Verify no pending requests
    httpMock.verify();
  }));

  it('should add item to cart', fakeAsync(() => {
    // Handle initial loadCart request
    const loadCartReq = httpMock.expectOne('http://localhost:3000/api/cart');
    expect(loadCartReq.request.method).toBe('GET');
    loadCartReq.flush(mockCart);
    tick();

    const trip = {
      code: 'TEST1',
      name: 'Test Trip',
      price: 999,
      image: 'test.jpg'
    };

    // Add to cart
    service.addToCart(trip);
    tick();

    // Handle addToCart request
    const addToCartReq = httpMock.expectOne('http://localhost:3000/api/cart');
    expect(addToCartReq.request.method).toBe('POST');
    expect(addToCartReq.request.body.items[0]).toEqual({
      code: trip.code,
      name: trip.name,
      price: trip.price,
      quantity: 1,
      image: trip.image
    });
    addToCartReq.flush(mockCart);
    tick();

    // Verify final cart state
    service.cart$.pipe(first()).subscribe(cart => {
      expect(cart).toEqual(mockCart);
    });

    // Verify no pending requests
    httpMock.verify();
  }));

  // Remove from cart test
  it('should remove item from cart', fakeAsync(() => {
    // Handle initial loadCart
    const loadCartReq = httpMock.expectOne('http://localhost:3000/api/cart');
    expect(loadCartReq.request.method).toBe('GET');
    loadCartReq.flush(mockCart);
    tick();

    // Remove item
    service.removeFromCart('TEST1');
    tick();

    const removeReq = httpMock.expectOne('http://localhost:3000/api/cart/item/TEST1');
    expect(removeReq.request.method).toBe('DELETE');
    removeReq.flush({ ...mockCart, items: [] });
    tick();

    service.cart$.pipe(first()).subscribe(cart => {
      expect(cart.items.length).toBe(0);
    });

    httpMock.verify();
  }));




});
