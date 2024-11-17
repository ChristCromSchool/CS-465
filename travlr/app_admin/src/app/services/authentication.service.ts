import { Injectable, Inject } from '@angular/core';
import { BROWSER_STORAGE } from '../storage';
import { TripDataService } from '../services/trip-data.service';
import { User } from '../models/user';
import { AuthResponse } from '../models/authresponse';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  constructor(
    @Inject(BROWSER_STORAGE) private storage: Storage,
    private tripDataService: TripDataService
  ) { }

  public getToken(): string {
    const token = this.storage.getItem('travlr-token');
    return token || '';
  }

  public saveToken(token: string): void {
    if (token) {
      this.storage.setItem('travlr-token', token);
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
}
