import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StripeService } from './stripe.service';
import { environment } from '../../environments/environment';

describe('StripeService', () => {
  let service: StripeService;
  let httpMock: HttpTestingController;

  // Create Stripe mock
  const stripeMock = {
    redirectToCheckout: jasmine.createSpy('redirectToCheckout')
      .and.returnValue(Promise.resolve({ error: null }))
  };

  // Mock loadStripe globally
  (window as any).Stripe = jasmine.createSpy('Stripe').and.returnValue(stripeMock);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StripeService]
    });

    service = TestBed.inject(StripeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create checkout session and redirect', fakeAsync(async () => {
    const cartItems = [
      { code: 'TEST1', name: 'Test Trip', price: 999, quantity: 1, image: 'test.jpg' }
    ];

    const sessionPromise = service.createCheckoutSession(cartItems);
    tick();

    const req = httpMock.expectOne(`${service['apiUrl']}/create-checkout-session`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'test-session-id' });

    await sessionPromise;
    tick();

    expect(stripeMock.redirectToCheckout).toHaveBeenCalledWith({
      sessionId: 'test-session-id'
    });
  }));
});
