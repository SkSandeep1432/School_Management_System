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
    <nav class="navbar">
      <div class="nav-brand" (click)="goHome()" title="Go to Dashboard">
        <div class="brand-icon">
          <mat-icon>school</mat-icon>
        </div>
        <div class="brand-text">
          <span class="brand-name">School Administration</span>
          <span class="brand-sub">Management System</span>
        </div>
      </div>

      <div class="nav-right">
        <div class="role-badge">
          <mat-icon class="role-icon">{{ getRoleIcon() }}</mat-icon>
          <span>{{ role }}</span>
        </div>
        <button class="logout-btn" (click)="logout()" title="Logout">
          <mat-icon>logout</mat-icon>
          <span>Logout</span>
        </button>
      </div>
    </nav>
    <div class="navbar-spacer"></div>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      background: linear-gradient(135deg, #1a237e 0%, #3f51b5 50%, #5c6bc0 100%);
      box-shadow: 0 4px 20px rgba(26,35,126,0.35);
    }
    .navbar-spacer { height: 64px; }

    /* Brand */
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .nav-brand:hover { opacity: 0.9; }
    .brand-icon {
      width: 40px; height: 40px;
      background: rgba(255,255,255,0.2);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(4px);
    }
    .brand-icon mat-icon { color: #fff; font-size: 22px; }
    .brand-text { display: flex; flex-direction: column; }
    .brand-name { color: #fff; font-size: 1rem; font-weight: 700; line-height: 1.2; letter-spacing: 0.3px; }
    .brand-sub { color: rgba(255,255,255,0.65); font-size: 0.7rem; letter-spacing: 0.5px; }

    /* Right side */
    .nav-right { display: flex; align-items: center; gap: 12px; }
    .role-badge {
      display: flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 20px;
      padding: 4px 14px 4px 10px;
      color: #fff; font-size: 0.85rem; font-weight: 600;
      backdrop-filter: blur(4px);
    }
    .role-icon { font-size: 16px; width: 16px; height: 16px; }
    .logout-btn {
      display: flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 10px;
      padding: 6px 14px;
      color: #fff; font-size: 0.85rem; font-weight: 500;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
    }
    .logout-btn:hover { background: rgba(255,255,255,0.28); transform: translateY(-1px); }
    .logout-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
  `]
})
export class NavbarComponent {
  role = localStorage.getItem('role') || '';

  constructor(private auth: AuthService, private router: Router) {}

  getRoleIcon(): string {
    const r = this.role.toUpperCase();
    if (r === 'ADMIN') return 'admin_panel_settings';
    if (r === 'TEACHER') return 'person';
    if (r === 'PARENT') return 'family_restroom';
    return 'account_circle';
  }

  goHome(): void {
    const role = (localStorage.getItem('role') || '').toUpperCase();
    if (role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
    else if (role === 'TEACHER') this.router.navigate(['/teacher/dashboard']);
    else if (role === 'PARENT') this.router.navigate(['/parent/dashboard']);
    else this.router.navigate(['/']);
  }

  logout() { this.auth.logout(); }
}
