import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { MarksService } from '../../../core/services/marks.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { ExamService } from '../../../core/services/exam.service';
import { Mark, EnterMarksRequest } from '../../../core/models/marks.model';
import { TeacherAssignment } from '../../../core/models/teacher.model';
import { Exam } from '../../../core/models/exam.model';

@Component({
  selector: 'app-mark-entry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1>Mark Entry</h1>
      </div>

      <mat-card class="filter-card">
        <mat-card-title>Select Assignment &amp; Exam</mat-card-title>
        <mat-card-content>
          <div class="filter-row">
            <mat-form-field appearance="outline">
              <mat-label>Assignment (Subject / Class / Section)</mat-label>
              <mat-select [(ngModel)]="selectedAssignment" (ngModelChange)="onAssignmentChange()">
                <mat-option *ngFor="let a of assignments" [value]="a">
                  {{ a.subjectName }} - {{ a.className }} {{ a.sectionName }}
                </mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Exam</mat-label>
              <mat-select [(ngModel)]="selectedExam" (ngModelChange)="loadMarks()">
                <mat-option *ngFor="let e of exams" [value]="e" [disabled]="e.isLocked">
                  {{ e.examName }} {{ e.isLocked ? '(Locked)' : '' }}
                </mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="loadMarks()" [disabled]="!selectedAssignment || !selectedExam || loadingMarks">
              <mat-icon>search</mat-icon> Load
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <div *ngIf="loadingMarks" class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>

      <mat-card *ngIf="students.length > 0 && !loadingMarks">
        <mat-card-title>Enter Marks for {{ selectedAssignment?.subjectName }}</mat-card-title>
        <mat-card-content>
          <table mat-table [dataSource]="students" class="full-width-table">
            <ng-container matColumnDef="rollNumber">
              <th mat-header-cell *matHeaderCellDef>Roll No.</th>
              <td mat-cell *matCellDef="let s">{{ s.rollNumber }}</td>
            </ng-container>
            <ng-container matColumnDef="fullName">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let s">{{ s.fullName }}</td>
            </ng-container>
            <ng-container matColumnDef="marksObtained">
              <th mat-header-cell *matHeaderCellDef>Marks Obtained</th>
              <td mat-cell *matCellDef="let s">
                <mat-form-field appearance="outline" style="width:100px;">
                  <input matInput type="number" [(ngModel)]="s.marksObtained" min="0" [max]="maxMarks" [disabled]="!!selectedExam?.isLocked">
                </mat-form-field>
              </td>
            </ng-container>
            <ng-container matColumnDef="remarks">
              <th mat-header-cell *matHeaderCellDef>Remarks</th>
              <td mat-cell *matCellDef="let s">
                <mat-form-field appearance="outline" style="width:140px;">
                  <input matInput [(ngModel)]="s.remarks" [disabled]="!!selectedExam?.isLocked">
                </mat-form-field>
              </td>
            </ng-container>
            <ng-container matColumnDef="existing">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let s">
                <span [class]="getExistingMark(s.id) ? 'badge entered' : 'badge pending'">
                  {{ getExistingMark(s.id) ? 'Entered' : 'Pending' }}
                </span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="marksColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: marksColumns;"></tr>
          </table>

          <div class="max-marks-row">
            <mat-form-field appearance="outline" style="width:150px;">
              <mat-label>Max Marks</mat-label>
              <input matInput type="number" [(ngModel)]="maxMarks" min="1" [disabled]="!!selectedExam?.isLocked">
            </mat-form-field>
          </div>

          <div class="save-actions" *ngIf="!selectedExam?.isLocked">
            <button mat-raised-button color="primary" (click)="saveAllMarks()" [disabled]="saving">
              <mat-spinner *ngIf="saving" diameter="18" style="display:inline-block;margin-right:6px;"></mat-spinner>
              Save All Marks
            </button>
          </div>

          <div *ngIf="selectedExam?.isLocked" class="locked-notice">
            <mat-icon>lock</mat-icon>
            <span>This exam is locked. Marks cannot be edited.</span>
          </div>
        </mat-card-content>
      </mat-card>

      <div *ngIf="!loadingMarks && students.length === 0 && selectedAssignment && selectedExam" class="empty-state">
        <mat-icon>people_outline</mat-icon>
        <p>No students found for this class and section.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.8rem; font-weight: 500; color: #3f51b5; }
    .filter-card { margin-bottom: 20px; }
    .filter-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; margin-top: 16px; }
    .filter-row mat-form-field { flex: 1; min-width: 200px; }
    .full-width-table { width: 100%; }
    .loading-center { display: flex; justify-content: center; padding: 40px; }
    .empty-state { text-align: center; padding: 48px; color: #999; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; display: block; margin: 0 auto 12px; }
    .max-marks-row { margin-top: 16px; }
    .save-actions { margin-top: 8px; }
    .locked-notice { display: flex; align-items: center; gap: 8px; color: #c62828; margin-top: 16px; background: #ffebee; padding: 12px 16px; border-radius: 4px; }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 500; }
    .badge.entered { background: #e8f5e9; color: #2e7d32; }
    .badge.pending { background: #fff3e0; color: #e65100; }
  `]
})
export class MarkEntryComponent implements OnInit {
  assignments: TeacherAssignment[] = [];
  exams: Exam[] = [];
  students: any[] = [];
  existingMarks: Mark[] = [];
  selectedAssignment: TeacherAssignment | null = null;
  selectedExam: Exam | null = null;
  maxMarks = 100;
  loadingMarks = false;
  saving = false;
  marksColumns = ['rollNumber', 'fullName', 'marksObtained', 'remarks', 'existing'];

  constructor(
    private marksService: MarksService,
    private teacherService: TeacherService,
    private examService: ExamService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.teacherService.getTeacherAssignments().subscribe({ next: a => this.assignments = a, error: () => {} });
    this.examService.getTeacherExams().subscribe({ next: e => this.exams = e, error: () => {} });
  }

  onAssignmentChange(): void {
    this.students = [];
    this.existingMarks = [];
    if (this.selectedAssignment && this.selectedExam) this.loadMarks();
  }

  loadMarks(): void {
    if (!this.selectedAssignment || !this.selectedExam) return;
    this.loadingMarks = true;
    this.students = [];
    this.teacherService.getMyStudents(this.selectedAssignment.classId, this.selectedAssignment.sectionId).subscribe({
      next: (s: any[]) => {
        this.students = s.map((st: any) => ({ ...st, marksObtained: 0, remarks: '' }));
        this.marksService.getMarks(this.selectedExam!.id, this.selectedAssignment!.classId, this.selectedAssignment!.sectionId).subscribe({
          next: marks => {
            this.existingMarks = marks;
            marks.forEach(m => {
              const student = this.students.find(st => st.id === m.studentId);
              if (student) {
                student.marksObtained = m.marksObtained;
                student.remarks = m.remarks;
                student.markId = m.id;
              }
            });
            this.loadingMarks = false;
          },
          error: () => { this.loadingMarks = false; }
        });
      },
      error: () => { this.loadingMarks = false; }
    });
  }

  getExistingMark(studentId: number): Mark | undefined {
    return this.existingMarks.find(m => m.studentId === studentId);
  }

  saveAllMarks(): void {
    if (!this.selectedAssignment || !this.selectedExam) return;
    this.saving = true;
    const requests = this.students.map(s => {
      const existing = this.getExistingMark(s.id);
      if (existing) {
        return this.marksService.updateMarks(existing.id, { marksObtained: s.marksObtained, remarks: s.remarks });
      } else {
        const req: EnterMarksRequest = {
          studentId: s.id,
          examId: this.selectedExam!.id,
          subjectId: this.selectedAssignment!.subjectId,
          classId: this.selectedAssignment!.classId,
          sectionId: this.selectedAssignment!.sectionId,
          marksObtained: s.marksObtained,
          maxMarks: this.maxMarks,
          remarks: s.remarks || ''
        };
        return this.marksService.enterMarks(req);
      }
    });

    let completed = 0;
    let errors = 0;
    requests.forEach(req => {
      req.subscribe({
        next: () => {
          completed++;
          if (completed + errors === requests.length) {
            this.saving = false;
            this.snackBar.open('Marks saved successfully!', 'Close', { duration: 4000 });
            this.loadMarks();
          }
        },
        error: () => {
          errors++;
          if (completed + errors === requests.length) {
            this.saving = false;
            this.snackBar.open('Some marks could not be saved', 'Close', { duration: 4000 });
            this.loadMarks();
          }
        }
      });
    });
  }
}
