import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { TeacherService } from '../../../core/services/teacher.service';
import { TeacherAssignment } from '../../../core/models/teacher.model';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="dashboard-container">
      <h1 class="dashboard-title">Teacher Dashboard</h1>
      <p class="welcome-text">Welcome, {{ username }}!</p>

      <div class="actions-grid">
        <mat-card class="action-card" routerLink="/teacher/mark-entry">
          <mat-card-content>
            <mat-icon class="action-icon">edit_note</mat-icon>
            <h3>Enter Marks</h3>
            <p>Record student marks for exams</p>
          </mat-card-content>
        </mat-card>
        <mat-card class="action-card" routerLink="/teacher/attendance">
          <mat-card-content>
            <mat-icon class="action-icon">fact_check</mat-icon>
            <h3>Mark Attendance</h3>
            <p>Record daily student attendance</p>
          </mat-card-content>
        </mat-card>
        <mat-card class="action-card complaints-card" routerLink="/teacher/complaints">
          <mat-card-content>
            <mat-icon class="action-icon complaints-icon">feedback</mat-icon>
            <h3>Complaints</h3>
            <p>View parent complaints</p>
          </mat-card-content>
        </mat-card>
      </div>

      <h2 class="section-title">My Assignments</h2>
      <mat-card>
        <mat-card-content>
          <div *ngIf="loading" class="loading-center" style="display:flex;justify-content:center;padding:32px;">
            <span>Loading assignments...</span>
          </div>
          <table mat-table [dataSource]="assignments" class="full-width-table" *ngIf="!loading">
            <ng-container matColumnDef="subjectName">
              <th mat-header-cell *matHeaderCellDef>Subject</th>
              <td mat-cell *matCellDef="let a">{{ a.subjectName }}</td>
            </ng-container>
            <ng-container matColumnDef="className">
              <th mat-header-cell *matHeaderCellDef>Class</th>
              <td mat-cell *matCellDef="let a">{{ a.className }}</td>
            </ng-container>
            <ng-container matColumnDef="sectionName">
              <th mat-header-cell *matHeaderCellDef>Section</th>
              <td mat-cell *matCellDef="let a">{{ a.sectionName }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <div *ngIf="!loading && assignments.length === 0" class="empty-state">
            <mat-icon>assignment_ind</mat-icon>
            <p>No assignments yet. Contact admin to get assigned to classes.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .dashboard-title { font-size: 2rem; font-weight: 500; margin-bottom: 4px; color: #3f51b5; }
    .welcome-text { color: #666; margin-bottom: 32px; }
    .section-title { font-size: 1.3rem; font-weight: 500; margin: 32px 0 16px; }
    .actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .action-card { cursor: pointer; border-radius: 12px; transition: transform 0.2s, box-shadow 0.2s; text-align: center; }
    .action-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .action-icon { font-size: 40px; height: 40px; width: 40px; color: #3f51b5; margin-bottom: 8px; }
    .action-card h3 { margin: 8px 0 4px; font-size: 1rem; font-weight: 500; }
    .action-card p { margin: 0; font-size: 0.85rem; color: #666; }
    .full-width-table { width: 100%; }
    .empty-state { text-align: center; padding: 40px; color: #999; }
    .empty-state mat-icon { font-size: 40px; height: 40px; width: 40px; display: block; margin: 0 auto 8px; }
    .complaints-icon { color: #ff8f00; }
  `]
})
export class TeacherDashboardComponent implements OnInit {
  username = localStorage.getItem('username') || 'Teacher';
  assignments: TeacherAssignment[] = [];
  displayedColumns = ['subjectName', 'className', 'sectionName'];
  loading = false;

  constructor(private teacherService: TeacherService) {}

  ngOnInit(): void {
    this.loading = true;
    this.teacherService.getTeacherAssignments().subscribe({
      next: a => { this.assignments = a; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
