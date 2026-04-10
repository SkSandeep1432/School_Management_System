import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-teacher-complaints',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule,
    MatSnackBarModule, MatProgressSpinnerModule, NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1>Parent Complaints</h1>
      </div>

      <div *ngIf="loading" class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>

      <div *ngIf="!loading && complaints.length === 0" class="empty-state">
        <mat-icon>inbox</mat-icon>
        <p>No complaints received.</p>
      </div>

      <mat-card *ngFor="let c of complaints" class="complaint-card">
        <mat-card-content>
          <div class="complaint-header">
            <div>
              <div class="complaint-subject">{{ c.subject }}</div>
              <div class="complaint-meta">From: <strong>{{ c.parentEmail }}</strong> &nbsp;|&nbsp; {{ c.createdAt | date:'mediumDate' }}</div>
            </div>
            <span [class]="'badge ' + c.status.toLowerCase()">{{ c.status }}</span>
          </div>
          <div class="complaint-message">{{ c.message }}</div>

          <div *ngIf="c.reply" class="reply-box">
            <mat-icon>check_circle</mat-icon>
            <div>
              <div class="reply-label">Your Reply:</div>
              <div>{{ c.reply }}</div>
            </div>
          </div>

          <div *ngIf="!c.reply" class="reply-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Reply to this complaint</mat-label>
              <textarea matInput [(ngModel)]="replyText[c.id]" rows="3" placeholder="Type your reply..."></textarea>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="reply(c.id)" [disabled]="!replyText[c.id]">
              <mat-icon>send</mat-icon> Send Reply
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 900px; margin: 0 auto; }
    .page-header h1 { margin: 0 0 24px; font-size: 1.8rem; font-weight: 500; color: #3f51b5; }
    .loading-center { display: flex; justify-content: center; padding: 40px; }
    .empty-state { text-align: center; padding: 40px; color: #999; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; display: block; margin: 0 auto 12px; }
    .complaint-card { margin-bottom: 16px; }
    .complaint-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .complaint-subject { font-size: 1.05rem; font-weight: 600; color: #222; }
    .complaint-meta { font-size: 0.85rem; color: #666; margin-top: 2px; }
    .complaint-message { font-size: 0.95rem; color: #444; line-height: 1.5; margin-bottom: 12px; }
    .reply-box { display: flex; gap: 10px; background: #e8f5e9; border-radius: 8px; padding: 12px; }
    .reply-box mat-icon { color: #388e3c; flex-shrink: 0; }
    .reply-label { font-size: 0.8rem; font-weight: 600; color: #388e3c; margin-bottom: 2px; }
    .reply-form { margin-top: 12px; }
    .full-width { width: 100%; }
    .badge { padding: 4px 12px; border-radius: 12px; font-size: 0.78rem; font-weight: 600; white-space: nowrap; }
    .badge.pending { background: #fff8e1; color: #f57f17; }
    .badge.resolved { background: #e8f5e9; color: #2e7d32; }
  `]
})
export class TeacherComplaintsComponent implements OnInit {
  complaints: any[] = [];
  replyText: { [id: number]: string } = {};
  loading = false;
  private api = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  private get headers() {
    return new HttpHeaders({ Authorization: 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' });
  }

  ngOnInit(): void { this.loadComplaints(); }

  loadComplaints(): void {
    this.loading = true;
    this.http.get<any[]>(`${this.api}/teacher/complaints`, { headers: this.headers }).subscribe({
      next: c => { this.complaints = c; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  reply(id: number): void {
    const text = this.replyText[id];
    if (!text) return;
    this.http.put<any>(`${this.api}/teacher/complaints/${id}/reply`, { reply: text }, { headers: this.headers }).subscribe({
      next: () => {
        this.snackBar.open('Reply sent!', 'Close', { duration: 3000 });
        this.loadComplaints();
      },
      error: () => this.snackBar.open('Failed to send reply', 'Close', { duration: 3000 })
    });
  }
}
