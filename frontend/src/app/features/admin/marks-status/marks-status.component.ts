import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ExamService } from '../../../core/services/exam.service';
import { Exam } from '../../../core/models/exam.model';

@Component({
  selector: 'app-marks-status',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTableModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1>Marks Entry Status</h1>
      </div>

      <mat-card class="filter-card">
        <mat-card-content>
          <div class="filter-row">
            <mat-form-field appearance="outline">
              <mat-label>Select Exam</mat-label>
              <mat-select [(ngModel)]="selectedExamId" (ngModelChange)="loadStatus()">
                <mat-option *ngFor="let e of exams" [value]="e.id">{{ e.examName }} ({{ e.academicYear }})</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <div *ngIf="loading" class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>

      <mat-card *ngIf="!loading && statusData">
        <mat-card-title>Status for {{ selectedExamName }}</mat-card-title>
        <mat-card-content>
          <div class="summary-row">
            <div class="summary-item">
              <span class="summary-label">Total Expected Entries</span>
              <span class="summary-value">{{ totalExpected }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Entries Completed</span>
              <span class="summary-value success">{{ totalEntered }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Pending Entries</span>
              <span class="summary-value warn">{{ totalExpected - totalEntered }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Completion</span>
              <span class="summary-value">{{ getPercentage() }}%</span>
            </div>
          </div>
          <mat-progress-bar mode="determinate" [value]="getPercentage()" class="progress-bar"></mat-progress-bar>

          <table mat-table [dataSource]="statusData.subjectStatuses || []" class="full-width-table status-table" *ngIf="statusData.subjectStatuses?.length">
            <ng-container matColumnDef="subjectName">
              <th mat-header-cell *matHeaderCellDef>Subject</th>
              <td mat-cell *matCellDef="let t">{{ t.subjectName }}</td>
            </ng-container>
            <ng-container matColumnDef="entered">
              <th mat-header-cell *matHeaderCellDef>Marks Entered</th>
              <td mat-cell *matCellDef="let t">{{ t.studentsWithMarks }}</td>
            </ng-container>
            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Total Students</th>
              <td mat-cell *matCellDef="let t">{{ t.totalStudents }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let t">
                <span [class]="t.complete ? 'badge complete' : 'badge pending'">
                  {{ t.complete ? 'Complete' : 'Pending' }}
                </span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="subjectStatusColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: subjectStatusColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <div *ngIf="!loading && !statusData && selectedExamId" class="empty-state">
        <mat-icon>info_outline</mat-icon>
        <p>No marks status data found for selected exam.</p>
      </div>

      <div *ngIf="!selectedExamId && !loading" class="empty-state">
        <mat-icon>info_outline</mat-icon>
        <p>Select an exam above to view marks entry status.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.8rem; font-weight: 500; color: #3f51b5; }
    .filter-card { margin-bottom: 20px; }
    .filter-row { display: flex; gap: 16px; }
    .filter-row mat-form-field { min-width: 280px; }
    .summary-row { display: flex; gap: 24px; flex-wrap: wrap; margin: 16px 0; }
    .summary-item { display: flex; flex-direction: column; gap: 4px; }
    .summary-label { font-size: 0.8rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-value { font-size: 1.8rem; font-weight: 700; color: #333; }
    .summary-value.success { color: #2e7d32; }
    .summary-value.warn { color: #e65100; }
    .progress-bar { height: 8px; border-radius: 4px; margin-bottom: 24px; }
    .full-width-table { width: 100%; }
    .status-table { margin-top: 8px; }
    .loading-center { display: flex; justify-content: center; padding: 40px; }
    .empty-state { text-align: center; padding: 48px; color: #999; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; display: block; margin: 0 auto 12px; }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 500; }
    .badge.complete { background: #e8f5e9; color: #2e7d32; }
    .badge.pending { background: #fff3e0; color: #e65100; }
  `]
})
export class MarksStatusComponent implements OnInit {
  exams: Exam[] = [];
  selectedExamId: number | null = null;
  selectedExamName = '';
  statusData: any = null;
  loading = false;
  totalExpected = 0;
  totalEntered = 0;
  subjectStatusColumns = ['subjectName', 'entered', 'total', 'status'];

  constructor(private examService: ExamService) {}

  ngOnInit(): void {
    this.examService.getExams().subscribe({ next: e => this.exams = e, error: () => {} });
  }

  loadStatus(): void {
    if (!this.selectedExamId) return;
    const exam = this.exams.find(e => e.id === this.selectedExamId);
    this.selectedExamName = exam?.examName || '';
    this.loading = true;
    this.statusData = null;
    this.examService.getMarksStatus(this.selectedExamId).subscribe({
      next: d => {
        this.statusData = d;
        const subjects: any[] = d.subjectStatuses || [];
        this.totalExpected = subjects.reduce((sum: number, s: any) => sum + (s.totalStudents || 0), 0);
        this.totalEntered = subjects.reduce((sum: number, s: any) => sum + (s.studentsWithMarks || 0), 0);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getPercentage(): number {
    if (!this.totalExpected) return 0;
    return Math.round((this.totalEntered / this.totalExpected) * 100);
  }
}
