import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, RouterLink],
  template: `
    <mat-toolbar color="primary">
      <span>School Administration System</span>
      <span class="spacer"></span>
      <span style="margin-right: 12px;">{{ role }}</span>
      <button mat-icon-button (click)="logout()" title="Logout">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>
  `,
  styles: ['.spacer { flex: 1 1 auto; }']
})
export class NavbarComponent {
  role = localStorage.getItem('role') || '';
  constructor(private auth: AuthService) {}
  logout() { this.auth.logout(); }
}
