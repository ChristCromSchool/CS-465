// app_admin/src/app/auth/auth-callback.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-callback',
  template: `
    <div class="container mt-5">
      <div *ngIf="loading" class="alert alert-info">
        Processing login...
      </div>
      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class AuthCallbackComponent implements OnInit {
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.http.post('http://localhost:3000/api/auth/google/callback', { code: params['code'] })
          .subscribe({
            next: (response: any) => {
              localStorage.setItem('travlr-token', response.token);
              this.loading = false;
              // Redirect with success message
              this.router.navigate(['/'], {
                state: { message: 'Successfully logged in!' }
              });
            },
            error: (error) => {
              this.loading = false;
              this.error = 'Authentication failed. Please try again.';
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 3000);
            }
          });
      }
    });
  }
}
