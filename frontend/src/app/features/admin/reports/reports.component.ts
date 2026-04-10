import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ExamService } from '../../../core/services/exam.service';
import { Exam } from '../../../core/models/exam.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1>Send Report Cards</h1>
      </div>

      <mat-card class="info-card">
        <mat-card-content>
          <div class="info-banner">
            <mat-icon>info</mat-icon>
            <div>
              <strong>How it works:</strong>
              <p>Select a locked exam and click "Send Reports" to email report cards to all parents. Only locked exams are eligible for report generation.</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-title>Select Exam to Send Reports</mat-card-title>
        <mat-card-content>
          <mat-form-field appearance="outline" style="min-width:300px; margin-top: 16px;">
            <mat-label>Select Locked Exam</mat-label>
            <mat-select [(ngModel)]="selectedExamId">
              <mat-option *ngFor="let e of lockedExams" [value]="e.id">
                {{ e.examName }} ({{ e.academicYear }})
              </mat-option>
            </mat-select>
          </mat-form-field>

          <div *ngIf="lockedExams.length === 0 && !loading" class="no-exams-msg">
            <mat-icon>lock_open</mat-icon>
            <p>No locked exams available. Lock an exam from the Exams page first.</p>
          </div>

          <div class="send-actions" *ngIf="lockedExams.length > 0">
            <button mat-raised-button color="primary" [disabled]="!selectedExamId || sending" (click)="sendReports()">
              <mat-spinner *ngIf="sending" diameter="20" style="display:inline-block;margin-right:8px;"></mat-spinner>
              <mat-icon *ngIf="!sending">send</mat-icon>
              {{ sending ? 'Sending...' : 'Send Report Cards' }}
            </button>
          </div>

          <div *ngIf="successMessage" class="success-msg">
            <mat-icon>check_circle</mat-icon>
            <span>{{ successMessage }}</span>
          </div>
          <div *ngIf="errorMessage" class="error-msg">
            <mat-icon>error_outline</mat-icon>
            <span>{{ errorMessage }}</span>
          </div>
        </mat-card-content>
      </mat-card>

      <div *ngIf="loading" class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 900px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.8rem; font-weight: 500; color: #3f51b5; }
    .info-card { margin-bottom: 20px; background: #e8eaf6; }
    .info-banner { display: flex; gap: 16px; align-items: flex-start; }
    .info-banner mat-icon { color: #3f51b5; margin-top: 2px; }
    .info-banner p { margin: 4px 0 0; color: #555; }
    .send-actions { margin-top: 16px; }
    .loading-center { display: flex; justify-content: center; padding: 40px; }
    .no-exams-msg { text-align: center; padding: 24px; color: #999; }
    .no-exams-msg mat-icon { font-size: 40px; height: 40px; width: 40px; display: block; margin: 0 auto 8px; }
    .success-msg {
      display: flex; align-items: center; gap: 8px;
      color: #388e3c; background: #f1f8e9; border: 1px solid #c8e6c9;
      border-radius: 4px; padding: 12px 16px; margin-top: 16px;
    }
    .error-msg {
      display: flex; align-items: center; gap: 8px;
      color: #f44336; background: #fff3f3; border: 1px solid #ffcdd2;
      border-radius: 4px; padding: 12px 16px; margin-top: 16px;
    }
  `]
})
export class ReportsComponent implements OnInit {
  exams: Exam[] = [];
  lockedExams: Exam[] = [];
  selectedExamId: number | null = null;
  loading = false;
  sending = false;
  successMessage = '';
  errorMessage = '';

  constructor(private examService: ExamService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loading = true;
    this.examService.getExams().subscribe({
      next: e => {
        this.exams = e;
        this.lockedExams = e.filter(ex => ex.isLocked);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  sendReports(): void {
    if (!this.selectedExamId) return;
    this.sending = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.examService.sendReports(this.selectedExamId).subscribe({
      next: (res: any) => {
        this.sending = false;
        this.successMessage = res?.message || 'Report generation started. Emails will be sent in the background.';
      },
      error: (err) => {
        this.sending = false;
        this.errorMessage = err.error?.message || 'Error sending reports. Please try again.';
      }
    });
  }
}
