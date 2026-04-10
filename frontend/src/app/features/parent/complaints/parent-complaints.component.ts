import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-parent-complaints',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSelectModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatChipsModule, NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1>Complaints</h1>
      </div>

      <mat-card class="form-card">
        <mat-card-title>Submit a Complaint</mat-card-title>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Select Teacher</mat-label>
              <mat-select formControlName="teacherId">
                <mat-option *ngFor="let t of teachers" [value]="t.id">{{ t.fullName }}</mat-option>
              </mat-select>
              <mat-error>Required</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Subject</mat-label>
              <input matInput formControlName="subject" placeholder="Brief subject of your complaint">
              <mat-error>Required</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Message</mat-label>
              <textarea matInput formControlName="message" rows="5" placeholder="Describe your complaint in detail"></textarea>
              <mat-error>Required</mat-error>
            </mat-form-field>
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving">
                <mat-spinner *ngIf="saving" diameter="18" style="display:inline-block;margin-right:6px;"></mat-spinner>
                <mat-icon *ngIf="!saving">send</mat-icon>
                {{ saving ? 'Submitting...' : 'Submit Complaint' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <h2 class="section-title">My Complaints</h2>
      <div *ngIf="loading" class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>

      <div *ngIf="!loading && complaints.length === 0" class="empty-state">
        <mat-icon>inbox</mat-icon>
        <p>No complaints submitted yet.</p>
      </div>

      <mat-card *ngFor="let c of complaints" class="complaint-card">
        <mat-card-content>
          <div class="complaint-header">
            <div>
              <div class="complaint-subject">{{ c.subject }}</div>
              <div class="complaint-meta">To: <strong>{{ c.teacherName }}</strong> &nbsp;|&nbsp; {{ c.createdAt | date:'mediumDate' }}</div>
            </div>
            <span [class]="'badge ' + c.status.toLowerCase()">{{ c.status }}</span>
          </div>
          <div class="complaint-message">{{ c.message }}</div>
          <div *ngIf="c.reply" class="reply-box">
            <mat-icon>reply</mat-icon>
            <div>
              <div class="reply-label">Teacher's Reply:</div>
              <div>{{ c.reply }}</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 900px; margin: 0 auto; }
    .page-header h1 { margin: 0 0 24px; font-size: 1.8rem; font-weight: 500; color: #3f51b5; }
    .form-card { margin-bottom: 24px; }
    .full-width { width: 100%; margin-bottom: 4px; }
    .form-actions { margin-top: 8px; }
    .section-title { font-size: 1.2rem; font-weight: 500; margin: 24px 0 12px; color: #333; }
    .loading-center { display: flex; justify-content: center; padding: 40px; }
    .empty-state { text-align: center; padding: 40px; color: #999; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; display: block; margin: 0 auto 12px; }
    .complaint-card { margin-bottom: 16px; }
    .complaint-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .complaint-subject { font-size: 1.05rem; font-weight: 600; color: #222; }
    .complaint-meta { font-size: 0.85rem; color: #666; margin-top: 2px; }
    .complaint-message { font-size: 0.95rem; color: #444; line-height: 1.5; }
    .reply-box { display: flex; gap: 10px; margin-top: 12px; background: #e8f5e9; border-radius: 8px; padding: 12px; }
    .reply-box mat-icon { color: #388e3c; flex-shrink: 0; }
    .reply-label { font-size: 0.8rem; font-weight: 600; color: #388e3c; margin-bottom: 2px; }
    .badge { padding: 4px 12px; border-radius: 12px; font-size: 0.78rem; font-weight: 600; white-space: nowrap; }
    .badge.pending { background: #fff8e1; color: #f57f17; }
    .badge.resolved { background: #e8f5e9; color: #2e7d32; }
  `]
})
export class ParentComplaintsComponent implements OnInit {
  form: FormGroup;
  teachers: any[] = [];
  complaints: any[] = [];
  loading = false;
  saving = false;
  private api = 'http://localhost:8080/api';

  constructor(private fb: FormBuilder, private http: HttpClient, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      teacherId: ['', Validators.required],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  private get headers() {
    return new HttpHeaders({ Authorization: 'Bearer ' + localStorage.getItem('token') });
  }

  ngOnInit(): void {
    this.http.get<any[]>(`${this.api}/parent/teachers`, { headers: this.headers }).subscribe({
      next: t => this.teachers = t, error: () => {}
    });
    this.loadComplaints();
  }

  loadComplaints(): void {
    this.loading = true;
    this.http.get<any[]>(`${this.api}/parent/complaints`, { headers: this.headers }).subscribe({
      next: c => { this.complaints = c; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.http.post<any>(`${this.api}/parent/complaints`, this.form.value, { headers: this.headers }).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Complaint submitted!', 'Close', { duration: 3000 });
        this.form.reset();
        this.loadComplaints();
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Failed to submit complaint', 'Close', { duration: 3000 });
      }
    });
  }
}
