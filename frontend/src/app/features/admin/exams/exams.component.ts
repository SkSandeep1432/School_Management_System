import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ExamService } from '../../../core/services/exam.service';
import { Exam } from '../../../core/models/exam.model';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1>Exams Management</h1>
        <button mat-raised-button color="primary" (click)="showForm = !showForm">
          <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
          {{ showForm ? 'Cancel' : 'Create Exam' }}
        </button>
      </div>

      <mat-card *ngIf="showForm" class="form-card">
        <mat-card-title>Create New Exam</mat-card-title>
        <mat-card-content>
          <form [formGroup]="examForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Exam Name</mat-label>
                <input matInput formControlName="examName">
                <mat-error *ngIf="examForm.get('examName')?.hasError('required')">Required</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Exam Type</mat-label>
                <mat-select formControlName="examType">
                  <mat-option value="QUARTERLY">Quarterly</mat-option>
                  <mat-option value="HALF_YEARLY">Half Yearly</mat-option>
                  <mat-option value="ANNUAL">Annual</mat-option>
                </mat-select>
                <mat-error *ngIf="examForm.get('examType')?.hasError('required')">Required</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Academic Year</mat-label>
                <input matInput formControlName="academicYear" placeholder="e.g. 2024-25">
                <mat-error *ngIf="examForm.get('academicYear')?.hasError('required')">Required</mat-error>
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Start Date</mat-label>
                <input matInput type="date" formControlName="startDate">
                <mat-error *ngIf="examForm.get('startDate')?.hasError('required')">Required</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>End Date</mat-label>
                <input matInput type="date" formControlName="endDate">
                <mat-error *ngIf="examForm.get('endDate')?.hasError('required')">Required</mat-error>
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="examForm.invalid || saving">
                <mat-spinner *ngIf="saving" diameter="18" style="display:inline-block;margin-right:6px;"></mat-spinner>
                Create Exam
              </button>
              <button mat-button type="button" (click)="showForm = false; examForm.reset()">Cancel</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content>
          <div *ngIf="loading" class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>
          <table mat-table [dataSource]="exams" class="full-width-table" *ngIf="!loading">
            <ng-container matColumnDef="examName">
              <th mat-header-cell *matHeaderCellDef>Exam Name</th>
              <td mat-cell *matCellDef="let e">{{ e.examName }}</td>
            </ng-container>
            <ng-container matColumnDef="examType">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let e">{{ e.examType | titlecase }}</td>
            </ng-container>
            <ng-container matColumnDef="academicYear">
              <th mat-header-cell *matHeaderCellDef>Academic Year</th>
              <td mat-cell *matCellDef="let e">{{ e.academicYear }}</td>
            </ng-container>
            <ng-container matColumnDef="startDate">
              <th mat-header-cell *matHeaderCellDef>Start Date</th>
              <td mat-cell *matCellDef="let e">{{ e.startDate | date:'mediumDate' }}</td>
            </ng-container>
            <ng-container matColumnDef="endDate">
              <th mat-header-cell *matHeaderCellDef>End Date</th>
              <td mat-cell *matCellDef="let e">{{ e.endDate | date:'mediumDate' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let e">
                <span [class]="e.isLocked ? 'badge locked' : 'badge open'">
                  {{ e.isLocked ? 'Locked' : 'Open' }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let e">
                <button mat-icon-button color="warn" (click)="lockExam(e)" [disabled]="e.isLocked" title="Lock exam">
                  <mat-icon>lock</mat-icon>
                </button>
                <button mat-icon-button color="primary" (click)="unlockExam(e)" [disabled]="!e.isLocked" title="Unlock exam">
                  <mat-icon>lock_open</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteExam(e)" title="Delete exam">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <div *ngIf="!loading && exams.length === 0" class="empty-state">
            <mat-icon>assignment_outlined</mat-icon>
            <p>No exams found. Create an exam to get started.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.8rem; font-weight: 500; color: #3f51b5; }
    .form-card { margin-bottom: 20px; }
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
    .form-row mat-form-field { flex: 1; min-width: 180px; }
    .form-actions { display: flex; gap: 12px; margin-top: 8px; }
    .full-width-table { width: 100%; }
    .loading-center { display: flex; justify-content: center; padding: 40px; }
    .empty-state { text-align: center; padding: 48px; color: #999; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; display: block; margin: 0 auto 12px; }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 500; }
    .badge.locked { background: #ffebee; color: #c62828; }
    .badge.open { background: #e8f5e9; color: #2e7d32; }
  `]
})
export class ExamsComponent implements OnInit {
  exams: Exam[] = [];
  displayedColumns = ['examName', 'examType', 'academicYear', 'startDate', 'endDate', 'status', 'actions'];
  examForm: FormGroup;
  showForm = false;
  loading = false;
  saving = false;

  constructor(
    private examService: ExamService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.examForm = this.fb.group({
      examName: ['', Validators.required],
      examType: ['', Validators.required],
      academicYear: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  ngOnInit(): void { this.loadExams(); }

  loadExams(): void {
    this.loading = true;
    this.examService.getExams().subscribe({
      next: e => { this.exams = e; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onSubmit(): void {
    if (this.examForm.invalid) return;
    this.saving = true;
    this.examService.createExam(this.examForm.value).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Exam created!', 'Close', { duration: 3000 });
        this.showForm = false;
        this.examForm.reset();
        this.loadExams();
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Error creating exam', 'Close', { duration: 3000 });
      }
    });
  }

  lockExam(exam: Exam): void {
    if (!confirm(`Lock exam "${exam.examName}"? Teachers will not be able to enter marks after locking.`)) return;
    this.examService.lockExam(exam.id).subscribe({
      next: () => {
        this.snackBar.open('Exam locked!', 'Close', { duration: 3000 });
        this.loadExams();
      },
      error: () => this.snackBar.open('Error locking exam', 'Close', { duration: 3000 })
    });
  }

  unlockExam(exam: Exam): void {
    if (!confirm(`Unlock exam "${exam.examName}"? Teachers will be able to enter/edit marks again.`)) return;
    this.examService.unlockExam(exam.id).subscribe({
      next: () => {
        this.snackBar.open('Exam unlocked!', 'Close', { duration: 3000 });
        this.loadExams();
      },
      error: () => this.snackBar.open('Error unlocking exam', 'Close', { duration: 3000 })
    });
  }

  deleteExam(exam: Exam): void {
    if (!confirm(`Delete exam "${exam.examName}"? This will also delete all marks entered for this exam. This cannot be undone.`)) return;
    this.examService.deleteExam(exam.id).subscribe({
      next: () => {
        this.snackBar.open('Exam deleted!', 'Close', { duration: 3000 });
        this.loadExams();
      },
      error: () => this.snackBar.open('Error deleting exam', 'Close', { duration: 3000 })
    });
  }
}
