import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AttendanceService } from '../../../core/services/attendance.service';
import { MarksService } from '../../../core/services/marks.service';
import { AttendanceSummary } from '../../../core/models/attendance.model';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="dashboard-container">
      <h1 class="dashboard-title">Parent Dashboard</h1>
      <p class="welcome-text">Welcome, {{ username }}! Track your child's progress here.</p>

      <div class="actions-grid">
        <mat-card class="action-card" routerLink="/parent/report-cards">
          <mat-card-content>
            <mat-icon class="action-icon">description</mat-icon>
            <h3>Report Cards</h3>
            <p>View exam results and download report cards</p>
          </mat-card-content>
        </mat-card>
        <mat-card class="action-card" routerLink="/parent/attendance">
          <mat-card-content>
            <mat-icon class="action-icon">event_available</mat-icon>
            <h3>Attendance</h3>
            <p>Check your child's attendance records</p>
          </mat-card-content>
        </mat-card>
        <mat-card class="action-card complaints-card" routerLink="/parent/complaints">
          <mat-card-content>
            <mat-icon class="action-icon complaints-icon">report_problem</mat-icon>
            <h3>Complaints</h3>
            <p>Submit a complaint to a teacher</p>
          </mat-card-content>
        </mat-card>
      </div>

      <h2 class="section-title">Attendance Overview</h2>
      <mat-card *ngIf="attendance" class="attendance-card">
        <mat-card-content>
          <div class="attendance-stats">
            <div class="att-stat">
              <div class="att-value">{{ attendance.totalDays }}</div>
              <div class="att-label">Total Days</div>
            </div>
            <div class="att-stat present">
              <div class="att-value">{{ attendance.presentDays }}</div>
              <div class="att-label">Present</div>
            </div>
            <div class="att-stat absent">
              <div class="att-value">{{ attendance.absentDays }}</div>
              <div class="att-label">Absent</div>
            </div>
            <div class="att-stat late">
              <div class="att-value">{{ attendance.lateDays }}</div>
              <div class="att-label">Late</div>
            </div>
            <div class="att-stat">
              <div class="att-value">{{ attendance.percentage | number:'1.1-1' }}%</div>
              <div class="att-label">Attendance %</div>
            </div>
          </div>
          <mat-progress-bar
            mode="determinate"
            [value]="attendance.percentage"
            [color]="attendance.percentage >= 75 ? 'primary' : 'warn'"
            class="att-progress">
          </mat-progress-bar>
          <p class="att-note" [class.warn-text]="attendance.percentage < 75">
            {{ attendance.percentage >= 75 ? 'Good attendance!' : 'Warning: Attendance below 75%' }}
          </p>
        </mat-card-content>
      </mat-card>

      <div *ngIf="!attendance && !loadingAttendance" class="empty-state">
        <mat-icon>info_outline</mat-icon>
        <p>No attendance data available.</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; max-width: 1000px; margin: 0 auto; }
    .dashboard-title { font-size: 2rem; font-weight: 500; margin-bottom: 4px; color: #3f51b5; }
    .welcome-text { color: #666; margin-bottom: 32px; }
    .section-title { font-size: 1.3rem; font-weight: 500; margin: 32px 0 16px; }
    .actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .action-card { cursor: pointer; border-radius: 12px; transition: transform 0.2s, box-shadow 0.2s; text-align: center; }
    .action-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .action-icon { font-size: 40px; height: 40px; width: 40px; color: #3f51b5; margin-bottom: 8px; }
    .action-card h3 { margin: 8px 0 4px; font-size: 1rem; font-weight: 500; }
    .action-card p { margin: 0; font-size: 0.85rem; color: #666; }
    .attendance-card { border-radius: 12px; }
    .attendance-stats { display: flex; gap: 32px; flex-wrap: wrap; margin-bottom: 20px; }
    .att-stat { display: flex; flex-direction: column; align-items: center; }
    .att-value { font-size: 1.8rem; font-weight: 700; color: #333; }
    .att-stat.present .att-value { color: #2e7d32; }
    .att-stat.absent .att-value { color: #c62828; }
    .att-stat.late .att-value { color: #e65100; }
    .att-label { font-size: 0.8rem; color: #666; margin-top: 4px; text-transform: uppercase; }
    .att-progress { height: 8px; border-radius: 4px; margin-bottom: 8px; }
    .att-note { margin: 4px 0 0; font-size: 0.9rem; color: #2e7d32; }
    .att-note.warn-text { color: #c62828; }
    .empty-state { text-align: center; padding: 48px; color: #999; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; display: block; margin: 0 auto 12px; }
    .complaints-icon { color: #e65100; }
  `]
})
export class ParentDashboardComponent implements OnInit {
  username = localStorage.getItem('username') || 'Parent';
  attendance: AttendanceSummary | null = null;
  loadingAttendance = false;

  constructor(
    private attendanceService: AttendanceService,
    private marksService: MarksService
  ) {}

  ngOnInit(): void {
    this.loadingAttendance = true;
    this.attendanceService.getChildAttendance().subscribe({
      next: a => { this.attendance = a; this.loadingAttendance = false; },
      error: () => { this.loadingAttendance = false; }
    });
  }
}
