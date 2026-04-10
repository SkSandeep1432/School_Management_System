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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AttendanceService } from '../../../core/services/attendance.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { TeacherAssignment } from '../../../core/models/teacher.model';

@Component({
  selector: 'app-attendance',
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
    MatButtonToggleModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1>Mark Attendance</h1>
      </div>

      <mat-card class="filter-card">
        <mat-card-title>Select Class &amp; Date</mat-card-title>
        <mat-card-content>
          <div class="filter-row">
            <mat-form-field appearance="outline">
              <mat-label>Class / Section</mat-label>
              <mat-select [(ngModel)]="selectedAssignment" (ngModelChange)="loadStudents()">
                <mat-option *ngFor="let a of assignments" [value]="a">
                  {{ a.className }} - {{ a.sectionName }}
                </mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Date</mat-label>
              <input matInput type="date" [(ngModel)]="attendanceDate" (ngModelChange)="loadStudents()">
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <div *ngIf="loadingStudents" class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>

      <mat-card *ngIf="students.length > 0 && !loadingStudents">
        <mat-card-title>Attendance for {{ selectedAssignment?.className }} - {{ selectedAssignment?.sectionName }} on {{ attendanceDate }}</mat-card-title>
        <mat-card-content>
          <div class="bulk-actions">
            <button mat-stroked-button (click)="markAllPresent()"><mat-icon>done_all</mat-icon> Mark All Present</button>
            <button mat-stroked-button color="warn" (click)="markAllAbsent()"><mat-icon>close</mat-icon> Mark All Absent</button>
          </div>

          <table mat-table [dataSource]="students" class="full-width-table">
            <ng-container matColumnDef="rollNumber">
              <th mat-header-cell *matHeaderCellDef>Roll No.</th>
              <td mat-cell *matCellDef="let s">{{ s.rollNumber }}</td>
            </ng-container>
            <ng-container matColumnDef="fullName">
              <th mat-header-cell *matHeaderCellDef>Student Name</th>
              <td mat-cell *matCellDef="let s">{{ s.fullName }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let s">
                <mat-button-toggle-group [(ngModel)]="s.status" class="status-toggle">
                  <mat-button-toggle value="PRESENT" class="toggle-present">Present</mat-button-toggle>
                  <mat-button-toggle value="ABSENT" class="toggle-absent">Absent</mat-button-toggle>
                  <mat-button-toggle value="LATE" class="toggle-late">Late</mat-button-toggle>
                </mat-button-toggle-group>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="attendanceColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: attendanceColumns;"></tr>
          </table>

          <div class="save-actions">
            <button mat-raised-button color="primary" (click)="saveAttendance()" [disabled]="saving">
              <mat-spinner *ngIf="saving" diameter="18" style="display:inline-block;margin-right:6px;"></mat-spinner>
              Save Attendance
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <div *ngIf="!loadingStudents && students.length === 0 && selectedAssignment" class="empty-state">
        <mat-icon>people_outline</mat-icon>
        <p>No students found for this class and section.</p>
      </div>

      <div *ngIf="!selectedAssignment" class="empty-state">
        <mat-icon>fact_check</mat-icon>
        <p>Select a class and date above to mark attendance.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.8rem; font-weight: 500; color: #3f51b5; }
    .filter-card { margin-bottom: 20px; }
    .filter-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; margin-top: 16px; }
    .filter-row mat-form-field { flex: 1; min-width: 200px; }
    .full-width-table { width: 100%; margin-top: 16px; }
    .loading-center { display: flex; justify-content: center; padding: 40px; }
    .empty-state { text-align: center; padding: 48px; color: #999; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; display: block; margin: 0 auto 12px; }
    .bulk-actions { display: flex; gap: 12px; margin-bottom: 8px; }
    .save-actions { margin-top: 20px; }
    .status-toggle { transform: scale(0.9); }
  `]
})
export class AttendanceComponent implements OnInit {
  assignments: TeacherAssignment[] = [];
  students: any[] = [];
  selectedAssignment: TeacherAssignment | null = null;
  attendanceDate: string = new Date().toISOString().split('T')[0];
  loadingStudents = false;
  saving = false;
  attendanceColumns = ['rollNumber', 'fullName', 'status'];

  constructor(
    private attendanceService: AttendanceService,
    private teacherService: TeacherService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.teacherService.getTeacherAssignments().subscribe({
      next: a => {
        const unique = new Map<string, TeacherAssignment>();
        a.forEach(assignment => {
          const key = `${assignment.classId}-${assignment.sectionId}`;
          if (!unique.has(key)) unique.set(key, assignment);
        });
        this.assignments = Array.from(unique.values());
      },
      error: () => {}
    });
  }

  loadStudents(): void {
    if (!this.selectedAssignment) return;
    this.loadingStudents = true;
    this.students = [];
    this.teacherService.getMyStudents(this.selectedAssignment.classId, this.selectedAssignment.sectionId).subscribe({
      next: s => {
        this.attendanceService.getAttendanceByClassAndDate(
          this.selectedAssignment!.classId,
          this.selectedAssignment!.sectionId,
          this.attendanceDate
        ).subscribe({
          next: existing => {
            this.students = s.map((st: any) => {
              const rec = existing.find((e: any) => e.studentId === st.id);
              return { ...st, status: rec ? rec.status : 'PRESENT' };
            });
            this.loadingStudents = false;
          },
          error: () => {
            this.students = s.map((st: any) => ({ ...st, status: 'PRESENT' }));
            this.loadingStudents = false;
          }
        });
      },
      error: () => { this.loadingStudents = false; }
    });
  }

  markAllPresent(): void { this.students.forEach(s => s.status = 'PRESENT'); }
  markAllAbsent(): void { this.students.forEach(s => s.status = 'ABSENT'); }

  saveAttendance(): void {
    if (!this.selectedAssignment) return;
    this.saving = true;
    const requests = this.students.map(s =>
      this.attendanceService.markAttendance({
        studentId: s.id,
        classId: this.selectedAssignment!.classId,
        sectionId: this.selectedAssignment!.sectionId,
        attendanceDate: this.attendanceDate,
        status: s.status
      })
    );

    let completed = 0;
    let errors = 0;
    requests.forEach(req => {
      req.subscribe({
        next: () => {
          completed++;
          if (completed + errors === requests.length) {
            this.saving = false;
            this.snackBar.open('Attendance saved!', 'Close', { duration: 3000 });
          }
        },
        error: () => {
          errors++;
          if (completed + errors === requests.length) {
            this.saving = false;
            this.snackBar.open('Attendance saved with some errors', 'Close', { duration: 3000 });
          }
        }
      });
    });
  }
}
