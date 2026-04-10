import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="header-content">
            <mat-icon class="school-icon">school</mat-icon>
            <mat-card-title>School Administration System</mat-card-title>
            <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <mat-icon matPrefix>person</mat-icon>
              <input matInput formControlName="username" placeholder="Enter your username" autocomplete="username">
              <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                Username is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Enter your password" autocomplete="current-password">
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>

            <div *ngIf="errorMessage" class="error-message">
              <mat-icon>error_outline</mat-icon>
              <span>{{ errorMessage }}</span>
            </div>

            <button mat-raised-button color="primary" type="submit" class="full-width login-btn"
              [disabled]="loginForm.invalid || loading">
              <mat-spinner *ngIf="loading" diameter="20" style="display:inline-block; margin-right:8px;"></mat-spinner>
              <span>{{ loading ? 'Signing in...' : 'Sign In' }}</span>
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p class="register-link">
            Are you a parent? <a routerLink="/register">Register here</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #3f51b5 0%, #5c6bc0 50%, #7986cb 100%);
      padding: 16px;
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    }
    .header-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      margin-bottom: 16px;
    }
    .school-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #3f51b5;
      margin-bottom: 8px;
    }
    mat-card-title {
      text-align: center;
      font-size: 1.4rem;
      font-weight: 500;
    }
    mat-card-subtitle {
      text-align: center;
      margin-top: 4px;
    }
    mat-card-content form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 16px;
    }
    .full-width {
      width: 100%;
    }
    .login-btn {
      margin-top: 8px;
      height: 44px;
      font-size: 1rem;
      letter-spacing: 0.5px;
    }
    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f44336;
      background: #fff3f3;
      border: 1px solid #ffcdd2;
      border-radius: 4px;
      padding: 10px 14px;
      margin-bottom: 8px;
      font-size: 0.9rem;
    }
    .error-message mat-icon {
      font-size: 18px;
      height: 18px;
      width: 18px;
    }
    mat-card-actions {
      display: flex;
      justify-content: center;
      padding-top: 8px;
    }
    .register-link {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
    }
    .register-link a {
      color: #3f51b5;
      text-decoration: none;
      font-weight: 500;
    }
    .register-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  hidePassword = true;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.auth.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Invalid username or password. Please try again.';
        } else {
          this.errorMessage = 'An error occurred. Please try again later.';
        }
      }
    });
  }
}
