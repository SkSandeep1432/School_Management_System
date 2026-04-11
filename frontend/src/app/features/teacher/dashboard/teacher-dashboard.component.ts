import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { TeacherService } from '../../../core/services/teacher.service';
import { TeacherAssignment } from '../../../core/models/teacher.model';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatBadgeModule, MatChipsModule,
    MatTooltipModule, NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="dashboard-container">
      <h1 class="dashboard-title">Teacher Dashboard</h1>
      <p class="welcome-text">Welcome, {{ username }}!</p>

      <!-- Action Cards -->
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

      <!-- Notifications Section -->
      <div class="section-header">
        <h2 class="section-title">
          <mat-icon class="section-icon notif-icon">notifications</mat-icon>
          Notifications
          <span class="unread-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
        </h2>
        <button mat-stroked-button color="primary" *ngIf="unreadCount > 0" (click)="markAllRead()" class="read-all-btn">
          <mat-icon>done_all</mat-icon> Mark all read
        </button>
      </div>

      <mat-card class="notif-card">
        <mat-card-content>
          <div *ngIf="notifLoading" class="center-text">Loading notifications...</div>

          <div *ngIf="!notifLoading && notifications.length === 0" class="empty-notif">
            <mat-icon>notifications_none</mat-icon>
            <p>No notifications yet. You'll be notified when exams are confirmed.</p>
          </div>

          <div class="notif-list" *ngIf="!notifLoading && notifications.length > 0">
            <div class="notif-item" *ngFor="let n of notifications" [class.unread]="!n.isRead" (click)="markRead(n)">
              <div class="notif-left">
                <div class="notif-dot" *ngIf="!n.isRead"></div>
                <mat-icon class="notif-type-icon">{{ getIcon(n.type) }}</mat-icon>
              </div>
              <div class="notif-body">
                <div class="notif-title">{{ n.title }}</div>
                <div class="notif-msg">{{ n.message }}</div>
                <div class="notif-time">{{ formatTime(n.createdAt) }}</div>
              </div>
              <span class="new-chip" *ngIf="!n.isRead">NEW</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- My Assignments Section -->
      <h2 class="section-title" style="margin-top: 32px;">
        <mat-icon class="section-icon">assignment_ind</mat-icon>
        My Assignments
      </h2>
      <mat-card>
        <mat-card-content>
          <div *ngIf="loading" class="center-text">Loading assignments...</div>
          <table mat-table [dataSource]="assignments" class="full-width-table" *ngIf="!loading && assignments.length > 0">
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

    /* Action cards */
    .actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .action-card { cursor: pointer; border-radius: 12px; transition: transform 0.2s, box-shadow 0.2s; text-align: center; }
    .action-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .action-icon { font-size: 40px; height: 40px; width: 40px; color: #3f51b5; margin-bottom: 8px; }
    .action-card h3 { margin: 8px 0 4px; font-size: 1rem; font-weight: 500; }
    .action-card p { margin: 0; font-size: 0.85rem; color: #666; }
    .complaints-icon { color: #ff8f00; }

    /* Section header */
    .section-header { display: flex; justify-content: space-between; align-items: center; margin: 0 0 12px; }
    .section-title { display: flex; align-items: center; gap: 8px; font-size: 1.3rem; font-weight: 500; margin: 0; }
    .section-icon { font-size: 22px; width: 22px; height: 22px; color: #3f51b5; }
    .notif-icon { color: #e65100; }
    .unread-badge {
      background: #e53935; color: #fff; border-radius: 10px;
      padding: 2px 8px; font-size: 0.75rem; font-weight: 700; margin-left: 4px;
    }
    .read-all-btn { height: 36px; }

    /* Notification card */
    .notif-card { margin-bottom: 8px; }
    .notif-list { display: flex; flex-direction: column; gap: 0; }
    .notif-item {
      display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px;
      border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: background 0.15s; position: relative;
    }
    .notif-item:last-child { border-bottom: none; }
    .notif-item:hover { background: #f8f9ff; }
    .notif-item.unread { background: #fff8e1; }
    .notif-item.unread:hover { background: #fff3cd; }
    .notif-left { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; padding-top: 2px; }
    .notif-dot { width: 8px; height: 8px; border-radius: 50%; background: #e53935; flex-shrink: 0; }
    .notif-type-icon { font-size: 22px; width: 22px; height: 22px; color: #f57c00; }
    .notif-body { flex: 1; min-width: 0; }
    .notif-title { font-weight: 600; font-size: 0.95rem; margin-bottom: 4px; }
    .notif-msg { font-size: 0.85rem; color: #555; line-height: 1.4; margin-bottom: 6px; }
    .notif-time { font-size: 0.78rem; color: #999; }
    .new-chip {
      background: #e53935; color: #fff; border-radius: 10px;
      padding: 2px 8px; font-size: 0.72rem; font-weight: 700; flex-shrink: 0; align-self: flex-start; margin-top: 2px;
    }

    /* Assignments */
    .full-width-table { width: 100%; }
    .empty-state, .empty-notif { text-align: center; padding: 32px; color: #999; }
    .empty-state mat-icon, .empty-notif mat-icon { font-size: 40px; height: 40px; width: 40px; display: block; margin: 0 auto 8px; }
    .center-text { text-align: center; padding: 24px; color: #999; }
  `]
})
export class TeacherDashboardComponent implements OnInit {
  username = localStorage.getItem('username') || 'Teacher';
  assignments: TeacherAssignment[] = [];
  displayedColumns = ['subjectName', 'className', 'sectionName'];
  loading = false;

  notifications: any[] = [];
  unreadCount = 0;
  notifLoading = false;

  constructor(private teacherService: TeacherService) {}

  ngOnInit(): void {
    this.loading = true;
    this.teacherService.getTeacherAssignments().subscribe({
      next: a => { this.assignments = a; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notifLoading = true;
    this.teacherService.getNotifications().subscribe({
      next: (res: any) => {
        this.notifications = res.notifications || [];
        this.unreadCount = res.unreadCount || 0;
        this.notifLoading = false;
      },
      error: () => { this.notifLoading = false; }
    });
  }

  markRead(n: any): void {
    if (n.isRead) return;
    this.teacherService.markNotificationRead(n.id).subscribe({
      next: () => {
        n.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    });
  }

  markAllRead(): void {
    this.teacherService.markAllNotificationsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.unreadCount = 0;
      }
    });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'EXAM_LOCKED': return 'lock';
      case 'EXAM_UNLOCKED': return 'lock_open';
      default: return 'notifications';
    }
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
