// app_admin/src/app/auth/auth-callback.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../services/authentication.service';
@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  providers: [AuthenticationService],

  template: `
    <div class="container mt-5">
      <div *ngIf="loading" class="alert alert-info">Processing...</div>
      <div *ngIf="error" class="alert alert-danger">{{error}}</div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthenticationService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        console.log('Received auth code:', params['code']);

        this.http.post<any>('http://localhost:3000/api/auth/google/callback', {
          code: params['code']
        }).subscribe({
          next: (response) => {
            console.log('Auth response:', response);
            if (response && response.token) {
              try {
                localStorage.setItem('travlr-token', response.token);
                console.log('Token stored:', localStorage.getItem('travlr-token'));
                this.loading = false;
                this.router.navigate(['/']);
              } catch (error) {
                console.error('Error storing token:', error);
                this.error = 'Failed to store authentication token';
              }
            } else {
              console.error('No token in response:', response);
              this.error = 'Invalid authentication response';
            }
          },
          error: (error) => {
            console.error('Authentication error:', error);
            this.error = error.message || 'Authentication failed';
            this.loading = false;
          }
        });
      } else {
        console.error('No auth code in params:', params);
        this.error = 'No authentication code received';
        this.loading = false;
      }
    });
  }
}
