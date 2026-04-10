import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AttendanceSummary } from '../../../core/models/attendance.model';

@Component({
  selector: 'app-child-attendance',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1>Child Attendance</h1>
      </div>

      <div *ngIf="loading" class="loading-center"><mat-spinner diameter="40"></mat-spinner></div>

      <mat-card *ngIf="attendance && !loading" class="attendance-card">
        <mat-card-header>
          <mat-card-title>Attendance Summary for {{ attendance.studentName }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>

          <div class="stats-grid">
            <div class="stat-box total">
              <mat-icon>calendar_today</mat-icon>
              <div class="stat-num">{{ attendance.totalDays }}</div>
              <div class="stat-lbl">Total Days</div>
            </div>
            <div class="stat-box present">
              <mat-icon>check_circle</mat-icon>
              <div class="stat-num">{{ attendance.presentDays }}</div>
              <div class="stat-lbl">Present</div>
            </div>
            <div class="stat-box absent">
              <mat-icon>cancel</mat-icon>
              <div class="stat-num">{{ attendance.absentDays }}</div>
              <div class="stat-lbl">Absent</div>
            </div>
            <div class="stat-box late">
              <mat-icon>schedule</mat-icon>
              <div class="stat-num">{{ attendance.lateDays }}</div>
              <div class="stat-lbl">Late</div>
            </div>
          </div>

          <div class="percentage-section">
            <div class="percentage-label">
              <span>Attendance Percentage</span>
              <span [class]="attendance.percentage >= 75 ? 'pct-value good' : 'pct-value bad'">
                {{ attendance.percentage | number:'1.1-1' }}%
              </span>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="attendance.percentage"
              [color]="attendance.percentage >= 75 ? 'primary' : 'warn'"
              class="main-progress">
            </mat-progress-bar>

            <div class="threshold-note" [class.good]="attendance.percentage >= 75" [class.bad]="attendance.percentage < 75">
              <mat-icon>{{ attendance.percentage >= 75 ? 'thumb_up' : 'warning' }}</mat-icon>
              <span>
                {{ attendance.percentage >= 75
                  ? 'Excellent! Attendance is above the required 75%.'
                  : 'Warning: Attendance is below the required 75%. Please improve attendance.' }}
              </span>
            </div>
          </div>

          <div class="breakdown-section">
            <h3>Attendance Breakdown</h3>
            <div class="breakdown-bar">
              <div class="bar-segment present-seg" [style.width]="getPercent(attendance.presentDays, attendance.totalDays) + '%'" title="Present">
                {{ attendance.presentDays }}P
              </div>
              <div class="bar-segment late-seg" [style.width]="getPercent(attendance.lateDays, attendance.totalDays) + '%'" title="Late">
                {{ attendance.lateDays > 0 ? attendance.lateDays + 'L' : '' }}
              </div>
              <div class="bar-segment absent-seg" [style.width]="getPercent(attendance.absentDays, attendance.totalDays) + '%'" title="Absent">
                {{ attendance.absentDays }}A
              </div>
            </div>
            <div class="bar-legend">
              <span class="legend-item present-legend">Present</span>
              <span class="legend-item late-legend">Late</span>
              <span class="legend-item absent-legend">Absent</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <div *ngIf="!loading && !attendance" class="empty-state">
        <mat-icon>event_busy</mat-icon>
        <p>No attendance records found for your child.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 900px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.8rem; font-weight: 500; color: #3f51b5; }
    .loading-center { display: flex; justify-content: center; padding: 40px; }
    .empty-state { text-align: center; padding: 48px; color: #999; }
    .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; display: block; margin: 0 auto 12px; }
    .attendance-card { border-radius: 12px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 16px; margin: 24px 0; }
    .stat-box { display: flex; flex-direction: column; align-items: center; padding: 20px 12px; border-radius: 12px; }
    .stat-box.total { background: #e8eaf6; }
    .stat-box.present { background: #e8f5e9; }
    .stat-box.absent { background: #ffebee; }
    .stat-box.late { background: #fff3e0; }
    .stat-box mat-icon { font-size: 28px; height: 28px; width: 28px; margin-bottom: 8px; }
    .stat-box.total mat-icon { color: #3f51b5; }
    .stat-box.present mat-icon { color: #2e7d32; }
    .stat-box.absent mat-icon { color: #c62828; }
    .stat-box.late mat-icon { color: #e65100; }
    .stat-num { font-size: 2rem; font-weight: 700; }
    .stat-box.present .stat-num { color: #2e7d32; }
    .stat-box.absent .stat-num { color: #c62828; }
    .stat-box.late .stat-num { color: #e65100; }
    .stat-lbl { font-size: 0.8rem; color: #666; text-transform: uppercase; margin-top: 4px; }
    .percentage-section { margin: 24px 0; }
    .percentage-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-weight: 500; }
    .pct-value { font-size: 1.5rem; font-weight: 700; }
    .pct-value.good { color: #2e7d32; }
    .pct-value.bad { color: #c62828; }
    .main-progress { height: 12px; border-radius: 6px; margin-bottom: 12px; }
    .threshold-note { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 8px; }
    .threshold-note.good { background: #e8f5e9; color: #2e7d32; }
    .threshold-note.bad { background: #ffebee; color: #c62828; }
    .breakdown-section { margin-top: 32px; }
    .breakdown-section h3 { font-size: 1rem; font-weight: 500; margin-bottom: 12px; }
    .breakdown-bar { display: flex; height: 36px; border-radius: 8px; overflow: hidden; }
    .bar-segment { display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 600; color: white; transition: width 0.3s; }
    .present-seg { background: #43a047; }
    .late-seg { background: #fb8c00; }
    .absent-seg { background: #e53935; }
    .bar-legend { display: flex; gap: 16px; margin-top: 8px; }
    .legend-item { font-size: 0.8rem; padding-left: 14px; position: relative; }
    .legend-item::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 10px; height: 10px; border-radius: 50%; }
    .present-legend::before { background: #43a047; }
    .late-legend::before { background: #fb8c00; }
    .absent-legend::before { background: #e53935; }
  `]
})
export class ChildAttendanceComponent implements OnInit {
  attendance: AttendanceSummary | null = null;
  loading = false;

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit(): void {
    this.loading = true;
    this.attendanceService.getChildAttendance().subscribe({
      next: a => { this.attendance = a; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  getPercent(part: number, total: number): number {
    if (!total) return 0;
    return Math.round((part / total) * 100);
  }
}
