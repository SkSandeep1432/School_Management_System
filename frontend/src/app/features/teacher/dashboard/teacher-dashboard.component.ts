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

      <!-- Header -->
      <div class="dash-header">
        <div>
          <h1 class="dash-title">Teacher Dashboard</h1>
          <p class="dash-sub">Welcome back, <strong>{{ username }}</strong>!</p>
        </div>
        <div class="date-badge">
          <mat-icon>calendar_today</mat-icon>
          <span>{{ today }}</span>
        </div>
      </div>

      <!-- Action Cards -->
      <div class="actions-row">
        <div class="act-card ac-blue" routerLink="/teacher/mark-entry">
          <div class="act-icon"><mat-icon>edit_note</mat-icon></div>
          <div class="act-body">
            <div class="act-title">Enter Marks</div>
            <div class="act-sub">Record student marks</div>
          </div>
          <mat-icon class="act-arrow">chevron_right</mat-icon>
        </div>
        <div class="act-card ac-green" routerLink="/teacher/attendance">
          <div class="act-icon"><mat-icon>fact_check</mat-icon></div>
          <div class="act-body">
            <div class="act-title">Mark Attendance</div>
            <div class="act-sub">Daily attendance</div>
          </div>
          <mat-icon class="act-arrow">chevron_right</mat-icon>
        </div>
        <div class="act-card ac-amber" routerLink="/teacher/complaints">
          <div class="act-icon"><mat-icon>feedback</mat-icon></div>
          <div class="act-body">
            <div class="act-title">Complaints</div>
            <div class="act-sub">View parent complaints</div>
          </div>
          <mat-icon class="act-arrow">chevron_right</mat-icon>
        </div>
      </div>

      <!-- Notifications -->
      <div class="section-header">
        <h2 class="section-heading"><mat-icon>notifications_active</mat-icon> Notifications
          <span class="unread-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
        </h2>
        <button class="mark-all-btn" *ngIf="unreadCount > 0" (click)="markAllRead()">
          <mat-icon>done_all</mat-icon> Mark all read
        </button>
      </div>

      <div class="notif-panel">
        <div *ngIf="notifLoading" class="loading-txt">Loading notifications...</div>
        <div *ngIf="!notifLoading && notifications.length === 0" class="empty-notif">
          <mat-icon>notifications_none</mat-icon>
          <p>No notifications yet</p>
        </div>
        <div class="notif-list" *ngIf="!notifLoading && notifications.length > 0">
          <div class="notif-row" *ngFor="let n of notifications" [class.unread]="!n.isRead" (click)="markRead(n)">
            <div class="notif-icon-wrap" [ngClass]="getIconClass(n.type)">
              <mat-icon>{{ getIcon(n.type) }}</mat-icon>
            </div>
            <div class="notif-content">
              <div class="notif-title-row">
                <span class="notif-title">{{ n.title }}</span>
                <span class="new-tag" *ngIf="!n.isRead">NEW</span>
              </div>
              <div class="notif-msg">{{ n.message }}</div>
              <div class="notif-time"><mat-icon>schedule</mat-icon> {{ formatTime(n.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- My Assignments -->
      <h2 class="section-heading" style="margin-top:28px"><mat-icon>assignment_ind</mat-icon> My Assignments</h2>
      <div class="table-card">
        <div *ngIf="loading" class="loading-txt">Loading assignments...</div>
        <table class="assign-table" *ngIf="!loading && assignments.length > 0">
          <thead>
            <tr><th>Subject</th><th>Class</th><th>Section</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of assignments">
              <td><span class="subject-chip">{{ a.subjectName }}</span></td>
              <td>Class {{ a.className }}</td>
              <td><span class="section-chip">{{ a.sectionName }}</span></td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!loading && assignments.length === 0" class="empty-notif">
          <mat-icon>assignment_ind</mat-icon>
          <p>No assignments yet</p>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-container { padding:28px; max-width:1100px; margin:0 auto; animation:fadeInUp 0.35s ease both; }
    @keyframes fadeInUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

    .dash-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:28px; flex-wrap:wrap; gap:12px; }
    .dash-title { font-size:1.9rem; font-weight:800; color:#1a237e; margin:0 0 4px; }
    .dash-sub { color:#888; margin:0; font-size:0.95rem; }
    .dash-sub strong { color:#3f51b5; }
    .date-badge { display:flex; align-items:center; gap:8px; background:#e8eaf6; border-radius:20px; padding:8px 16px; color:#3f51b5; font-size:0.85rem; font-weight:600; }
    .date-badge mat-icon { font-size:16px; width:16px; height:16px; }

    /* Action row */
    .actions-row { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:14px; margin-bottom:28px; }
    .act-card { display:flex; align-items:center; gap:14px; padding:18px 16px; border-radius:14px; cursor:pointer; transition:transform 0.18s,box-shadow 0.18s; box-shadow:0 2px 10px rgba(0,0,0,0.07); }
    .act-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,0.14); }
    .act-icon { width:46px; height:46px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .act-icon mat-icon { font-size:22px; width:22px; height:22px; color:#fff; }
    .act-body { flex:1; }
    .act-title { font-size:0.95rem; font-weight:700; color:#212121; }
    .act-sub { font-size:0.78rem; color:#888; margin-top:2px; }
    .act-arrow { color:#bbb; font-size:20px; }
    .ac-blue  { background:#e8eaf6; } .ac-blue  .act-icon { background:linear-gradient(135deg,#1a237e,#5c6bc0); }
    .ac-green { background:#e8f5e9; } .ac-green .act-icon { background:linear-gradient(135deg,#1b5e20,#43a047); }
    .ac-amber { background:#fff8e1; } .ac-amber .act-icon { background:linear-gradient(135deg,#e65100,#ffa726); }

    /* Section header */
    .section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
    .section-heading { display:flex; align-items:center; gap:8px; font-size:1.1rem; font-weight:700; color:#1a237e; margin:0; }
    .section-heading mat-icon { font-size:20px; color:#3f51b5; }
    .unread-badge { background:#e53935; color:#fff; border-radius:10px; padding:2px 8px; font-size:0.72rem; font-weight:700; margin-left:6px; }
    .mark-all-btn { display:flex; align-items:center; gap:4px; background:#e8eaf6; border:none; border-radius:10px; padding:6px 14px; color:#3f51b5; font-size:0.82rem; font-weight:600; cursor:pointer; transition:background 0.2s; }
    .mark-all-btn:hover { background:#c5cae9; }
    .mark-all-btn mat-icon { font-size:16px; width:16px; height:16px; }

    /* Notification panel */
    .notif-panel { background:#fff; border-radius:16px; box-shadow:0 2px 12px rgba(0,0,0,0.07); overflow:hidden; margin-bottom:8px; }
    .notif-list { display:flex; flex-direction:column; }
    .notif-row { display:flex; align-items:flex-start; gap:14px; padding:16px 20px; border-bottom:1px solid #f5f5f5; cursor:pointer; transition:background 0.15s; }
    .notif-row:last-child { border-bottom:none; }
    .notif-row:hover { background:#fafafa; }
    .notif-row.unread { background:#fffde7; }
    .notif-icon-wrap { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .notif-icon-wrap mat-icon { font-size:20px; width:20px; height:20px; color:#fff; }
    .ic-lock   { background:linear-gradient(135deg,#6a1b9a,#ab47bc); }
    .ic-unlock { background:linear-gradient(135deg,#2e7d32,#66bb6a); }
    .ic-create { background:linear-gradient(135deg,#1565c0,#42a5f5); }
    .ic-default{ background:linear-gradient(135deg,#e65100,#ffa726); }
    .notif-content { flex:1; min-width:0; }
    .notif-title-row { display:flex; align-items:center; gap:8px; margin-bottom:4px; }
    .notif-title { font-size:0.9rem; font-weight:700; color:#212121; }
    .new-tag { background:#e53935; color:#fff; border-radius:8px; padding:1px 7px; font-size:0.7rem; font-weight:700; flex-shrink:0; }
    .notif-msg { font-size:0.82rem; color:#666; line-height:1.4; margin-bottom:6px; }
    .notif-time { display:flex; align-items:center; gap:4px; font-size:0.75rem; color:#bbb; }
    .notif-time mat-icon { font-size:13px; width:13px; height:13px; }

    /* Assignments table */
    .table-card { background:#fff; border-radius:16px; box-shadow:0 2px 12px rgba(0,0,0,0.07); overflow:hidden; }
    .assign-table { width:100%; border-collapse:collapse; }
    .assign-table th { background:#f8f9ff; padding:12px 20px; text-align:left; font-size:0.82rem; font-weight:700; color:#3f51b5; text-transform:uppercase; letter-spacing:0.5px; border-bottom:1px solid #e8eaf6; }
    .assign-table td { padding:12px 20px; font-size:0.9rem; color:#444; border-bottom:1px solid #f5f5f5; }
    .assign-table tr:last-child td { border-bottom:none; }
    .assign-table tr:hover td { background:#fafafa; }
    .subject-chip { background:#e8eaf6; color:#3f51b5; border-radius:8px; padding:3px 10px; font-size:0.82rem; font-weight:600; }
    .section-chip { background:#e8f5e9; color:#2e7d32; border-radius:8px; padding:3px 10px; font-size:0.82rem; font-weight:600; }

    .loading-txt { text-align:center; padding:32px; color:#999; font-size:0.9rem; }
    .empty-notif { text-align:center; padding:36px; color:#bbb; }
    .empty-notif mat-icon { font-size:44px; height:44px; width:44px; display:block; margin:0 auto 8px; color:#e0e0e0; }
    .empty-notif p { margin:0; font-size:0.9rem; }
  `]
})
export class TeacherDashboardComponent implements OnInit {
  username = localStorage.getItem('username') || 'Teacher';
  assignments: TeacherAssignment[] = [];
  displayedColumns = ['subjectName', 'className', 'sectionName'];
  loading = false;
  today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

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
      case 'EXAM_CREATED': return 'event_note';
      default: return 'notifications';
    }
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'EXAM_LOCKED': return 'ic-lock';
      case 'EXAM_UNLOCKED': return 'ic-unlock';
      case 'EXAM_CREATED': return 'ic-create';
      default: return 'ic-default';
    }
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
