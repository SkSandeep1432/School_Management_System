import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1>Send Announcement</h1>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          <div class="audience-toggle">
            <label class="toggle-label">Send To:</label>
            <mat-button-toggle-group [(ngModel)]="audience" aria-label="Audience">
              <mat-button-toggle value="all">
                <mat-icon>group</mat-icon>&nbsp;All Parents &amp; Teachers
              </mat-button-toggle>
              <mat-button-toggle value="teachers">
                <mat-icon>school</mat-icon>&nbsp;Teachers Only
              </mat-button-toggle>
            </mat-button-toggle-group>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Subject</mat-label>
            <input matInput [(ngModel)]="subject" placeholder="e.g. School Holiday Notice">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Message</mat-label>
            <textarea matInput [(ngModel)]="message" rows="8"
              placeholder="Type your announcement here..."></textarea>
          </mat-form-field>

          <div class="form-actions">
            <button mat-raised-button color="primary" (click)="send()" [disabled]="!subject || !message || sending">
              <mat-spinner *ngIf="sending" diameter="18" style="display:inline-block;margin-right:6px;"></mat-spinner>
              <mat-icon *ngIf="!sending">send</mat-icon>
              {{ sending ? 'Sending...' : 'Send Announcement' }}
            </button>
          </div>

          <div class="preview-note">
            <mat-icon>info_outline</mat-icon>
            <span *ngIf="audience === 'all'">Email will be sent to <strong>all registered parents and teachers</strong>.</span>
            <span *ngIf="audience === 'teachers'">Email will be sent to <strong>all teachers</strong> only.</span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 800px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.8rem; font-weight: 500; color: #3f51b5; }
    .form-card { }
    .audience-toggle { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .toggle-label { font-size: 0.9rem; color: #555; font-weight: 500; white-space: nowrap; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .form-actions { margin-top: 8px; }
    .preview-note { display: flex; align-items: center; gap: 8px; margin-top: 16px; font-size: 0.9rem; color: #666; }
    .preview-note mat-icon { font-size: 18px; height: 18px; width: 18px; color: #3f51b5; }
  `]
})
export class AnnouncementsComponent implements OnInit {
  audience: 'all' | 'teachers' = 'all';
  subject = '';
  message = '';
  sending = false;

  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      if (p['audience'] === 'teachers') this.audience = 'teachers';
    });
  }

  send(): void {
    if (!this.subject || !this.message) return;
    this.sending = true;
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('token'),
      'Content-Type': 'application/json'
    });
    const endpoint = this.audience === 'all'
      ? `${this.apiUrl}/announcements/all`
      : `${this.apiUrl}/announcements/teachers`;

    this.http.post<{message: string}>(endpoint, { subject: this.subject, message: this.message }, { headers }).subscribe({
      next: () => {
        this.sending = false;
        this.snackBar.open('Announcement sent successfully!', 'Close', { duration: 4000 });
        this.subject = '';
        this.message = '';
      },
      error: (err) => {
        this.sending = false;
        this.snackBar.open(err.error?.message || 'Failed to send announcement', 'Close', { duration: 4000 });
      }
    });
  }
}
