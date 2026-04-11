import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, RouterLink],
  template: `
    <mat-toolbar color="primary" class="fixed-navbar">
      <span class="brand-title" (click)="goHome()" title="Go to Dashboard">
        School Administration System
      </span>
      <span class="spacer"></span>
      <span style="margin-right: 12px; font-weight: 500;">{{ role }}</span>
      <button mat-icon-button (click)="logout()" title="Logout">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>
    <!-- Spacer so page content is not hidden under fixed navbar -->
    <div class="navbar-spacer"></div>
  `,
  styles: [`
    .fixed-navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    }
    .navbar-spacer {
      height: 64px;
    }
    .spacer { flex: 1 1 auto; }
    .brand-title {
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      letter-spacing: 0.3px;
      transition: opacity 0.15s;
    }
    .brand-title:hover {
      opacity: 0.85;
    }
  `]
})
export class NavbarComponent {
  role = localStorage.getItem('role') || '';

  constructor(private auth: AuthService, private router: Router) {}

  goHome(): void {
    const role = (localStorage.getItem('role') || '').toUpperCase();
    if (role === 'ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else if (role === 'TEACHER') {
      this.router.navigate(['/teacher/dashboard']);
    } else if (role === 'PARENT') {
      this.router.navigate(['/parent/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  logout() { this.auth.logout(); }
}
