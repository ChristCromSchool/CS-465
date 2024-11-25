import { Injectable, Inject, NgZone } from '@angular/core';
import { BROWSER_STORAGE } from '../storage';
import { TripDataService } from '../services/trip-data.service';
import { User } from '../models/user';
import { AuthResponse } from '../models/authresponse';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiBaseUrl = 'http://localhost:3000/api';
  private readonly GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
  private authStateSubject = new BehaviorSubject<boolean>(false);
  authState$ = this.authStateSubject.asObservable();

  constructor(
    @Inject(BROWSER_STORAGE) private storage: Storage,
    private tripDataService: TripDataService,
    private http: HttpClient,
    private ngZone: NgZone
  ) {
    // Initialize after DOM loads
    if (document.readyState === 'complete') {
      this.initializeGoogleSignIn();
    } else {
      window.addEventListener('load', () => this.initializeGoogleSignIn());
    }
    // Initialize auth state
    this.authStateSubject.next(this.isLoggedIn());
  }

  private initializeGoogleSignIn(): void {
    if (!environment.googleClientId) {
      console.error('Google Client ID not configured');
      return;
    }

    try {
      google?.accounts?.id?.initialize({
        client_id: environment.googleClientId,
        auto_select: false,
        callback: (response: any) => {
          this.ngZone.run(() => this.handleGoogleResponse(response));
        },
        prompt_parent_id: 'google-btn-container',
        itp_support: true
      });

      // Render button
      google?.accounts?.id?.renderButton(
        document.getElementById('google-btn-container'),
        { theme: 'outline', size: 'large', width: 250 }
      );
    } catch (error) {
      console.error('Google Sign-In initialization failed:', error);
    }
  }

  private handleGoogleResponse(response: any): void {
    if (!response?.credential) {
      console.error('No credential received');
      return;
    }

    this.http.post<AuthResponse>(`${this.apiBaseUrl}/auth/google`, {
      token: response.credential
    }).subscribe({
      next: (authResp) => {
        if (authResp?.token) {
          this.saveToken(authResp.token);
          window.location.reload();
        }
      },
      error: (error) => {
        console.error('Authentication failed:', error);
      }
    });
  }

  public getToken(): string {
    const token = this.storage.getItem('travlr-token');
    return token || '';
  }

  public saveToken(token: string): void {
    if (token) {
      this.storage.setItem('travlr-token', token);
      this.updateAuthState(true);
    }
  }

  public login(user: User): Promise<any> {
    return this.tripDataService.login(user)
      .then((authResp: AuthResponse) => {
        if (authResp && authResp.token) {
          this.saveToken(authResp.token);
          return authResp;
        }
        throw new Error('Invalid login response');
      });
  }

  public register(user: User): Promise<any> {
    return this.tripDataService.register(user)
      .then((authResp: AuthResponse) => {
        if (authResp && authResp.token) {
          this.saveToken(authResp.token);
          return authResp;
        }
        throw new Error('Invalid registration response');
      });
  }

  public logout(): void {
    this.storage.removeItem('travlr-token');
    this.authStateSubject.next(false);
  }

  public isLoggedIn(): boolean {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp > (Date.now() / 1000);
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  public getCurrentUser(): any {
    if (this.isLoggedIn()) {
      const token = this.getToken();
      const { email, name } = JSON.parse(atob(token.split('.')[1]));
      return { email, name };
    }
    return null;
  }

  public googleLogin(): void {
    try {
      google?.accounts?.id?.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google Sign-In prompt failed:', notification.getNotDisplayedReason());
        }
      });
    } catch (error) {
      console.error('Google Sign-In prompt failed:', error);
    }
  }

  public initiateGoogleLogin() {
    const params = {
      client_id: environment.googleClientId,
      redirect_uri: 'http://localhost:4200/auth/callback',
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline'
    };

    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    window.location.href = `${this.GOOGLE_AUTH_URL}?${queryString}`;
  }

  // Update other auth methods to emit state changes
  private updateAuthState(loggedIn: boolean) {
    this.authStateSubject.next(loggedIn);
  }
}
