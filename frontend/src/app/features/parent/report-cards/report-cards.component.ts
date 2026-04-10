import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { MarksService } from '../../../core/services/marks.service';
import { ReportCard } from '../../../core/models/marks.model';

@Component({
  selector: 'app-report-cards',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1>Report Cards</h1>
      </div>

      <mat-card class="filter-card">
        <mat-card-content>
          <div class="filter-row">
            <mat-form-field appearance="outline">
              <mat-label>Select Exam</mat-label>
              <mat-select [(ngModel)]="selectedExamId" (ngModelChange)="loadReportCard()">
                <mat-option *ngFor="let e of exams" [value]="e.id">{{ e.examName }} ({{ e.academicYear }})</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <div *ngIf="loading" class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>

      <mat-card *ngIf="reportCard && !loading" class="report-card-view">
        <mat-card-header>
          <div class="report-header">
            <h2>Report Card</h2>
            <button mat-raised-button color="primary" (click)="downloadPdf()" [disabled]="downloading">
              <mat-spinner *ngIf="downloading" diameter="18" style="display:inline-block;margin-right:6px;"></mat-spinner>
              <mat-icon *ngIf="!downloading">download</mat-icon>
              {{ downloading ? 'Downloading...' : 'Download PDF' }}
            </button>
          </div>
        </mat-card-header>
        <mat-card-content>
          <div class="student-info-grid">
            <div class="info-item"><span class="info-label">Student Name</span><span class="info-value">{{ reportCard.studentName }}</span></div>
            <div class="info-item"><span class="info-label">Roll Number</span><span class="info-value">{{ reportCard.rollNumber }}</span></div>
            <div class="info-item"><span class="info-label">Class</span><span class="info-value">{{ reportCard.className }}</span></div>
            <div class="info-item"><span class="info-label">Section</span><span class="info-value">{{ reportCard.sectionName }}</span></div>
            <div class="info-item"><span class="info-label">Exam</span><span class="info-value">{{ reportCard.examName }}</span></div>
            <div class="info-item"><span class="info-label">Academic Year</span><span class="info-value">{{ reportCard.academicYear }}</span></div>
          </div>

          <h3 class="section-subtitle">Subject-wise Marks</h3>
          <table mat-table [dataSource]="reportCard.subjectMarks" class="full-width-table marks-table">
            <ng-container matColumnDef="subjectName">
              <th mat-header-cell *matHeaderCellDef>Subject</th>
              <td mat-cell *matCellDef="let m">{{ m.subjectName }}</td>
            </ng-container>
            <ng-container matColumnDef="marksObtained">
              <th mat-header-cell *matHeaderCellDef>Marks Obtained</th>
              <td mat-cell *matCellDef="let m">{{ m.marksObtained }}</td>
            </ng-container>
            <ng-container matColumnDef="maxMarks">
              <th mat-header-cell *matHeaderCellDef>Max Marks</th>
              <td mat-cell *matCellDef="let m">{{ m.maxMarks }}</td>
            </ng-container>
            <ng-container matColumnDef="percentage">
              <th mat-header-cell *matHeaderCellDef>Percentage</th>
              <td mat-cell *matCellDef="let m">{{ m.percentage | number:'1.1-1' }}%</td>
            </ng-container>
            <ng-container matColumnDef="grade">
              <th mat-header-cell *matHeaderCellDef>Grade</th>
              <td mat-cell *matCellDef="let m">
                <span [class]="'grade grade-' + m.grade">{{ m.grade }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="remarks">
              <th mat-header-cell *matHeaderCellDef>Remarks</th>
              <td mat-cell *matCellDef="let m">{{ m.remarks }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="marksColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: marksColumns;"></tr>
          </table>

          <div class="totals-row">
            <div class="total-item">
              <span class="total-label">Total Marks</span>
              <span class="total-value">{{ reportCard.totalMarks }} / {{ reportCard.maxTotalMarks }}</span>
            </div>
            <div class="total-item">
              <span class="total-label">Percentage</span>
              <span class="total-value">{{ reportCard.percentage | number:'1.1-1' }}%</span>
            </div>
            <div class="total-item">
              <span class="total-label">Overall Grade</span>
              <span [class]="'grade grade-' + reportCard.overallGrade + ' grade-lg'">{{ reportCard.overallGrade }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <div *ngIf="!loading && !reportCard && selectedExamId" class="empty-state">
        <mat-icon>info_outline</mat-icon>
        <p>No report card found for the selected exam.</p>
      </div>

      <div *ngIf="!selectedExamId && !loading" class="empty-state">
        <mat-icon>description</mat-icon>
        <p>Select an exam above to view the report card.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.8rem; font-weight: 500; color: #3f51b5; }
    .filter-card { margin-bottom: 20px; }
    .filter-row { display: flex; gap: 16px; }
    .filter-row mat-form-field { min-width: 280px; }
    .loading-center { display: flex; justify-content: center; padding: 40px; }
    .empty-state { text-align: center; padding: 48px; color: #999; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; display: block; margin: 0 auto 12px; }
    .report-header { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 16px; }
    .report-header h2 { margin: 0; font-size: 1.4rem; }
    .student-info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; background: #f5f5f5; padding: 16px; border-radius: 8px; }
    .info-item { display: flex; flex-direction: column; }
    .info-label { font-size: 0.75rem; text-transform: uppercase; color: #666; letter-spacing: 0.5px; }
    .info-value { font-size: 1rem; font-weight: 500; color: #333; }
    .section-subtitle { font-size: 1rem; font-weight: 500; margin: 16px 0 8px; color: #555; }
    .full-width-table { width: 100%; }
    .marks-table { margin-bottom: 24px; }
    .totals-row { display: flex; gap: 32px; flex-wrap: wrap; background: #e8eaf6; padding: 16px; border-radius: 8px; }
    .total-item { display: flex; flex-direction: column; align-items: center; }
    .total-label { font-size: 0.75rem; text-transform: uppercase; color: #555; letter-spacing: 0.5px; }
    .total-value { font-size: 1.4rem; font-weight: 700; color: #3f51b5; margin-top: 4px; }
    .grade { padding: 2px 8px; border-radius: 8px; font-weight: 600; font-size: 0.85rem; }
    .grade-lg { font-size: 1.3rem; padding: 4px 12px; }
    .grade-A, .grade-A\\+ { background: #e8f5e9; color: #2e7d32; }
    .grade-B { background: #e3f2fd; color: #1565c0; }
    .grade-C { background: #fff3e0; color: #e65100; }
    .grade-D { background: #fce4ec; color: #880e4f; }
    .grade-F { background: #ffebee; color: #c62828; }
  `]
})
export class ReportCardsComponent implements OnInit {
  exams: any[] = [];
  selectedExamId: number | null = null;
  reportCard: ReportCard | null = null;
  loading = false;
  downloading = false;
  marksColumns = ['subjectName', 'marksObtained', 'maxMarks', 'percentage', 'grade', 'remarks'];

  constructor(private marksService: MarksService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.marksService.getChildReports().subscribe({ next: e => this.exams = e, error: () => {} });
  }

  loadReportCard(): void {
    if (!this.selectedExamId) return;
    this.loading = true;
    this.reportCard = null;
    this.marksService.getChildReportCard(this.selectedExamId).subscribe({
      next: rc => { this.reportCard = rc; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  downloadPdf(): void {
    if (!this.selectedExamId) return;
    this.downloading = true;
    this.marksService.downloadReportPdf(this.selectedExamId).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-card-${this.selectedExamId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloading = false;
        this.snackBar.open('PDF downloaded!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.downloading = false;
        this.snackBar.open('Error downloading PDF', 'Close', { duration: 3000 });
      }
    });
  }
}
