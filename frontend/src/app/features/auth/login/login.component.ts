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
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="login-wrapper">
      <!-- Left Panel -->
      <div class="left-panel">
        <div class="left-content">
          <div class="logo-circle">
            <mat-icon>school</mat-icon>
          </div>
          <h1 class="app-name">School Admin</h1>
          <p class="app-tagline">Manage your school smarter, faster, and easier.</p>
          <div class="features">
            <div class="feature-item"><mat-icon>check_circle</mat-icon><span>Student &amp; Teacher Management</span></div>
            <div class="feature-item"><mat-icon>check_circle</mat-icon><span>Exam &amp; Marks Tracking</span></div>
            <div class="feature-item"><mat-icon>check_circle</mat-icon><span>Attendance Overview</span></div>
            <div class="feature-item"><mat-icon>check_circle</mat-icon><span>Parent Notifications</span></div>
          </div>
        </div>
        <div class="blob blob1"></div>
        <div class="blob blob2"></div>
      </div>

      <!-- Right Panel: Login Form -->
      <div class="right-panel">
        <div class="form-box">
          <div class="form-header">
            <h2>Welcome Back 👋</h2>
            <p>Sign in to continue to your dashboard</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <div class="input-group">
              <label>Username</label>
              <div class="input-wrap" [class.invalid]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">
                <mat-icon>person_outline</mat-icon>
                <input formControlName="username" placeholder="Enter your username" autocomplete="username">
              </div>
              <span class="err-text" *ngIf="loginForm.get('username')?.hasError('required') && loginForm.get('username')?.touched">Username is required</span>
            </div>

            <div class="input-group">
              <label>Password</label>
              <div class="input-wrap" [class.invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                <mat-icon>lock_outline</mat-icon>
                <input [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Enter your password" autocomplete="current-password">
                <button type="button" class="eye-btn" (click)="hidePassword = !hidePassword">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              <span class="err-text" *ngIf="loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched">Password is required</span>
            </div>

            <div class="error-alert" *ngIf="errorMessage">
              <mat-icon>error_outline</mat-icon>
              <span>{{ errorMessage }}</span>
            </div>

            <button type="submit" class="sign-in-btn" [disabled]="loginForm.invalid || loading">
              <mat-spinner *ngIf="loading" diameter="18" style="display:inline-block;margin-right:8px;"></mat-spinner>
              <span>{{ loading ? 'Signing in...' : 'Sign In' }}</span>
              <mat-icon *ngIf="!loading">arrow_forward</mat-icon>
            </button>
          </form>

          <p class="register-link">
            Are you a parent? <a routerLink="/register">Create an account →</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      min-height: 100vh;
    }

    /* ── Left Panel ── */
    .left-panel {
      flex: 1;
      background: linear-gradient(145deg, #1a237e 0%, #3f51b5 55%, #7c4dff 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 40px;
      position: relative;
      overflow: hidden;
    }
    .left-content { position: relative; z-index: 2; color: #fff; max-width: 380px; }
    .logo-circle {
      width: 72px; height: 72px;
      background: rgba(255,255,255,0.2);
      border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 24px;
      animation: float 3s ease-in-out infinite;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.25);
    }
    .logo-circle mat-icon { font-size: 36px; width: 36px; height: 36px; color: #fff; }
    .app-name { font-size: 2.2rem; font-weight: 800; margin: 0 0 10px; letter-spacing: -0.5px; }
    .app-tagline { font-size: 1rem; color: rgba(255,255,255,0.75); margin-bottom: 32px; line-height: 1.5; }
    .features { display: flex; flex-direction: column; gap: 14px; }
    .feature-item { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; color: rgba(255,255,255,0.88); }
    .feature-item mat-icon { font-size: 18px; width: 18px; height: 18px; color: #80cbc4; }

    /* Blobs */
    .blob { position: absolute; border-radius: 50%; opacity: 0.12; }
    .blob1 { width: 300px; height: 300px; background: #fff; top: -80px; right: -80px; }
    .blob2 { width: 200px; height: 200px; background: #7c4dff; bottom: -60px; left: -40px; }

    /* ── Right Panel ── */
    .right-panel {
      flex: 0 0 480px;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 40px;
    }
    .form-box { width: 100%; max-width: 380px; animation: fadeInUp 0.4s ease both; }
    .form-header { margin-bottom: 32px; }
    .form-header h2 { font-size: 1.8rem; font-weight: 700; color: #1a237e; margin: 0 0 6px; }
    .form-header p { color: #888; font-size: 0.9rem; margin: 0; }

    /* Form */
    .login-form { display: flex; flex-direction: column; gap: 20px; }
    .input-group { display: flex; flex-direction: column; gap: 6px; }
    label { font-size: 0.85rem; font-weight: 600; color: #444; }
    .input-wrap {
      display: flex; align-items: center; gap: 10px;
      border: 1.5px solid #e0e0e0;
      border-radius: 12px;
      padding: 10px 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
      background: #fafafa;
    }
    .input-wrap:focus-within {
      border-color: #3f51b5;
      box-shadow: 0 0 0 3px rgba(63,81,181,0.12);
      background: #fff;
    }
    .input-wrap.invalid { border-color: #f44336; }
    .input-wrap mat-icon { color: #9e9e9e; font-size: 20px; width: 20px; height: 20px; flex-shrink: 0; }
    .input-wrap input {
      flex: 1; border: none; outline: none;
      font-size: 0.95rem; background: transparent; color: #333;
      font-family: inherit;
    }
    .eye-btn { background: none; border: none; cursor: pointer; color: #9e9e9e; padding: 0; display: flex; align-items: center; }
    .eye-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .err-text { font-size: 0.78rem; color: #f44336; padding-left: 4px; }

    .error-alert {
      display: flex; align-items: center; gap: 8px;
      background: #fff3f3; border: 1px solid #ffcdd2; border-radius: 10px;
      padding: 10px 14px; color: #c62828; font-size: 0.88rem;
    }
    .error-alert mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .sign-in-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 14px;
      background: linear-gradient(135deg, #3f51b5, #7c4dff);
      color: #fff; border: none; border-radius: 12px;
      font-size: 1rem; font-weight: 700; cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
      letter-spacing: 0.3px;
    }
    .sign-in-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
    .sign-in-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .sign-in-btn mat-icon { font-size: 20px; }

    .register-link { text-align: center; margin-top: 24px; font-size: 0.88rem; color: #888; }
    .register-link a { color: #3f51b5; font-weight: 600; text-decoration: none; }
    .register-link a:hover { text-decoration: underline; }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-8px); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .left-panel { display: none; }
      .right-panel { flex: 1; padding: 32px 24px; }
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
      next: () => { this.loading = false; },
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
