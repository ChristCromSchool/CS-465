import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="row">
        <div class="col-12 col-md-8">
          <h2>Login</h2>
          <form (ngSubmit)="onLoginSubmit()">
            <div role="alert" *ngIf="formError" class="alert alert-danger">{{ formError }}</div>
            <div class="form-group">
              <label for="email">Email Address</label>
              <input type="email" class="form-control" id="email" name="email"
                     placeholder="Enter email address" [(ngModel)]="credentials.email">
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" class="form-control" id="password" name="password"
                     placeholder="Password" [(ngModel)]="credentials.password">
            </div>
            <div class="form-group mt-3">
              <button type="submit" class="btn btn-primary">Sign in</button>
            </div>
          </form>

          <div class="mt-4">
            <p class="text-center">Or</p>
            <button class="btn btn-outline-primary w-100" (click)="loginWithGoogle()">
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  public formError = '';
  public credentials = {
    name: '',
    email: '',
    password: ''
  };

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  public onLoginSubmit(): void {
    this.formError = '';
    if (!this.credentials.email || !this.credentials.password) {
      this.formError = 'All fields are required';
      return;
    }
    this.doLogin();
  }

  private doLogin(): void {
    this.authenticationService.login(this.credentials)
      .then(() => this.router.navigateByUrl('/'))
      .catch((message) => this.formError = message);
  }

  loginWithGoogle() {
    this.authenticationService.initiateGoogleLogin();
  }
}
