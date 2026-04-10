import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register-parent',
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
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <div class="header-content">
            <mat-icon class="school-icon">family_restroom</mat-icon>
            <mat-card-title>Parent Registration</mat-card-title>
            <mat-card-subtitle>Create your parent account</mat-card-subtitle>
          </div>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="successMessage" class="success-message">
            <mat-icon>check_circle</mat-icon>
            <span>{{ successMessage }}</span>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" *ngIf="!successMessage">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <mat-icon matPrefix>badge</mat-icon>
              <input matInput formControlName="fullName" placeholder="Enter your full name">
              <mat-error *ngIf="registerForm.get('fullName')?.hasError('required')">
                Full name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <mat-icon matPrefix>email</mat-icon>
              <input matInput formControlName="email" type="email" placeholder="Enter your email">
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Create a password">
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>

            <div *ngIf="errorMessage" class="error-message">
              <mat-icon>error_outline</mat-icon>
              <span>{{ errorMessage }}</span>
            </div>

            <button mat-raised-button color="primary" type="submit" class="full-width register-btn"
              [disabled]="registerForm.invalid || loading">
              <mat-spinner *ngIf="loading" diameter="20" style="display:inline-block; margin-right:8px;"></mat-spinner>
              <span>{{ loading ? 'Registering...' : 'Register' }}</span>
            </button>
          </form>

          <div *ngIf="successMessage" class="back-to-login">
            <button mat-raised-button color="primary" routerLink="/login" class="full-width">
              <mat-icon>login</mat-icon>
              Go to Login
            </button>
          </div>
        </mat-card-content>

        <mat-card-actions *ngIf="!successMessage">
          <p class="login-link">
            Already have an account? <a routerLink="/login">Sign in here</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #3f51b5 0%, #5c6bc0 50%, #7986cb 100%);
      padding: 16px;
    }
    .register-card {
      width: 100%;
      max-width: 440px;
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
    .register-btn {
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
    .success-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #388e3c;
      background: #f1f8e9;
      border: 1px solid #c8e6c9;
      border-radius: 4px;
      padding: 14px 16px;
      margin: 16px 0;
      font-size: 0.95rem;
    }
    .error-message mat-icon,
    .success-message mat-icon {
      font-size: 20px;
      height: 20px;
      width: 20px;
    }
    mat-card-actions {
      display: flex;
      justify-content: center;
      padding-top: 8px;
    }
    .login-link {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
    }
    .login-link a {
      color: #3f51b5;
      text-decoration: none;
      font-weight: 500;
    }
    .login-link a:hover {
      text-decoration: underline;
    }
    .back-to-login {
      margin-top: 16px;
    }
  `]
})
export class RegisterParentComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.auth.registerParent(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Registration successful! You can now sign in with your credentials.';
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || '';
        if (msg.toLowerCase().includes('already exists')) {
          this.successMessage = 'An account with this email already exists. Please sign in instead.';
        } else {
          this.errorMessage = msg || 'An error occurred. Please try again later.';
        }
      }
    });
  }
}
